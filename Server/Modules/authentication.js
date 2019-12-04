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

    OpenAuthenticationMiddleware : async function(req, res, next){
        console.log(req);
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
            return res.status(401).json({
                "status": "Error",
                "error": Error(2, error)
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

    ClosedAuthenticationMiddleware : async function(req, res, next){
        Log('INFO', "Authenticaticating");
        let header_username = req.headers.username;
        let body_username = req.body.username;
        let access_token = req.headers.access_token;
        if(header_username != body_username){
            return res.status(403).json({
                "status": "Error",
                "error": Error(17)
            })
        }
        if(!access_token){
            return res.status(401).json({
                "status": "Error",
                "error": Error(13)
            })
        }
        if(!header_username){
            return res.status(401).json({
                "status": "Error",
                "error": Error(14)
            })
        }
        try {
            let validUser = await user.UserExists(header_username);
            if(!validUser){
                return res.status(401).json({
                    "status": "Error",
                    "error": Error(2)
                })
            }
        }
        catch(error){
            return res.status(401).json({
                "status": "Error",
                "error": Error(2, error)
            })
        }
        try {
            let validAccessToken = await ValidateAccessToken(header_username, access_token);
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

        let user_data = await user.UserExists(req.body.username);
        if(user_data){
            if(req.body.password == user_data.password){
                Log('INFO', "Password valid creating access token");
                let access_token = await this.CreateAccessToken(req.body.username);
                return res.json({
                    "status": "Success",
                    "message": "User logged in",
                    "access_token": access_token
                })
            } else {
                return res.status(403).json({
                    "status": "Error",
                    "error": Error(6)
                })
            }
        } else {
            return res.status(400).json({
                "status": "Error",
                "error": Error(2)
            })
        }
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
    try {
        let mykey = crypto.createDecipher('aes-128-cbc', config.accessTokenEncryptionKey);
        let decryptedAccessToken = mykey.update(access_token, 'hex', 'utf8')
        decryptedAccessToken += mykey.final('utf8');
        return decryptedAccessToken;
    }
    catch(err){
        return false;
    }
};

async function ValidateAccessToken(username, access_token){
    Log('INFO', "Validating access token: " + access_token);

    return new Promise(async function(resolve, reject) {
        let decrypted_token = DecryptAccessToken(access_token)
        if(!decrypted_token){
            return reject("Invalid Access Token");
        }
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
};
