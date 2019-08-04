// external
const mongoose = require('mongoose');
// internal
const config = require('../../config.json');
var preferencesList = require('../Data/preferences');
const preferences = require('../Models/preferences');
// local
var exports = module.exports = {};

exports.getPreferences = function(req, res) {
    var query = preferences.where({user: req.params.user})
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
      res.json(preferencesList);
    });
}
exports.upsertPreferences = function(req, res) {
    console.log('Searching For Preferences: ' + req.params.user);
    var query = preferences.where({user: req.params.user})
    query.findOne(async function(err, response){
        if(response){
            //console.log(response)
            console.log('Preferences Found, Updating');
            var data = {
                user: req.params.user,
                systems : req.body.systems,
                device : req.body.device,
                role : req.body.role,
                party_size : req.body.party_size,
                age : req.body.age,
                days_free : req.body.days_free,
                times_free : req.body.times_free,
                distance : req.body.distance,
            }
            var update = await preferences.replaceOne({ _id: response._id }, data);
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
            console.log('No Preferences Found, Adding Preferences');
            var newPreferences = new preferences();
            newPreferences.user = req.params.user;
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
                } else {
                    res.json(addedPreferences);
                }
            })
        }
    })
}
