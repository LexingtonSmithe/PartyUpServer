// external
const crypto = require('crypto');
const mongoose = require('mongoose');

// internal
const User = require('../Models/user');
const config = require('../../config.json');
const user = require('./user');
const utils = require('./utils');
const datetime = require('./datetime');
const Log = utils.Log;
const Error = utils.Error;
// local
var  exports = module.exports = {};

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

exports.CreateAccessToken = function(username){
    Log('INFO', "Creating access token for: " + username);
    let temp_token = "";
    let date = Date.now();
    temp_token += config.secret;
    temp_token += date;
    temp_token += username;
    // make sure what we're setting in the access key is also what we check against in the db
    User.updateOne({username: username}, {last_login: date}, {upsert: true}, (err, result)=>{
        if(err){
            Error(13, err);
        } else {
            Log('INFO', "Updated last login date: " + date);
        }
    });

    let mykey = crypto.createCipher('aes-128-cbc', config.accessTokenEncryptionKey);
    let access_token = mykey.update(temp_token, 'utf8', 'hex')
    access_token += mykey.final('hex');
    return access_token;
}

function DecryptAccessToken(access_token){
    let mykey = crypto.createDecipher('aes-128-cbc', config.accessTokenEncryptionKey);
    let decryptedAccessToken = mykey.update(access_token, 'hex', 'utf8')
    decryptedAccessToken += mykey.final('utf8');
    return decryptedAccessToken;
}

exports.ValidateAccessToken = async function (username, access_token){
    Log('INFO', "Validating access token: " + access_token);

    return new Promise(async function(resolve, reject) {
        let decrypted_token = DecryptAccessToken(access_token)
        let used_secret = decrypted_token.substring(0,8);
        let used_date = decrypted_token.substring(8,21);
        let used_username = decrypted_token.substring(21,decrypted_token.length);
        /*
            TODO:
            Tidy up custom responses for failure
        */
        if(username != used_username) {
            Log('INFO', "Access token supplied is not for user supplied: " + username);
            return reject(false);
        }

        if(used_secret != config.secret){
            Log('INFO', "Used secret was incorrect: " + used_secret);
            return reject(false);
        }

        let lastLoginDate = await datetime.GetLastLoginDate(used_username);
        if(used_date != lastLoginDate){
            Log('INFO', "Used date(" + used_date + ") did not match last login date: " + lastLoginDate);
            return reject(false);
        }

        if(!datetime.CheckDateTimeout(used_date)){
            return reject(false)
            Log('INFO', "Users access token has timed out: " + used_date);
        }
        resolve(true);
    })
}

exports.ValidatePassword = function (username, submitted_password){
    return new Promise((resolve, reject) => {
        User.findOne({username: username}, function(err, user){
            if(user) {
                /*
                    TODO
                    delete this encryption when being passed encrypted passwords
                    and change the conditional to be 'submitted_password'
                */
                let encrypted_password = exports.EncryptPassword(submitted_password);
                let stored_password = user.password;
                if(stored_password == encrypted_password){
                    let result = true;
                    Log('INFO', "Stored passsword matches submmitted password");
                    resolve(result);
                } else {
                    let result = "Incorrect password"
                    Log('INFO', "Stored passsword does NOT match submmitted password");
                    reject(result);
                }

            } else {
                reject(Error(2))
            }
            if(err){
                reject(Error(8, err));
            }
        })
    })
}