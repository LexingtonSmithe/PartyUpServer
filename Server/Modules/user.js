// external
const crypto = require('crypto');
const mongoose = require('mongoose');

// internal
const config = require('../../config.json');
const User = require('../Models/user');
const utils = require('./utils');
const Log = utils.Log;
const Error = utils.Error;
// local
var  exports = module.exports = {};

exports.CreateUser = async function(req, res){
    // checkuserexists().then(dostuff)
    let user = await this.CheckUserExists(req.body.username)
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
}

exports.UserLogin = async function(req, res){
    let userExists = await this.CheckUserExists(req.params.username)
    if(userExists){
        let passwordValid = await ValidatePassword(req.params.username, req.params.password)
        if(passwordValid){
            let access_token = await this.CreateAccessToken(username);
            res.json({
                "Status": "Success",
                "Message": "User logged in",
                "AccessToken": access_token
            })
        } else {
            res.status(403).json({
                "Status": "Error",
                "Error": Error(6, err)
            })
        }
    } else {
        res.status(403).json({
            "Status": "Error",
            "Error": Error(5, err)
        })
    }
    return access_token;
}

exports.GetUserData = function(req, res){


}

exports.CheckUserExists = function(username){
    Log('INFO', "Checking for user: " + username);
    return new Promise((resolve, reject) => {
        User.findOne({username: username}, function(err, user){
            if(user) {
                Log('INFO', "Found User: " + username)
                let result = true;
                resolve(result);
            } else {
                Log('INFO', "User Not Found");
                let result = false;
                resolve(result);
            }
            if(err){
                reject(Error(8, err));
            }
        })
    })
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
    // make sure what we're setting in the access key is also what we check against in the db
    User.where({username: username}).update({last_login: date});

    let mykey = crypto.createCipher('aes-128-cbc', config.accessTokenEncryptionKey);
    let access_token = mykey.update(temp_token, 'utf8', 'hex')
    access_token += mykey.final('hex');
    return access_token;
}

exports.ValidateAccessToken = async function (username, access_token){
    let decrypted_token = exports.DecryptAccessToken(access_token)
    let used_secret = decrypted_token.substr(0,7);
    let used_date = decrypted_token.substr(8,16); // todo get date string length
    let used_username = decrypted_token.substr(17,access_token.length);
    let userExists = await this.CheckUserExists(used_username)
    if(userExists && used_secret == config.secret && used_date == GetLastLoginDate(username) && Utils.CheckDateTimeout(used_date, config.tokenTimeOut)){
        let result = true;
    } else {
        let result = false;
        Log('ERROR', "User attempted to use an invalid access token: " + username);
    }

    return result;
}

exports.NumberOfUsers = function(){
    return new Promise((resolve,reject) => {
        let numberOfUsers = User.estimatedDocumentCount();
        if(numberOfUsers){
            resolve(numberOfUsers);
        } else {
            reject(Error(10));
        }
    })
}

function GetLastLoginDate(username){


}

function ValidatePassword(username, password){

}
