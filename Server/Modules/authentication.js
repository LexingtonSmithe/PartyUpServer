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
module.exports = {
    AuthenticationMiddleware : async function(req, res, next){
        Log('INFO', "Authenticaticating");
        let username = req.headers.username;
        let access_token = req.headers.access_token;
        if(!access_token){
            return res.status(401).json({
                "status": "Error",
                "error": Error(13)
            })
        }
        if(!username){
            return res.status(401).json({
                "status": "Error",
                "error": Error(14)
            })
        }
        try {
            let validUser = await user.UserExists(username);
            if(!validUser){
                return res.status(401).json({
                    "status": "Error",
                    "error": Error(2)
                })
            }
        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                "status": "Error",
                "error": Error(2)
            })
        }
        try {
            let validAccessToken = await ValidateAccessToken(username, access_token);
            if(!validAccessToken){
                return res.status(401).json({
                    "status": "Error",
                    "error": Error(11)
                })
            }
            Log('INFO', "Successful Authentication");
            next();
        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                "status": "Error",
                "error": Error(11)
            })
        }
    },

    UserLogin : async function(req, res){
        let user_exists = await user.UserExists(req.body.username)
        if(user_exists){
            var passwordValid;
            try {
                passwordValid = await this.ValidatePassword(req.body.username, req.body.password)
                if(passwordValid){
                    Log('INFO', "Password valid creating access token");
                    let access_token = await this.CreateAccessToken(req.body.username);
                    res.json({
                        "status": "Success",
                        "message": "User logged in",
                        "access_token": access_token
                    })
                }
            }
            catch(err){
                if(err == "Incorrect password"){
                    res.status(403).json({
                        "status": "Error",
                        "error": Error(6)
                    })
                } else {
                    res.status(400).json({
                        "status": "Error",
                        "error": Error(12, err)
                    });
                }

            }
        } else {
            res.status(403).json({
                "status": "Error",
                "error": Error(5)
            })
        }
    },

    ValidatePassword : function (username, submitted_password){
        var that = this;
        return new Promise((resolve, reject) => {
            User.findOne({username: username}, function(err, user){
                if(user) {
                    let stored_password = user.password;
                    if(stored_password == submitted_password){
                        let result = true;
                        Log('INFO', "Stored passsword matches submmitted password");
                        resolve(result);
                    } else {
                        let result = "Incorrect password"
                        Log('INFO', "Stored password does NOT match submmitted password");
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
    },



    // not needed as the FE will be sending us encrypted passwords
    EncryptPassword : function(password){
        let mykey = crypto.createCipher('aes-128-cbc', config.passwordEncryptionKey);
        let encryptedPassword = mykey.update(password, 'utf8', 'hex')
        encryptedPassword += mykey.final('hex');
        return encryptedPassword;
    },

    // not needed as we won't be decrypting passwords
    DecryptPassword : function(password){
        let mykey = crypto.createDecipher('aes-128-cbc', config.passwordEncryptionKey);
        let decryptedPassword = mykey.update(password, 'hex', 'utf8')
        decryptedPassword += mykey.final('utf8');
        return decryptedPassword;
    },

    CreateAccessToken : function(username){
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

};



function DecryptAccessToken(access_token){
    let mykey = crypto.createDecipher('aes-128-cbc', config.accessTokenEncryptionKey);
    let decryptedAccessToken = mykey.update(access_token, 'hex', 'utf8')
    decryptedAccessToken += mykey.final('utf8');
    return decryptedAccessToken;
}

async function ValidateAccessToken(username, access_token){
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
        Log('INFO', "Successfully validated access token");
        resolve(true);
    })
}
