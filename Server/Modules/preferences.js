// external
const mongoose = require('mongoose');
// internal
const config = require('../../config.json');
const Preferences = require('../Models/preferences');
const User = require('../Models/user');
const user = require('../Modules/user');
const Utils = require('../Modules/utils');
const Log = Utils.Log;
const Error = Utils.Error;
const defaultPreferencesList = require('../Data/preferences');
// local
var exports = module.exports = {};

exports.GetUserPreferences = function(username){
    Log('INFO', "Searching for preferences for user: " + username);
    return new Promise((resolve, reject) => {
        let query = Preferences.where({username: username})
        query.findOne(function(err, response){
            if(response) {
                resolve(response)
            }
            if(err){
                reject(Error(8, err));
            }
        })
    })
}

exports.GetPreferences = async function(req, res) {
    let username = req.params.username;
    await this.GetUserPreferences(username)
    .then((response) => {
        let message = "";
        let preferencesList = {};
        if(response != null){
            preferencesList.systems = response.systems;
            preferencesList.role = response.role;
            preferencesList.days_free = response.days_free;
            preferencesList.times_free = response.times_free_start;
            preferencesList.times_free = response.times_free_end;
            preferencesList.party_size = response.party_size;
            preferencesList.age = response.age;
            preferencesList.distance = response.distance;
            Log('INFO', "Preferences Found");
            message = "Preferences Found";
        } else {
            Log('INFO', "No Preferences Found");
            message = "User preferences not found"
        }
        res.json({
            "Status": "Success",
            "Message": message,
            "Data": preferencesList
        })
    })
    .catch((err) => {
        res.status(500).json({
            "Status": "Error",
            "Error": Error(9, err)
        })
    });
}

exports.GetPreferencesList = async function(req, res) {
    if(req.params.username){
        let userExists = await user.CheckUserExists(req.params.username);
        // TODO: once login is sorted we can remove the user check as they'll be logged in at this point
        if(userExists){
            let username = req.params.username;
            await this.GetUserPreferences(username)
            .then((response) => {
                let message = "Preferences Found";
                let preferencesList = defaultPreferencesList;
                if(response != null){
                    preferencesList.systems.default = response.systems;
                    preferencesList.device.default = response.device;
                    preferencesList.role.default = response.role;
                    preferencesList.days_free.default = response.days_free;
                    preferencesList.times_free.default_start_time = response.times_free_start;
                    preferencesList.times_free.default_end_time = response.times_free_end;
                    preferencesList.party_size.default = response.party_size;
                    preferencesList.age.default = response.age;
                    preferencesList.distance.default = response.distance;
                    Log('INFO', "Preferences Found: Adding Preset Values");
                } else {
                    Log('INFO', "No Preferences Found");
                    message = "User preferences not found"
                }
                res.json({
                    "Status": "Success",
                    "Message": "Users default preferences added to list",
                    "Data": preferencesList
                })
            })
            .catch((err) => {
                res.status(500).json({
                    "Status": "Error",
                    "Error": Error(9, err)
                })
            });
        } else {
            res.json({
                "Status": "Error",
                "Message": "User provided doesn't exist, but here's the list anyways",
                "Data": defaultPreferencesList
            })
        }
    } else {
        res.json({
            "Status": "Success",
            "Message": "Default Preferences List",
            "Data": defaultPreferencesList
        })
    }
}

exports.UpsertPreferences = function(req, res) {
    User.findOne({username: req.params.username}, function(err, result){
        if(err){
            Error(8, err);
        }
        if(result){
            Log('INFO', 'Searching For Preferences: ' + req.params.username);
            let query = Preferences.where({username: req.params.username})
            query.findOne(async function(err, response){
                if(err){
                    Error(8, err);
                }
                if(response){
                    //Log('INFO', response)
                    Log('INFO', 'Preferences Found, Updating');
                    let data = {
                        username: req.params.username,
                        systems : req.body.systems,
                        device : req.body.device,
                        role : req.body.role,
                        party_size : req.body.party_size,
                        age : req.body.age,
                        days_free : req.body.days_free,
                        times_free : req.body.times_free,
                        distance : req.body.distance,
                    }
                    let update = await Preferences.replaceOne({ _id: response._id }, data);
                    if(update.nModified == 1){
                        res.json({
                            "Status": "Success",
                            "Message": "Successfully updated user preferences",
                            "Data": data
                        })
                    } else {
                        res.status(500).json({
                            "Status": "Error",
                            "Error" : Error(1)
                        })
                    }
                } else {
                    Log('INFO', "No Preferences Found")
                    Log('INFO', "Adding Preferences");
                    let newPreferences = new Preferences();
                    newPreferences.username = req.params.username;
                    newPreferences.systems = req.body.systems;
                    newPreferences.device = req.body.device;
                    newPreferences.role = req.body.role;
                    newPreferences.party_size = req.body.party_size;
                    newPreferences.age = req.body.age;
                    newPreferences.days_free = req.body.days_free;
                    newPreferences.times_free = req.body.times_free;
                    newPreferences.distance = req.body.distance;
                    newPreferences.save(function(err, addedPreferences){
                        if(err){
                            res.status(500).json({
                                "Status": "Error",
                                "Error": Error(4, err)
                            });
                        } else {
                            Log('INFO', "Preferences added successfully");
                            res.json({
                                "Status": "Success",
                                "Message": "Successfully updated user preferences",
                                "Data": addedPreferences
                            })
                        }
                    })
                }
            })
        }
    })
}
