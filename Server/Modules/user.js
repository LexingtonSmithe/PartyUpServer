// external
const crypto = require('crypto');
const mongoose = require('mongoose');

// internal
const config = require('../../config.json');
const User = require('../Models/user');
const utils = require('./utils');
const auth = require('./authentication');
const Log = utils.Log;
const Error = utils.Error;
// local
var  exports = module.exports = {};

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
exports.CreateUser = async function(req, res){
    // checkuserexists().then(dostuff)
    let user = await this.CheckUserExists(req.body.username);
    if(user){
        res.json({
            "Status": "Error",
            "Error": Error(1),
        })
    } else {
        Log('INFO', "Creating user");
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
        newUser.save(async function(err, addedUser) {
          if(err){
              res.status(500).json({
                  "Status": "Error",
                  "Error": Error(3, err)
              });
          } else {
            Log('INFO', 'User created successfully');

            let accessToken = await auth.CreateAccessToken(addedUser.username),
            res.json({
                "Status": "Success",
                "Message": "Created User",
                "Token": accessToken,
                "Data": addedUser // we don't need to return the user we just added
            });
          }
        })
    }
}

exports.UpdateUser = async function(req, res){
    // checkuserexists().then(dostuff)
    let user = await this.CheckUserExists(req.body.username)
    if(user){
        let validToken = await auth.ValidateAccessToken(req.body.usernmae);
        if(validToken){
            Log('INFO', "Updating user");
            // updating user data -> setters
            newUser.findOneAndUpdate(async function(err, addedUser) {
              if(err){
                  res.status(500).json({
                      "Status": "Error",
                      "Error": Error(3, err)
                  });
              } else {
                Log('INFO', 'User updated successfully');
                res.json({
                    "Status": "Success",
                    "Message": "Updated User",
                    "Token": accessToken,
                    "Data": addedUser // we don't need to return the user we just added
                });
              }
            })
        }
        res.status(401)json({
            "Status": "Error",
            "Error": Error(11),
        })
    } else {
        res.stastu(400)json({
            "Status": "Error",
            "Error": Error(2)
        })
    }
}

exports.UserLogin = async function(req, res){
    let userExists = await this.CheckUserExists(req.params.username)
    if(userExists){
        let passwordValid = await auth.ValidatePassword(req.params.username, req.params.password)
        if(passwordValid){
            let access_token = await auth.CreateAccessToken(username);
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
