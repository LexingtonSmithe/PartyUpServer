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
module.exports = {
    UserExists : function(username){
        Log('INFO', "Checking if user exists: " + username);
        return new Promise((resolve, reject) => {
            User.findOne({username: username}, function(err, user){
                if(user) {
                    Log('INFO', "User exists: " + username)
                    let result = true;
                    resolve(result);
                } else {
                    Log('INFO', "User does not exist");
                    let result = false;
                    resolve(result);
                }
                if(err){
                    reject(Error(8, err));
                }
            })
        })
    },

    CreateUser : async function(req, res){
        let username = req.body.username;
        Log('INFO', "Creating user");
        let user_exists = await this.UserExists(username);
        if(user_exists){
            return res.status(400).json({
                "status": "Error",
                "error": Error(1),
            })
        }
        let valid_user = ValidateUserData(req.body);
        if(valid_user.error){
            return res.status(400).json(InvalidUser(valid_user.id))
        };

        let saved_user = await SaveUser(req.body);
        if(!saved_user){
            return res.status(500).json({
                "status": "Error",
                "error": Error(16, err)
            });
        }

        let access_token = await auth.CreateAccessToken(username);
        Log('INFO', 'User created successfully');
        return res.json({
            "status": "Success",
            "message": "Created User",
            "access_token": accessToken,
        });
    },

    UpdateUser : async function(req, res){
        var saved_user = false;
        try {
            saved_user = await SaveExistingUser(req.headers.username, req.body);
        }
        catch(error){
            return res.status(500).json({
                "status": "Error",
                "error": Error(16, err)
            });
        }
        if(!saved_user){
            return res.status(500).json({
                "status": "Error",
                "error": Error(16, err)
            });
        } else {
            return res.json({
                "status": "Success",
                "message": "Updated User"
            });
        }
    },

    NumberOfUsers : function(){
        return new Promise((resolve, reject) => {
            let numberOfUsers = User.estimatedDocumentCount();
            if(numberOfUsers){
                resolve(numberOfUsers);
            } else {
                reject(Error(10));
            }
        })
    }
};

function CreateNewUser(data){
    let result
    if(!data.username){
        result = {
            error: true,
            id: 1,
            message: "No Username Suppplied"
        }
        return result
    }

    if(!data.display_name){
        result = {
            error: true,
            id: 2,
            message: "No Display Name Supplied"
        }
        return result
    }

    if(CheckDisplayNameForProfanity(data.display_name)){
        result = {
            error: true,
            id: 3,
            message: "No Display Name Supplied"
        }
        return result
    }

    if(!data.password){
        result = {
            error: true,
            id: 4,
            message: "No Password Supplied"
        }
        return result
    }

    if(!data.name){
        result = {
            error: true,
            id: 5,
            message: "No Names Supplied"
        }
        return result
    }

    if(!data.name.first_name){
        result = {
            error: true,
            id: 6,
            message: "No First Name Supplied"
        }
        return result
    }

    if(!data.name.last_name){
        result = {
            error: true,
            id: 7,
            message: "No Last Name Supplied"
        }
        return result
    }

    if(!data.contact){
        result = {
            error: true,
            id: 8,
            message: "No Contact Details Supplied"
        }
        return result
    }

    if(!data.contact.email){
        result = {
            error: true,
            id: 9,
            message: "No Email Supplied"
        }
        return result
    }

    if(!data.contact.telephone){
        result = {
            error: true,
            id: 10,
            message: "No Telephone Supplied"
        }
        return result
    }

    if(!data.date_of_birth){
        result = {
            error: true,
            id: 11,
            message: "No Date Of Birth Supplied"
        }
        return result
    }

    if(!data.city){
        result = {
            error: true,
            id: 12,
            message: "No City Supplied"
        }
        return result
    }

    if(!data.country){
        result = {
            error: true,
            id: 13,
            message: "No Country Supplied"
        }
        return result
    }

    if(!data.location){
        result = {
            error: true,
            id: 14,
            message: "No Location Supplied"
        }
        return result
    }

    if(!data.location.latitude){
        result = {
            error: true,
            id: 15,
            message: "No Latitude Supplied"
        }
        return result
    }

    if(!data.location.longditude){
        result = {
            error: true,
            id: 16,
            message: "No Longditude Supplied"
        }
        return result
    }

    let user = {};
    user.user_id = utils.GenerateUUID();
    user.username = data.username;
    user.display_name = data.display_name;
    user.password = data.password;
    user.name = {
        first_name : data.name.first_name,
        last_name : data.name.last_name
    };
    user.contact = {
        email : data.contact.email,
        telephone : data.contact.telephone
    };
    user.date_of_birth = data.date_of_birth;
    user.city = data.city;
    user.country = data.country;
    user.location = {
        latitude : data.location.latitude,
        longditude : data.location.longditude
    };
    user.rec_created_at = Date.now();
    user.rec_updated_at = Date.now();
    user.last_login = Date.now();
    user.last_search = null;
    return user;
}

function SaveNewUser(data) {
    return new Promise((resolve, reject) => {
        Log('INFO', "Saving user data");
        let newUser = CreateNewUser(data);
        newUser.save(function(err) {
            if(!err) {
                resolve(true);
            } else {
                Log('ERROR', "Error saving user data", err);
                reject(err);
            }
        });
    });
}

function SaveExistingUser(username, data) {
    return new Promise((resolve, reject) => {
        Log('INFO', "Updating user data");
        let user_data = {};
        user_data.username = data.username;
        user_data.display_name = data.display_name;
        user_data.password = data.password;
        user_data.name = {
            first_name : data.name.first_name,
            last_name : data.name.last_name
        };
        user_data.contact = {
            email : data.contact.email,
            telephone : data.contact.telephone
        };
        user_data.date_of_birth = data.date_of_birth;
        user_data.city = data.city;
        user_data.country = data.country;
        user_data.location = {
            latitude : data.location.latitude,
            longditude : data.location.longditude
        };
        user_data.rec_updated_at = Date.now();
        User.findOneAndUpdate( {username: username}, user_data, function(err) {
            if(!err) {
                Log('INFO', 'User updated successfully');
                resolve(true);
            } else {
                Log('ERROR', "Error saving user data", err);
                reject(err);
            }
        });
    });
}

function CheckDisplayNameForProfanity(data){
    // TODO: make this an actual thing, maybe also include other validation beyond profanity
    return false;
}
