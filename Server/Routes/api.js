// external
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const config = require('../../config.json');

// internal
const preferences = require('../Modules/preferences');
const user = require('../Modules/user');
const utils = require('../Modules/utils');

// local
mongoose.Promise = global.Promise;
module.exports = router;

mongoose.connect(config.mongoURL, {useNewUrlParser: true}, function(err){
  if(err){
    utils.Log('INFO', 'Connection Error');
  } else {
    utils.Log('INFO', 'Connected to MongoDB');
  }
})

//----testing----


//---------------


router.post('/user', function(req, res){
  utils.Log('INFO', 'Adding User: ' + req.body.username);
  user.CreateUser(req, res);
});

router.post('/user/login', function(req, res){
  utils.Log('INFO', 'Logging In: ' + req.params.username);
  user.UserLogin(req, res);
});



router.get('/preferences/:username', function(req, res){
    utils.Log('INFO', 'Requesting Preferences');
    preferences.GetPreferences(req, res);
});

router.post('/preferences/:username', function(req, res){
    preferences.UpsertPreferences(req, res);
});


router.get('/health', async function(req, res){
    var db = "Not Connected";
    utils.Log('INFO', "Health Checked");
    if(mongoose.connection.readyState == 1){
        db = {
            name: mongoose.connection.name,
            state: "Connected"
        }
    }
    res.json(
        {
            "message": "Server Is Up",
            "database": db,
        }
    )
})
