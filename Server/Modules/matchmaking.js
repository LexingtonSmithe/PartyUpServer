// external
const mongoose = require('mongoose');
// internal
const Group = require('../Models/group');
const User = require('../Models/user');
const Preferences = require('../Models/preferences');
const user = require('../Modules/user');
const preferences = require('../Modules/preferences');
const utils = require('../Modules/utils');
const Log = utils.Log;
const Error = utils.Error;

// local
module.exports = {
    GetMatches : async function(req, res){
        let list_of_active_players = [];
        let list_of_active_player_preferences = [];
        let requestor_preferences = {};

        try{
            let activate_user = await SetActivePlayer(req.headers.username);
        }
        catch(error){
            return res.status(500).json({
                "status": "Error",
                "message": Error(19)
            });
        }

        try {
            list_of_active_players = await GetActivePlayers();
            // remove yourself from the list
            list_of_active_players.splice(list_of_active_players.indexOf(req.headers.username), 1)
        }
        catch(error){
            return res.status(500).json({
                "status": "Error",
                "message": Error(18, error)
            });
        }

        if(!list_of_active_players || list_of_active_players == null){
            return res.json({
                "status": "Success",
                "message": "No Active Users Found?"
            });
        }

        try{
            list_of_active_player_preferences = await preferences.GetListOfUserPreferences(list_of_active_players);
        }
        catch(error){
            return res.status(500).json({
                "status": "Error",
                "message": Error(18, error)
            });
        }

        try {
            requestor_preferences = await preferences.RetrieveUserPreferences(req.headers.username)
        }
        catch(error){
            return res.status(500).json({
                "status": "Error",
                "message": Error(3, error)
            });
        }

        let players = await this.CreateListOfCompatiblePlayers(requestor_preferences, list_of_active_player_preferences);

        return res.json({
            "status": "Success",
            "original count": list_of_active_players.length,
            "filtered count": players.length,
            "data": players
        })

    },

    SearchForMatches : async function(req, res){
        Log('INFO', "Searching For Groups: " + req.headers.username);
        let active_player = false;

        try{
            active_player = await SetActivePlayer(req.headers.username);
        }
        catch(error){
            return res.status(500).json({
                "status": "Error",
                "message": Error(19)
            });
        }

        if(active_player){
            return res.json({
                "status": "Success",
                "message": "Player Set To Active"
            });
        } else {
            return res.status(404).json({
                "status": "Error",
                "message": "User Not Found"
            });
        }
        /*
            Begin search
        */

    },

    CreateListOfCompatiblePlayers: async function (requestor_preferences, list_of_multiple_preferences){
        // Log('INFO', "Creating List Of Compatible Players From: " + JSON.stringify(preferences, 0, 4));
        // Log('INFO', "Example User: " + list_of_active_players[0])

        Log('INFO', "Creating List Of Compatible Players");

        let filtered_list = list_of_multiple_preferences;
        Log('INFO', "Filtering out users with device differences: " + filtered_list.length);
        filtered_list = await this.RemoveUsersFromPreferencesListWithNoMatchingPreferences('device', filtered_list, requestor_preferences.device);

        Log('INFO', "Filtering out users with systems differences: " + filtered_list.length);
        filtered_list = await this.RemoveUsersFromPreferencesListWithNoMatchingPreferences('systems', filtered_list, requestor_preferences.systems);

        Log('INFO', "Filtering out users with party_size differences: " + filtered_list.length);
        filtered_list = await this.RemoveUsersFromPreferencesListWithNoMatchingPreferences('party_size', filtered_list, requestor_preferences.party_size);

        Log('INFO', "Filtering out users with days_available differences: " + filtered_list.length);
        filtered_list = await this.RemoveUsersFromPreferencesListWithNoMatchingPreferences('days_available', filtered_list, requestor_preferences.days_available);

        Log('INFO', "Final count of matches: " + filtered_list.length);
        return filtered_list;

    },

    RemoveUsersFromPreferencesListWithNoMatchingPreferences: function (preference_key, array, comparison_array){
        Log('INFO', "Comparing Values Against: " + comparison_array);
        let resulting_array = [];
        let users_removal_list = [];
        for(var i = 0; i < array.length; i++){
            //Log('INFO', "The Users " + preference_key + " Preferences: " + comparison_array);
            //Log('INFO', array[i].username + " Preferences: " + array[i][preference_key]);
            let preference_removal_list = [];
            for(var j = 0; j < array[i][preference_key].length; j++){
                if(!comparison_array.includes(array[i][preference_key][j])){
                    preference_removal_list.push(array[i][preference_key][j]);
                }
            }
            if(preference_removal_list.length > 0){
                //Log('INFO', "Removal List will remove: " + preference_removal_list + " from " + array[i][preference_key]);
                for(let k = 0; k < preference_removal_list.length; k++){
                    array[i][preference_key].splice(array[i][preference_key].indexOf(preference_removal_list[k]), 1);
                }
            }
            //Log('INFO', "Result for : " + array[i].username + " -> " + array[i][preference_key]);
            if(!array[i][preference_key][0]){
                // Log('INFO', "Adding User to users_removal_list: " + array[i].username );
                users_removal_list.push(array[i].username);
            }
        }
        if(users_removal_list.length > 0){
            for(let x = 0; x < users_removal_list.length; x++){
                //Log('INFO', "Removing User: " + users_removal_list[x]);
                array = array.filter(function(obj){
                    return obj.username !== users_removal_list[x]
                })
            }
        }
        Log('INFO', "Players removed from results based on: " + preference_key + " : " + users_removal_list.length);
        resulting_array = array;
        return resulting_array;
    },

    SetInactiveSearchForPlayersWithExpiredSearch : async function(){
        let list_of_players = await GetActivePlayers();
        // TODO
    }
};

function GetActivePlayers(){
    return new Promise((resolve, reject) => {
        User.find({active_search: true}, function(err, users){
            if(users) {
                Log('INFO', "Found Active Users: " + users.length);
                // Just harvest the usernames
                let list_of_usernames = []
                for(let i=0; i < users.length; i++){
                    list_of_usernames.push(users[i].username);
                }
                return resolve(list_of_usernames);
            } else {
                Log('INFO', "User does not exist");
                return resolve(false);
            }
            if(err){
                return reject(Error(8, err));
            }
        })
    })
}

function SetActivePlayer(username){
    Log('INFO', "Setting Player Search To Active: " + username);
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate({username: username}, {active_search: true}, function(err, user){
            if(user){
                Log('INFO', "Set Users Search To Active: " + username);
                resolve(true);
            } else {
                Log('INFO', "User does not exist");
                resolve(false);
            }
            if(err){
                reject(Error(8, err));
            }
        })
    })
}

function roughoutline() {
    // get users preferences

    // --------------------------------------------------------------------- start of matching

    // check for groups looking for players
        // check roles free against preferences
        // check groups party_size limit against users preferences
        // check groups age_range against user preferences
        // check groups location against user preferences (location module)
        // check groups device against user preferences
        // check groups Times_Free against user preferences (dateTime module)
        // check groups Days_Free against user preferences (dateTime module)

    // get all users who have an active search
        // check location against user preferences (location module)
        // check device against user preferences
        // check age_range against user preferences
        // check days_Free against user preferences (dateTime module)
        // check times_Free against user preferences (dateTime module)
        // check roles of remaining matches
            // create list of players
            // create list of dms
        // create matched player pair
            // create composite preferences of pair
            // check second user from second pair matches composite preferences and delete second pairing
                // update matched pairing composite preferences
            // repeat until max_party size limit reached
        // assigning dm to group
            // check DM's preferences against matched pairings composite Preferences
            // create compatibility score
            // assign DM to group from list with highest compatibilty score

    // creating matches
        // check if same group already exists and delete match
        // create composite group preferences
        // create matches

    // --------------------------------------------------------------------- end of matching

    // --------------------------------------------------------------------- start of match management

    // get matches that user is a member of
        // check if preferences have changed since last search and delete matches
        // check if any players have failed to search (inactive) in the last X days and delete matches
        // check matches composite preferences against users and assign compatibility score
        // check number of other users 'ready' status

        // return matches

    // submit 'ready up' to matched group
        // check other users 'ready up' status in match
            // create group (group module)

    // submit decline to matched group
        // delete matched grouping

    // --------------------------------------------------------------------- end of match management
}
