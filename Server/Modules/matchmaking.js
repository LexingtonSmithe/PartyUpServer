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
        try {
            let list_of_players = await GetActivePlayers();
            if(list_of_players){
                return res.json({
                    "status": "Success",
                    "message": list_of_players.length
                });
            } else {
                return res.json({
                    "status": "Success",
                    "message": "No Active Users Found"
                });
            }
        }
        catch(error){
            return res.status(500).json({
                "status": "Error",
                "message": "Some bullshit: " + error
            });
        }


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
                "message": "Some bullshit: " + error
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
                return resolve(users);
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
