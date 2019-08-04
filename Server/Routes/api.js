// external
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const config = require('../../config.json');

// internal
const preferences = require('../Modules/preferences');
const user = require('../Modules/user');

// local
mongoose.Promise = global.Promise;
module.exports = router;

mongoose.connect(config.mongoURL, {useNewUrlParser: true}, function(err){
  if(err){
    console.log('Connection Error');
  } else {
    console.log('Connected to MongoDB');
  }
})

//----testing----


//---------------


router.post('/user', function(req, res){
  console.log('Adding User: ' + req.body.username);
  user.createUser(req, res);
});


router.get('/preferences/:username', function(req, res){
    console.log('Requesting Preferences');
    preferences.getPreferences(req, res);
});

router.post('/preferences/:username', function(req, res){
    preferences.upsertPreferences(req, res);
});


router.get('/health', async function(req, res){
    var db = "Not Connected";
    console.log("Health Checked");
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
