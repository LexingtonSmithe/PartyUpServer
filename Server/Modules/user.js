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
        let save_user = await SaveUser(req.body);
        if(!save_user){
            return res.status(500).json({
                "status": "Error",
                "error": Error(3, err)
            });
        }

        let access_token = await auth.CreateAccessToken(username);
        Log('INFO', 'User created successfully');
        return res.json({
            "status": "Success",
            "message": "Created User",
            "access_token": accessToken,
            "data": addedUser // we don't need to return the user we just added
        });
    },

    UpdateUser : async function(req, res){

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

function SaveUser(data) {
    return new Promise((resolve, reject) => {
        Log('INFO', "Saving user data");
        let newUser = new User();
        newUser.user_id = utils.GenerateUUID();
        newUser.username = data.username;
        newUser.display_name = data.display_name;
        newUser.password = datapassword;
        newUser.name = {
            first_name : data.name.first_name,
            last_name : data.name.last_name
        };
        newUser.contact = {
            email : data.contact.email,
            telephone : data.contact.telephone
        };
        newUser.date_of_birth = data.date_of_birth;
        newUser.city = data.city;
        newUser.country = data.country;
        newUser.location = {
            latitude : data.location.latitude,
            longditude : data.location.longditude
        };
        newUser.rec_created_at = Date.now();
        newUser.rec_updated_at = Date.now();
        newUser.last_login = Date.now();
        newUser.last_search = null;
        newUser.save(function(err) {
            if(!err) {
                resolve(true);
            } else {
                Log('ERROR', "Error saving user data", err);
                reject(err);
            }
        };
    });
},
