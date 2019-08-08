// external
const mongoose = require('mongoose');
// internal
const Group = require('../Models/group');
const Preferences = require('../Models/preferences');
const User = require('../Models/user');
const Utils = require('../Modules/utils');
const Log() = Utils.Log;
const Error() = Utils.Error;

// local
var exports = module.exports = {};

exports.SearchForGroups = function(req, res){

}

// get users preferences

// --------------------------------------------------------------------- start of matching

// check for groups looking for players
    // check roles free against preferences
    // check groups age_range against user preferences
    // check groups location against user preferences (location module)
    // check groups device against user preferences
    // check groups Times_Free against user preferences (dateTime module)
    // check groups Days_Free against user preferences (dateTime module)

// get all users who have an active search
    // check location against user preferences (location module)
    // check device against user preferences
    // assign roles against user preferences
    // check age_range against user preferences
    // check days_Free against user preferences (dateTime module)
    // check times_Free against user preferences (dateTime module)

// creating matches
    // check if same group already exists and ignore pairing
    // create composite group preferences based around time/system
    // create matches

// --------------------------------------------------------------------- end of matching

// --------------------------------------------------------------------- start of match management

// get matches that user is a member of
    // sort by number of other users 'ready' status
    // check if preferences have changed since last search and delete matches
    // check if any players have failed to search in the last X days and delete matches
    // return matches

// submit 'ready up' to matched group
    // check other users 'ready up' status in match
        // create group (group module)

// submit decline to matched group
    // delete matched grouping

// --------------------------------------------------------------------- end of match management
