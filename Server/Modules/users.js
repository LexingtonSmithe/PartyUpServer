// external
const crypto = require('crypto');
const mongoose = require('mongoose');
// internal
const config = require('../../config.json');
const user = require('../Models/user');
// local
var exports = module.exports = {};
var secret = config.secret;

exports.createUser = function(req, res){
    var newUser = new user();
    newUser.user_id = req.params.user_id;
    newUser.systems = req.body.systems;
    newUser.device = req.body.device;
    newUser.role = req.body.role;
    newUser.party_size = req.party_size.genre;
    newUser.age = req.body.age;
    newUser.days_free = req.body.days_free;
    newUser.times_free = req.body.times_free;
    newUser.distance = req.body.distance;
    var options = { upsert: true }
    newPreferences.findOneAndUpdate(req.params.user_id, options, function(err, addedPreferences) {
      if(err){
        console.log('Error adding the preferences');
        console.log(err);
      } else {
        res.json(addedPreferences);
      }
    })
}

exports.userLogin = function(username, password){
    if(CheckUserExists(username)){
        // decrypt password
        var decrypted_password = DecryptPassword(username,password);
        // validate password
        if(ValidatePassword(username, decrypted_password)){
            var access_token = CreateAccessToken(username);
        };
    }
    return access_token;
}

exports.userAuthentication = function(username, access_token){
    // decrypt access_token
    var decrypted_token = DecryptAccessToken(username, access_token);
    // validate access_token
    if(ValidateAccessToken(decrypted_token)){
        var result = true;
    } else {
        var result = false;
    }
    return result
}

function DecryptPassword(username, password){
    var mykey = crypto.createDecipher('aes-128-cbc', username);
    var decryptedPassword = mykey.update(password, 'hex', 'utf8')
    decryptedPassword += mykey.update.final('utf8');
    return decryptedPassword;
}

function DecryptAccessToken(username, access_token){
    var mykey = crypto.createDecipher('aes-128-cbc', username);
    var decryptedAccessToken = mykey.update(access_token, 'hex', 'utf8')
    decryptedAccessToken += mykey.update.final('utf8');
    return decryptedAccessToken;
}

function CreateAccessToken(username){
    var temp_token = "";
    temp_token += secret;
    temp_token += date;
    temp_token += username;

    var mykey = crypto.createCipher('aes-128-cbc', 'mypassword');
    var access_token = mykey.update(temp_token, 'utf8', 'hex')
    access_token += mykey.update.final('hex');

    return access_token;
}

function ValidateAccessToken(access_token){
    var used_secret = access_token.substr(0,7);
    var used_date = access_token.substr(8,16); // todo get date string length
    var used_username = access_token.substr(17,access_token.length);

    if(used_secret == secret && used_date == GetLastLoginDate(username) && utils.checkDateTimeout(used_date, 3) && CheckUserExists(used_username)){
        var result = true;
    } else {
        var result = false;
    }

    return result;
}

function CheckUserExists(username){

}

function GetLastLoginDate(username){

}

function ValidatePassword(username, password){

}
