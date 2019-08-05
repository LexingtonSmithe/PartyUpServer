// external
const crypto = require('crypto');
const mongoose = require('mongoose');
const uuidv1 = require('uuid/v1');
// internal
const config = require('../../config.json');
const utils = require('../Modules/utils');
const User = require('../Models/user');
// local
var exports = module.exports = {};
var secret = config.secret;

exports.CreateUser = function(req, res){
    User.findOne({username: req.body.username}, function(err, user){
        utils.Log('INFO', "Checking for user: " + req.body.username);
        if(err){
            utils.Error(2, err)
        }
        if(user){
            utils.Log('INFO', "Found User: " + req.body.username)
            res.json({
                "Status": "Error",
                "Error": utils.Error(1),
            })
        } else {
            utils.Log('INFO', "No user found, creating user");
            var newUser = new User();
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
                  res.json({
                      "Status": "Error",
                      "Error": utils.Error(3, err)
                  });
              } else {
                utils.Log('INFO', 'User created successfully');
                res.json({
                    "Status": "Success",
                    "Message": "Created User",
                    "Token": exports.CreateAccessToken(addedUser.username),
                    "Data": addedUser
                });
              }
            })

        }
    })
}

exports.UserLogin = function(req, res){
    if(CheckUserExists(req.params.username)){
        if(ValidatePassword(req.params.username, req.params.password)){
            var access_token = exports.CreateAccessToken(username);
        } else {
            res.json({
                "Status": "Error",
                "Error": utils.Error(6, err)
            })
        }
    } else {
        res.json({
            "Status": "Error",
            "Error": utils.Error(5, err)
        })
    }
    return access_token;
}

exports.UserAuthentication = function(username, access_token){
    var decrypted_token = exports.DecryptAccessToken(access_token);
    if(ValidateAccessToken(username, decrypted_token)){
        var result = true;
    } else {
        var result = false;
    }
    return result;
}


exports.EncryptPassword = function(password){
    var mykey = crypto.createCipher('aes-128-cbc', config.passwordEncryptionKey);
    var encryptedPassword = mykey.update(password, 'utf8', 'hex')
    encryptedPassword += mykey.final('hex');
    return encryptedPassword;
}

exports.DecryptPassword = function(password){
    var mykey = crypto.createDecipher('aes-128-cbc', config.passwordEncryptionKey);
    var decryptedPassword = mykey.update(password, 'hex', 'utf8')
    decryptedPassword += mykey.final('utf8');
    return decryptedPassword;
}

exports.DecryptAccessToken = function(access_token){
    var mykey = crypto.createDecipher('aes-128-cbc', config.accessTokenEncryptionKey);
    var decryptedAccessToken = mykey.update(access_token, 'hex', 'utf8')
    decryptedAccessToken += mykey.final('utf8');
    return decryptedAccessToken;
}

exports.CreateAccessToken = function(username){
    var temp_token = "";
    var date = Date.now();
    temp_token += secret;
    temp_token += date;
    temp_token += username;
    // make sure what we're setting in the access key is also what we scheck against in the db
    User.where({username: username}).update({last_login: date});

    var mykey = crypto.createCipher('aes-128-cbc', config.accessTokenEncryptionKey);
    var access_token = mykey.update(temp_token, 'utf8', 'hex')
    access_token += mykey.final('hex');
    return access_token;
}

exports.ValidateAccessToken = function (username, access_token){
    var decrypted_token = exports.DecryptAccessToken(access_token)
    var used_secret = decrypted_token.substr(0,7);
    var used_date = decrypted_token.substr(8,16); // todo get date string length
    var used_username = decrypted_token.substr(17,access_token.length);

    if(used_secret == secret && used_date == GetLastLoginDate(username) && utils.checkDateTimeout(used_date, 3) && CheckUserExists(used_username)){
        var result = true;
    } else {
        var result = false;
    }

    return result;
}

function CheckUserExists(username){
    utils.Log('INFO', "Checking for user: " + username);
    User.findOne({username: username}, function(err, user){
        if(err){
            utils.Log('ERROR', err)
        }
        if(user){
            utils.Log('INFO', "Found User: " + username)
            return true;
        } else {
            utils.Log('INFO', "User Not Found");
            return false;
        }
    })
    return result;
}

function GetLastLoginDate(username){


}

function ValidatePassword(username, password){

}

function GenerateUserID(){
    var uuid = uuidv1();
    User.findOne({user_id: uuid}, function(err, user){
        if(err){
            utils.Log('ERROR', err);
        }
        if(user){
            utils.Log('INFO', "User already exists with UUID: " + uuid);
        }
    })
    return uuid;
}