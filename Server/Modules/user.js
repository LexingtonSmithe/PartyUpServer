// external
const crypto = require('crypto');
const mongoose = require('mongoose');
const Profanity = require('bad-words');
const profanity = new Profanity();


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
        let validated_user = this.ValidateUser(req.body);
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
        let validated_user = this.ValidateUser(req.body);
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

    GetUser : async function(req, res){
        Log('INFO', "Retrieving Supplied Users Data");
        User.findOne({username: req.headers.username}, function(err, user){
            if(user) {
                Log('INFO', "User data found: " + req.headers.username)
                return res.json({
                    "status": "Success",
                    "data": PrivatelyDisplayedUserData(user)
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

    GetUserProfile : async function(req, res){
        Log('INFO', "Retrieving Supplied Users Data");
        User.findOne({username: req.params.username}, function(err, user){
            if(user) {
                Log('INFO', "User data found: " + req.params.username)
                return res.json({
                    "status": "Success",
                    "data": PubliclyDisplayedUserData(user)
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

    ValidateUser : function(data) {
        let result = {}

        if(!utils.DataValidator(data.username, 'string', 3, 12)){
            return result = GetValidationError(1);
        }

        if(!utils.DataValidator(data.password, 'string', 8, 15)){
            return result = GetValidationError(2);
        }

        if(!utils.DataValidator(data.display_name, 'string', 3, 12)){
            return result = GetValidationError(3);
        }

        if(!utils.DataValidator(data.bio, 'string', 32, 255)){
            return result = GetValidationError(4);
        }

        if(!utils.DataValidator(data.name, 'object', 2)){
            return result = GetValidationError(5);
        }

        if(!utils.DataValidator(data.name.first_name, 'string', 3, 12)){
            return result = GetValidationError(6);
        }

        if(!utils.DataValidator(data.name.last_name, 'string', 3, 12)){
            return result = GetValidationError(7);
        }

        if(!utils.DataValidator(data.contact, 'object', 2)){
            return result = GetValidationError(8);
        }

        if(!utils.DataValidator(data.contact.email, 'string', 7, 254)){
            return result = GetValidationError(9);
        }
        if(!utils.DataValidator(data.contact.telephone, 'string', 10, 12)){
            return result = GetValidationError(10);
        }

        if(!utils.DataValidator(data.date_of_birth, 'string', 10)){
            return result = GetValidationError(11);
        }

        if(!utils.DataValidator(data.city, 'string', 3, 30)){
            return result = GetValidationError(12);;
        }

        if(!utils.DataValidator(data.country, 'string', 2)){
            return result = GetValidationError(13);
        }

        if(!utils.DataValidator(data.location, 'object', 2)){
            return result = GetValidationError(14);
        }

        if(!utils.DataValidator(data.location.longditude, 'number', 2, 20)){
            return result = GetValidationError(15);
        }

        if(!utils.DataValidator(data.location.latitude, 'number', 2, 20)){
            return result = GetValidationError(16);
        }

        if(profanity.isProfane(data.display_name)){
            return result = GetValidationError(17);
        }

        if(profanity.isProfane(data.bio)){
            return result = GetValidationError(18);
        }

        return result = GetValidationError(0);;
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
    user.password = data.password;
    user.display_name = data.display_name;
    user.bio = data.bio;
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
            message: "Username supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 2,
            message: "Password supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 3,
            message: "Display Name supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 4,
            message: "Bio supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 5,
            message: "Names supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 6,
            message: "First Name supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 7,
            message: "Last Name supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 8,
            message: "Contact supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 9,
            message: "Email supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 10,
            message: "Telephone supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 11,
            message: "Date of Birth supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 12,
            message: "City supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 13,
            message: "Country supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 14,
            message: "Location supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 15,
            message: "Longditude supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 16,
            message: "Latitude supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 17,
            message: "Display Name supplied is inappropriate"
        },
        {
            error: true,
            id: 18,
            message: "Bio contains words or phrases that are inappropriate"
        }
    ]
    if(id == 0){
        Log('INFO', "Valid User Data: " + errors[id].message + " - " + id);
    } else {
        Log('INFO', "Invalid User Data: " + errors[id].message + " - " + id);
    }

    return errors[id];
}

function PrivatelyDisplayedUserData(data){
    let response = {
        "username" : data.username,
        "display_name" : data.display_name,
        "name": {
            "first_name" : data.name.first_name,
            "last_name" : data.name.last_name
        },
        "contact": {
            "email" : data.contact.email,
            "telephone" : data.contact.telephone
        },
        "date_of_birth"  : data.date_of_birth,
        "city" : data.city,
        "country" : data.country,
        "location" : {
            "latitude" : data.location.latitude,
            "longditude" : data.location.longditude
        }
      }
    return response;
}

function PubliclyDisplayedUserData(data){
    let response = {
        "display_name" : data.display_name,
        "bio": data.bio,
        "age": utils.CalculateAge(data.date_of_birth),
        "city" : data.city
      }
    return response;
}
