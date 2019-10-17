// external
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const config = require('../../config.json');

// internal
const preferences = require('../Modules/preferences');
const user = require('../Modules/user');
const utils = require('../Modules/utils');
const Log = utils.Log;
const Error = utils.Error;

// local
mongoose.Promise = global.Promise;
module.exports = router;

mongoose.connect(config.mongoURL, {useNewUrlParser: true}, function(err){
  if(err){
    Error(7, err);
  } else {
    Log('INFO', 'Connected to MongoDB');
  }
})

//----testing----


//---------------

// -------------------------- USER
router.post('/user', function(req, res){
  Log('INFO', 'Adding User: ' + req.body.username);
  user.CreateUser(req, res);
});

router.post('/user/login', function(req, res){
  Log('INFO', 'Logging In: ' + req.params.username);
  user.UserLogin(req, res);
});

router.get('/user/profile', function(req, res){
  Log('INFO', 'Logging In: ' + req.params.username);
  user.GetUserProfile(req, res);
});

// ------------------------- PREFERENCES
router.get('/preferences/list', function(req, res){
    Log('INFO', 'Requesting Preferences');
    preferences.GetPreferencesList(req, res);
});

router.get('/preferences/:username', function(req, res){
    Log('INFO', 'Requesting Preferences');
    preferences.GetPreferences(req, res);
});

router.post('/preferences/:username', function(req, res){
    preferences.UpsertPreferences(req, res);
});

// ------------------------- OTHER
router.get('/health', async function(req, res){
    var db = "Not Connected";
    Log('INFO', "Health Checked");
    if(mongoose.connection.readyState == 1){
        db = {
            name: mongoose.connection.name,
            state: "Connected"
        }
        res.json({
                "Status": "OK",
                "Message": "Everything seems tickety-boo",
                "Database": db
        })
    } else {
        res.json({
                "Status": "Error",
                "Error": Error(7),
        });
    }
})
