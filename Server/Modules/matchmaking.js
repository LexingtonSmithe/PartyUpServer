// external
const mongoose = require('mongoose');
// internal
const Group = require('../Models/group');
const Preferences = require('../Models/preferences');
const User = require('../Models/user');
const Utils = require('../Modules/utils');
const Log = Utils.Log;
const Error = Utils.Error;

// local
var exports = module.exports = {};

exports.SearchForGroups = function(req, res){

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
