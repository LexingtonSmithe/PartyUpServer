// external
const mongoose = require('mongoose');
// internal
const config = require('../../config.json');
const Preferences = require('../Models/preferences');
const User = require('../Models/user');
const Utils = require('../Modules/utils');
const Log() = Utils.Log;
const Error() = Utils.Error;
var preferencesList = require('../Data/preferences');
// local
var exports = module.exports = {};

exports.GetPreferencesList = function(req, res) {
    var query = Preferences.where({username: req.params.username})
    query.findOne(function(err, response){
        if(err){
            res.status(500).json({
                "Status": "Error",
                "Error": Error(8, err)
            })
        }
        if(response){
            //utils.Log('INFO', response);
            Log('INFO', "Preferences Found: Adding Preset Values");
            preferencesList.systems.default = response.systems;
            preferencesList.role.default = response.role;
            preferencesList.days_free.default = response.days_free;
            preferencesList.times_free.default_start_time = response.times_free_start;
            preferencesList.times_free.default_end_time = response.times_free_end;
            preferencesList.party_size.default = response.party_size;
            preferencesList.age.default = response.age;
            preferencesList.distance.default = response.distance;
        } else {
            Log('INFO', "No Preferences Found");
        }
        res.json({
            "Status": "Success",
            "Message": "User preferences not found",
            "Data": preferencesList
        })
    });
}

exports.GetPreferences = function(req, res) {
    var query = Preferences.where({username: req.params.username})
    query.findOne(function(err, response){
        if(err){
            res.status(500)json({
                "Status": "Error",
                "Error": Error(8, err);
            })
        }
        if(response){
            res.json({
              "Status": "Success",
              "Message": "User preferences found",
              "Data": response
            })
        } else {
            res.json({
              "Status": "Error",
              "Error": Error(9, err);
            })
          })
        }
    });
}

exports.UpsertPreferences = function(req, res) {
    User.findOne({username: req.params.username}, function(err, result){
        if(err){
            Error(8, err);
        }
        if(result){
            Log('INFO', 'Searching For Preferences: ' + req.params.username);
            var query = Preferences.where({username: req.params.username})
            query.findOne(async function(err, response){
                if(err){
                    Error(8, err);
                }
                if(response){
                    //utils.Log('INFO', response)
                    Log('INFO', 'Preferences Found, Updating');
                    var data = {
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
                    var update = await Preferences.replaceOne({ _id: response._id }, data);
                    if(update.nModified == 1){
                        res.json({
                            "Status": "Success",
                            "Message": "Successfully updated user preferences",
                            "Data": data
                        })
                    } else {
                        res.status(500).json({
                            "Status": "Error",
                            "Error" : Error(1);
                        })
                    }
                } else {
                    Log('INFO', "No Preferences Found")
                    Log('INFO', "Adding Preferences");
                    var newPreferences = new Preferences();
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
                                "Error": Error(4, err);,
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
