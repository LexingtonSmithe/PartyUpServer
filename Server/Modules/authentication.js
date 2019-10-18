// external
const crypto = require('crypto');
const mongoose = require('mongoose');

// internal
const config = require('../../config.json');
const utils = require('./utils');
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
    return new Promise((resolve, reject) => {
        let decrypted_token = exports.DecryptAccessToken(access_token)
        let used_secret = decrypted_token.substr(0,7);
        let used_date = decrypted_token.substr(8,16); // todo get date string length
        let used_username = decrypted_token.substr(17,access_token.length);
        let userExists = await this.CheckUserExists(used_username);
        if(userExists && used_secret == config.secret && used_date == GetLastLoginDate(username) && Utils.CheckDateTimeout(used_date, config.tokenTimeOut)){
            resolve(true);
        } else {
            reject(false);
            Log('ERROR', "User attempted to use an invalid access token: " + username);
        }
    })
}

function GetLastLoginDate(username){


}

function ValidatePassword(username, password){

}
