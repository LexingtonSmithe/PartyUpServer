// external
const crypto = require('crypto');
const mongoose = require('mongoose');

// internal
const config = require('../../config.json');
const User = require('../Models/user');
const utils = require('./utils');
const preferences = require('./preferences');
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
                    let result = user;
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
        Log('INFO', "Validating Supplied User Data");
        let validated_user = ValidateUserData(req.body);
        if(validated_user.error){
            return res.status(400).json({
                "status": "Error",
                "error": {
                    "id": validated_user.id,
                    "message": validated_user.message
                }
            })
        };

        let user_exists = await this.UserExists(req.body.username);
        if(user_exists){
            return res.status(400).json({
                "status": "Error",
                "error": Error(1)
            })
        }

        Log('INFO', "Saving");
        let saved_user = await SaveNewUser(req.body);
        if(!saved_user){
            return res.status(500).json({
                "status": "Error",
                "error": Error(16, err)
            });
        }

        Log('INFO', 'User created successfully');
        return res.json({
            "status": "Success",
            "message": "Created User"
        });
    },

    UpdateUser : async function(req, res){
        let validated_user = ValidateUserData(req.body);
        if(validated_user.error){
            return res.status(400).json({
                "status": "Error",
                "error": {
                    "id": validated_user.id,
                    "message": validated_user.message
                }
            })
        };
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

    GetUserProfile : async function(req, res){
        Log('INFO', "Retrieving Supplied Users Data");
        User.findOne({username: req.headers.username}, function(err, user){
            if(user) {
                Log('INFO', "User data found: " + req.headers.username)
                return res.json({
                    "status": "Success",
                    "data": user
                });
            } else {
                Log('INFO', "User data not found");
                return res.status(400).json({
                    "status": "Error",
                    "message": Error(2)
                });
            }
            if(err){
                return res.status(400).json({
                    "status": "Success",
                    "message": Error(8)
                });
            }
        })
    },

    DeleteUser : async function(req, res){
        Log('INFO', "Deleting User");
        let update = {
            username : utils.GenerateUUID(),
            password : utils.GenerateUUID(),
            soft_delete : true
        }
        
        preferences.DeleteUserPreferences(req.headers.username);

        User.findOneAndUpdate({username: req.headers.username},update, function(err, user){
            if(user) {
                Log('INFO', "User data found: " + req.headers.username)
                return res.json({
                    "status": "Success",
                    "message": "User Deleted"
                });
            } else {
                Log('INFO', "User data not found");
                return res.status(400).json({
                    "status": "Error",
                    "message": Error(2)
                });
            }
            if(err){
                return res.status(400).json({
                    "status": "Success",
                    "message": Error(8)
                });
            }
        })
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

function MapUserDataFromRequest(data, new_user){
    Log('INFO', "Mapping User Data From Request, new_user: " + new_user);
    if(new_user){
        user = new User;
        user.user_id = utils.GenerateUUID();
    } else {
        user = {}
    }
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
    user.last_search = null;
    return user;
};

function SaveNewUser(data){
    return new Promise((resolve, reject) => {
        Log('INFO', "Saving user data");
        let newUser = MapUserDataFromRequest(data, true);
        newUser.save(function(err) {
            if(!err) {
                resolve(true);
            } else {
                Log('ERROR', "Error saving user data", err);
                reject(err);
            }
        });
    });
};

function SaveExistingUser(username, data){
    return new Promise((resolve, reject) => {
        Log('INFO', "Updating user data");
        let user_data = MapUserDataFromRequest(data, false);
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
};

function ValidateUserData(data){

    let result = GetValidationError(0);

    if(!data.username){
        result = GetValidationError(1);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(typeof data.username != 'string'){
        result = GetValidationError(2);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(!data.display_name){
        result = GetValidationError(3);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(typeof data.display_name != 'string'){
        result = GetValidationError(4);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(CheckDisplayNameForProfanity(data.display_name)){
        result = GetValidationError(5)
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(!data.password){
        result = GetValidationError(6);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(typeof data.password != 'string'){
        result = GetValidationError(7);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(!data.name){
        result = GetValidationError(8);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(typeof data.name != 'object'){
        result = GetValidationError(9);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(!data.name.first_name){
        result = GetValidationError(10);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }
    if(typeof data.name.first_name != 'string'){
        result = GetValidationError(11);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(!data.name.last_name){
        result = result = GetValidationError(12);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(typeof data.name.last_name != 'string'){
        result = GetValidationError(13);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(!data.contact){
        result = GetValidationError(14);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(typeof data.contact != 'object'){
        result = GetValidationError(15);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(!data.contact.email){
        result = GetValidationError(16);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(typeof data.contact.email != 'string'){
        result = GetValidationError(17);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(!data.contact.telephone){
        result = GetValidationError(18);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(typeof data.contact.telephone != 'string'){

        result = GetValidationError(19);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(!data.date_of_birth){
        result = GetValidationError(21)
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(typeof data.date_of_birth != 'string'){
        result = GetValidationError(22);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(!data.city){
        result = GetValidationError(23);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(typeof data.city != 'string'){
        result = GetValidationError(24);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(!data.country){
        result = GetValidationError(25);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(typeof data.country != 'string'){
        result = GetValidationError(26);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(!data.location){
        result = GetValidationError(27);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(typeof data.location != 'object'){
        result = GetValidationError(28);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(!data.location.latitude){
        result = GetValidationError(29);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(typeof data.location.latitude != 'number'){
        result = GetValidationError(30);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(!data.location.longditude){
        result = GetValidationError(31);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }

    if(typeof data.location.longditude != 'number'){
        result = GetValidationError(32);
        Log('INFO', "Invalid User Data: " + result.message);
        return result
    }
    return result;
};

function CheckDisplayNameForProfanity(data){
    // TODO: make this an actual thing, maybe also include other validation beyond profanity
    return false;
};

function GetValidationError(id){
    let errors = [
        {
            error: false,
            id: 0,
            message: "Supplied Data Is Present And Correct"
        },
        {
            error: true,
            id: 1,
            message: "No Username Supplied"
        },
        {
            error: true,
            id: 2,
            message: "Invalid Username Supplied"
        },
        {
            error: true,
            id: 3,
            message: "No Display Name Supplied"
        },
        {
            error: true,
            id: 4,
            message: "Invalid Display Name Supplied"
        },
        {
            error: true,
            id: 5,
            message: "Display Name Is Inappropriate"
        },
        {
            error: true,
            id: 6,
            message: "No Password Supplied"
        },
        {
            error: true,
            id: 7,
            message: "Invalid Password Supplied"
        },
        {
            error: true,
            id: 8,
            message: "No Names Supplied"
        },
        {
            error: true,
            id: 9,
            message: "Invalid Names Supplied"
        },
        {
            error: true,
            id: 10,
            message: "No First Name Supplied"
        },
        {
            error: true,
            id: 11,
            message: "Invalid First Name Supplied"
        },
        {
            error: true,
            id: 12,
            message: "No Last Name Supplied"
        },
        {
            error: true,
            id: 13,
            message: "Invalid Last Name Supplied"
        },
        {
            error: true,
            id: 14,
            message: "No Contact Details Supplied"
        },
        {
            error: true,
            id: 15,
            message: "Invalid Contact Details Supplied"
        },
        {
            error: true,
            id: 16,
            message: "No Email Supplied"
        },
        {
            error: true,
            id: 17,
            message: "Invalid Email Supplied"
        },
        {
            error: true,
            id: 18,
            message: "No Telephone Supplied"
        },
        {
            error: true,
            id: 19,
            message: "Invalid Telephone Supplied"
        },
        {
            error: true,
            id: 20,
            message: "No Date Of Birth Supplied"
        },
        {
            error: true,
            id: 21,
            message: "Invalid Date Of Birth Supplied"
        },
        {
            error: true,
            id: 22,
            message: "No Username Supplied"
        },
        {
            error: true,
            id: 23,
            message: "No City Supplied"
        },
        {
            error: true,
            id: 24,
            message: "Invalid City Supplied"
        },
        {
            error: true,
            id: 25,
            message: "No Country Supplied"
        },
        {
            error: true,
            id: 26,
            message: "Invalid Country Supplied"
        },
        {
            error: true,
            id: 27,
            message: "No Location Supplied"
        },
        {
            error: true,
            id: 28,
            message: "Invalid Location Supplied"
        },
        {
            error: true,
            id: 29,
            message: "No Latitude Supplied"
        },
        {
            error: true,
            id: 30,
            message: "Invalid Latitude Supplied"
        },
        {
            error: true,
            id: 31,
            message: "No Longditude Supplied"
        },
        {
            error: true,
            id: 32,
            message: "Invalid Longditude Supplied"
        }
    ]
    return errors[id];
}
