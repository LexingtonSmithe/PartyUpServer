// external
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const config = require('../../config.json');

// internal
const preferences = require('../Modules/preferences');
const user = require('../Modules/user');
const utils = require('../Modules/utils');
const auth = require('../Modules/authentication');
const ClosedAuth = auth.ClosedAuthenticationMiddleware;
const OpenAuth = auth.OpenAuthenticationMiddleware;
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

mongoose.set('useFindAndModify', false);
//----testing----


// -------------------------- AUTH
router.post('/auth/login', function(req, res){
  Log('INFO', 'Logging In: ' + req.body.username);
  auth.UserLogin(req, res);
});

// -------------------------- USER
//CREATE
router.post('/user', function(req, res){
  Log('INFO', 'Adding User: ' + req.body.username);
  user.CreateUser(req, res);
});
//READ
router.get('/user/profile', OpenAuth, function(req, res){
  Log('INFO', 'Getting User Data: ' + req.headers.username);
  user.GetUser(req, res);
});
//UPDATE
router.post('/user/update', ClosedAuth, function(req, res){
  Log('INFO', 'Updating User: ' + req.headers.username);
  user.UpdateUser(req, res);
});
//DELETE
router.delete('/user/delete', OpenAuth, function(req, res){
  Log('INFO', 'Updating User: ' + req.headers.username);
  user.DeleteUser(req, res);
});


// ------------------------- PREFERENCES
router.get('/preferences/list/', OpenAuth, function(req, res){
    Log('INFO', 'Requesting Preferences');
    preferences.GetPreferencesList(req, res);
});

router.get('/preferences/', ClosedAuth, function(req, res){
    Log('INFO', 'Requesting Preferences');
    preferences.GetPreferences(req, res);
});

router.post('/preferences/', ClosedAuth, function(req, res){
    Log('INFO', 'Submitting Preferences');
    preferences.SubmitPreferences(req, res);
});

// ------------------------- OTHER
router.get('/health', async function(req, res){
    Log('INFO', "Health Checked");
    if(mongoose.connection.readyState == 1){
        let db = {
            name: mongoose.connection.name,
            state: "Connected",
        }
        let numberOfUsers = await user.NumberOfUsers();
        let metrics = {
            users: numberOfUsers
        }
        let data = {
            "Database": db,
            "Metrics": metrics
        }
        Log('INFO', "Health Check: ", data)
        res.json({
                "Status": "OK",
                "Message": "Everything seems tickety-boo",
                "Data": data
        })
    } else {
        res.json({
                "Status": "Error",
                "Error": Error(7),
        });
    }
})
