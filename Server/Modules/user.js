// external
const crypto = require('crypto');
const mongoose = require('mongoose');

// internal
const config = require('../../config.json');
const User = require('../Models/user');
const Utils = require('../Modules/utils');
let Log = Utils.Log();
let Error = Utils.Error();
// local
let exports = module.exports = {};

exports.CreateUser = function(req, res){
    // checkuserexists().then(dostuff)
    User.findOne({username: req.body.username}, function(err, user){
        Log('INFO', "Checking for user: " + req.body.username);
        if(err){
            Error(2, err)
        }
        if(user){
            Log('INFO', "Found User: " + req.body.username)
            res.json({
                "Status": "Error",
                "Error": Error(1),
            })
        } else {
            Log('INFO', "No user found, creating user");
            let newUser = new User();
            newUser.user_id = GenerateUserID();
            newUser.username = req.body.username;
            newUser.display_name = req.body.display_name;
            newUser.password = exports.EncryptPassword(req.body.password); // once we have something that sends us encrypted passwords we should remove this
            newUser.name = {
                first_name : req.body.name.first_name,
                last_name : req.body.name.last_name
            };
            newUser.contact = {
                email : req.body.contact.email,
                telephone : req.body.contact.telephone
            };
            newUser.date_of_birth = req.body.date_of_birth;
            newUser.city = req.body.city;
            newUser.country = req.body.country;
            newUser.location = {
                latitude : req.body.location.latitude,
                longditude : req.body.location.longditude
            };
            newUser.rec_created_at = Date.now();
            newUser.rec_updated_at = Date.now();
            newUser.last_login = Date.now();
            newUser.last_search = null;
            newUser.save(function(err, addedUser) {
              if(err){
                  res.status(500).json({
                      "Status": "Error",
                      "Error": Error(3, err)
                  });
              } else {
                Log('INFO', 'User created successfully');
                res.json({
                    "Status": "Success",
                    "Message": "Created User",
                    "Token": exports.CreateAccessToken(addedUser.username),
                    "Data": addedUser // we don't need to return the user we just added
                });
              }
            })

        }
    })
}

exports.UserLogin = function(req, res){
    if(CheckUserExists(req.params.username)){
        if(ValidatePassword(req.params.username, req.params.password)){
            let access_token = exports.CreateAccessToken(username);
        } else {
            res.json({
                "Status": "Error",
                "Error": Error(6, err)
            })
        }
    } else {
        res.json({
            "Status": "Error",
            "Error": Error(5, err)
        })
    }
    return access_token;
}

exports.GetUserData = function(req, res){


}

exports.UserAuthentication = function(username, access_token){
    let decrypted_token = exports.DecryptAccessToken(access_token);
    if(ValidateAccessToken(username, decrypted_token)){
        let result = true;
    } else {
        let result = false;
    }
    return result;
}

// not needed as the FE will be sending us encrypted passwords
exports.EncryptPassword = function(password){
    let mykey = crypto.createCipher('aes-128-cbc', config.passwordEncryptionKey);
    let encryptedPassword = mykey.update(password, 'utf8', 'hex')
    encryptedPassword += mykey.final('hex');
    return encryptedPassword;
}

// not needed as we won't be decrypting passwords
exports.DecryptPassword = function(password){
    let mykey = crypto.createDecipher('aes-128-cbc', config.passwordEncryptionKey);
    let decryptedPassword = mykey.update(password, 'hex', 'utf8')
    decryptedPassword += mykey.final('utf8');
    return decryptedPassword;
}

exports.DecryptAccessToken = function(access_token){
    let mykey = crypto.createDecipher('aes-128-cbc', config.accessTokenEncryptionKey);
    let decryptedAccessToken = mykey.update(access_token, 'hex', 'utf8')
    decryptedAccessToken += mykey.final('utf8');
    return decryptedAccessToken;
}

exports.CreateAccessToken = function(username){
    let temp_token = "";
    let date = Date.now();
    temp_token += secret;
    temp_token += date;
    temp_token += username;
    // make sure what we're setting in the access key is also what we scheck against in the db
    User.where({username: username}).update({last_login: date});

    let mykey = crypto.createCipher('aes-128-cbc', config.accessTokenEncryptionKey);
    let access_token = mykey.update(temp_token, 'utf8', 'hex')
    access_token += mykey.final('hex');
    return access_token;
}

exports.ValidateAccessToken = function (username, access_token){
    let decrypted_token = exports.DecryptAccessToken(access_token)
    let used_secret = decrypted_token.substr(0,7);
    let used_date = decrypted_token.substr(8,16); // todo get date string length
    let used_username = decrypted_token.substr(17,access_token.length);

    if(used_secret == config.secret && used_date == GetLastLoginDate(username) && Utils.CheckDateTimeout(used_date, config.tokenTimeOut) && CheckUserExists(used_username)){
        let result = true;
    } else {
        let result = false;
        Log('ERROR', "User attempted to use an invalid access token: " + username);
    }

    return result;
}

function CheckUserExists(username){
    utils.Log('INFO', "Checking for user: " + username);
    User.findOne({username: username}, function(err, user){
        if(err){
            Error(8, err);
        }
        if(user){
            Log('INFO', "Found User: " + username)
            return true;
        } else {
            Log('INFO', "User Not Found");
            return false;
        }
    })
    return result;
}

function GetLastLoginDate(username){


}

function ValidatePassword(username, password){

}
