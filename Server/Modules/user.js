// external
const crypto = require('crypto');
const mongoose = require('mongoose');
const uuidv1 = require('uuid/v1');
// internal
const config = require('../../config.json');
const User = require('../Models/user');
// local
var exports = module.exports = {};
var secret = config.secret;

exports.createUser = function(req, res){
    User.findOne({username: req.body.username}, function(err, user){
        console.log("Checking for user: " + req.body.username);
        if(err){
            console.log(err)
        }
        if(user){
            console.log("Found User: " + req.body.username)
            res.json({
                "Status": "Error",
                "Error Code": 1,
                "Message": "User with this username already exists, please enter a new username"

            })
        } else {
            console.log("No user found, creating user");
            var newUser = new User();
            newUser.user_id = GenerateUserID();
            newUser.username = req.body.username;
            newUser.display_name = req.body.display_name;
            newUser.password = req.body.password;
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
                console.log('Error creating the user');
                console.log(err);
              } else {
                  console.log('User created successfully');
                res.json({
                    "Status": "Success",
                    "Message": "Created User",
                    "Token": CreateAccessToken(addedUser.username),
                    "Data": addedUser
                });
              }
            })

        }
    })
}

exports.userLogin = function(username, password){
    if(CheckUserExists(username)){
        // decrypt password
        var decrypted_password = DecryptPassword(username,password);
        // validate password
        if(ValidatePassword(username, decrypted_password)){
            var access_token = CreateAccessToken(username);
        };
    }
    return access_token;
}

exports.userAuthentication = function(username, access_token){
    // decrypt access_token
    var decrypted_token = DecryptAccessToken(username, access_token);
    // validate access_token
    if(ValidateAccessToken(decrypted_token)){
        var result = true;
    } else {
        var result = false;
    }
    return result
}

function GenerateUserID(){
    var uuid = uuidv1();
    User.findOne({user_id: uuid}, function(err, user){
        if(err){
            console.log(err);
        }
        if(user){
            console.log("User already exists with UUID: " + uuid);
        }
    })
    return uuid;
}

function DecryptPassword(username, password){
    var mykey = crypto.createDecipher('aes-128-cbc', username);
    var decryptedPassword = mykey.update(password, 'hex', 'utf8')
    decryptedPassword += mykey.final('utf8');
    return decryptedPassword;
}

function DecryptAccessToken(username, access_token){
    var mykey = crypto.createDecipher('aes-128-cbc', username);
    var decryptedAccessToken = mykey.update(access_token, 'hex', 'utf8')
    decryptedAccessToken += mykey.final('utf8');
    return decryptedAccessToken;
}

function CreateAccessToken(username){
    var temp_token = "";
    temp_token += secret;
    temp_token +=  Date.now();
    temp_token += username;

    var mykey = crypto.createCipher('aes-128-cbc', 'mypassword');
    var access_token = mykey.update(temp_token, 'utf8', 'hex')
    access_token += mykey.final('hex');
    console.log(temp_token);
    console.log(access_token);
    return access_token;
}

exports.validateAccessToken = function (username, access_token){
    var decrypted_token = DecryptAccessToken(username, access_token)
    var used_secret = decrypted_token.substr(0,7);
    var used_date = decrypted_token.substr(8,16); // todo get date string length
    var used_username = decrypted_token.substr(17,access_token.length);

    if(used_secret == secret && used_date == GetLastLoginDate(username) && utils.checkDateTimeout(used_date, 3) && CheckUserExists(used_username)){
        var result = true;
    } else {
        var result = false;
    }

    return result;
}

async function CheckUserExists(username){
    console.log("Checking for user: " + username);
    User.findOne({username: username}, function(err, user){
        if(err){
            console.log(err)
        }
        if(user){
            console.log("Found User: " + username)
            return true;
        } else {
            console.log("User Not Found");
            return false;
        }
    })
    return result;
}

function GetLastLoginDate(username){

}

function ValidatePassword(username, password){

}
