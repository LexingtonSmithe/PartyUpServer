// external
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const config = require('../../config.json');

// internal
const preferences = require('../Modules/preferences');

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



router.post('/user', function(req, res){
  console.log('Adding User: ' + req.params.user_id);
  user.createUser(req, res);
});


router.get('/preferences/:user', function(req, res){
    console.log('Requesting Preferences');
    preferences.getPreferences(req, res);
});

router.post('/preferences/:user', function(req, res){
    preferences.upsertPreferences(req, res);
});


router.get('/health', function(req, res){
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
            "database": db
        }
    )
})
