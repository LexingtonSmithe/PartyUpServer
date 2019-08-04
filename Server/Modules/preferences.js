// external
const mongoose = require('mongoose');
// internal
const config = require('../../config.json');
var preferencesList = require('../Data/preferences');
const Preferences = require('../Models/preferences');
const User = require('../Models/user');
// local
var exports = module.exports = {};

exports.getPreferences = function(req, res) {
    var query = Preferences.where({username: req.params.username})
    query.findOne(function(err, response){
      if(response){
          //console.log(response);
          console.log("Preferences Found: Adding Preset Values");
          preferencesList.systems.default = response.systems;
          preferencesList.role.default = response.role;
          preferencesList.days_free.default = response.days_free;
          preferencesList.times_free.default_start_time = response.times_free_start;
          preferencesList.times_free.default_end_time = response.times_free_end;
          preferencesList.party_size.default = response.party_size;
          preferencesList.age.default = response.age;
          preferencesList.distance.default = response.distance;
      } else {
          console.log("No Preferences Found");
      }
      res.json({
          "Status": "Success",
          "Message": "User preferences not found",
          "Data": preferencesList
      })
    });
}

exports.upsertPreferences = function(req, res) {
    User.findOne({username: req.params.username}, function(err, result){
        if(err){
            console.log(err)
        }
        if(result){
            console.log('Searching For Preferences: ' + req.params.username);
            var query = Preferences.where({username: req.params.username})
            query.findOne(async function(err, response){
                if(response){
                    //console.log(response)
                    console.log('Preferences Found, Updating');
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
                            "Updated": "Success",
                            "Data": data
                        })
                    } else {
                        res.json({
                            "Status": "Error",
                            "Message": "Unable to update record"
                        })
                    }

                } else {
                    console.log("No Preferences Found")
                    console.log("Adding Preferences");
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
                            console.log(err);
                            console.log("Failed to add preferences");
                        } else {
                            res.json(addedPreferences);
                            console.log("Preferences added successfully");
                        }
                    })
                }
            })
        }
    })
}
