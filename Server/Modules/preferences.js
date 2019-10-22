// external
const mongoose = require('mongoose');
// internal
const config = require('../../config.json');
const Preferences = require('../Models/preferences');
const User = require('../Models/user');
const user = require('./user');
const utils = require('./utils');
const auth = require('./authentication');
const Log = utils.Log;
const Error = utils.Error;
const defaultPreferencesList = require('../Data/preferences');
// local
module.exports = {
    GetUserPreferences : function(username){
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
    },

    GetPreferences : async function(req, res) {
        let username = req.headers.username;
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
                "status": "Success",
                "message": message,
                "data": preferencesList
            })
        })
        .catch((err) => {
            res.status(500).json({
                "status": "Error",
                "error": Error(9, err)
            })
        });
    },
    
    GetPreferencesList : async function(req, res) {
        let username = req.headers.username;
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
                "status": "Success",
                "message": "Users default preferences added to list",
                "data": preferencesList
            })
        })
        .catch((err) => {
            res.status(500).json({
                "status": "Error",
                "error": Error(9, err)
            })
        });
    },

    UpsertPreferences : function(req, res) {

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
                                "status": "Success",
                                "message": "Successfully updated user preferences",
                                "data": data
                            })
                        } else {
                            res.status(500).json({
                                "status": "Error",
                                "error" : Error(1)
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
                                    "status": "Error",
                                    "error": Error(4, err)
                                });
                            } else {
                                Log('INFO', "Preferences added successfully");
                                res.json({
                                    "status": "Success",
                                    "message": "Successfully updated user preferences",
                                    "data": addedPreferences
                                })
                            }
                        })
                    }
                })
            }
        })
    }
};
