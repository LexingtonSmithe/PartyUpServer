// external
const mongoose = require('mongoose');
// internal
const config = require('../../config.json');
const Preferences = require('../Models/preferences');
const utils = require('./utils');
const Log = utils.Log;
const Error = utils.Error;
const defaultPreferencesList = require('../Data/preferences');

// local
module.exports = {
    GetUserPreferences: function(username) {
        Log('INFO', "Retrieving for preferences for user: " + username);
        return new Promise((resolve, reject) => {
            let query = Preferences.where({
                username: username
            })
            query.findOne(function(err, response) {
                if (response != null) {
                    Log('INFO', "Preferences Found");
                    resolve(response)
                } else {
                    Log('INFO', "No Preferences Found");
                    reject(false);
                }
                if (err) {
                    reject(Error(8, err));
                }
            })
        })
    },

    CheckForUserPreferences: function(username) {
        Log('INFO', "Checking for preferences for user: " + username);
        return new Promise((resolve, reject) => {
            let query = Preferences.where({
                username: username
            })
            query.findOne(function(err, response) {
                if(response != null) {
                    Log('INFO', "Preferences Found");
                    resolve(true);
                } else {
                    Log('INFO', "No Preferences Found");
                    resolve(false);
                }
                if(err) {
                    reject(Error(8, err));
                }
            })
        })
    },

    DeleteUserPreferences: function(username) {
        Log('INFO', "Deleting for preferences for user: " + username);
        Preferences.findOneAndDelete({username: username},function(err, response) {
            if(response != null) {
                Log('INFO', "Preferences Found");
                return true;
            } else {
                Log('INFO', "No Preferences Found");
                return false;
            }
            if(err) {
                return Error(8, err);
            }
        })
    },

    GetPreferences: async function(req, res) {
        let username = req.headers.username;
        await this.GetUserPreferences(username)
            .then((response) => {
                let message = "";
                let preferencesList = {};
                if (response != null) {
                    preferencesList.systems = response.systems;
                    preferencesList.role = response.role;
                    preferencesList.days_free = response.days_free;
                    preferencesList.times_free = response.times_free_start;
                    preferencesList.times_free = response.times_free_end;
                    preferencesList.party_size = response.party_size;
                    preferencesList.age = response.age;
                    preferencesList.distance = response.distance;
                    message = "Preferences Found";
                } else {
                    message = "User preferences not found"
                }
                res.json({
                    "status": "Success",
                    "message": message,
                    "data": preferencesList
                })
            })
            .catch((err) => {
                res.status(500).json({
                    "status": "Error",
                    "error": Error(9)
                })
            });
    },

    GetPreferencesList: async function(req, res) {
        let username = req.headers.username;
        await this.GetUserPreferences(username)
            .then((response) => {
                let message = "Preferences Found";
                let preferencesList = defaultPreferencesList;
                if (response != null) {
                    preferencesList.systems.default = response.systems;
                    preferencesList.device.default = response.device;
                    preferencesList.role.default = response.role;
                    preferencesList.days_free.default = response.days_free;
                    preferencesList.times_free.default_start_time = response.times_free_start;
                    preferencesList.times_free.default_end_time = response.times_free_end;
                    preferencesList.party_size.default = response.party_size;
                    preferencesList.age.default = response.age;
                    preferencesList.distance.default = response.distance;
                    Log('INFO', "Preferences Found: Adding Preset Values");
                } else {
                    Log('INFO', "No Preferences Found");
                    message = "User preferences not found"
                }
                res.json({
                    "status": "Success",
                    "message": "Users default preferences added to list",
                    "data": preferencesList
                })
            })
            .catch((err) => {
                res.status(500).json({
                    "status": "Error",
                    "error": Error(9, err)
                })
            });
    },

    SubmitPreferences: async function(req, res){

        Log('INFO', "Validating Supplied Preferences Data");
        let validated_preferences = ValidatePreferences(req.body);
        if(validated_preferences.error){
            return res.status(400).json({
                "status": "Error",
                "error": {
                    "id": validated_preferences.id,
                    "message": validated_preferences.message
                }
            })
        };

        var preferences_exist = false
        try {
            preferences_exist = await this.CheckForUserPreferences(req.headers.username);
        }
        catch(error){
            return res.status(500).json({
                "status": "Error",
                "error": Error(3)
            })
        }
        if(preferences_exist){


            try {
                let updated_preferences = await UpdatePreferences(req.headers.username, req.body)
                if(updated_preferences){
                    res.json({
                        "status": "Success",
                        "message": "Successfully updated user preferences",
                    })
                }
            }
            catch(error){
                res.status(500).json({
                    "status": "Error",
                    "error": Error(4, error)
                })
            }
        } else {
            try {
                let saved_preferences = await SavePreferences(req.headers.username, req.body);
                Log('INFO', saved_preferences);
                if(saved_preferences){
                    res.json({
                        "status": "Success",
                        "message": "Successfully saved user preferences",
                    })
                }
            }
            catch(error) {
                res.status(500).json({
                    "status": "Error",
                    "error": Error(4, error)
                })
            }
        }
    },

    ValidatePreferences : function(data){
        let result = {};

        if(!utils.DataValidator(data.systems, 'string', 2, 6)) {
            return result = GetValidationError(1);
        }

        if(!utils.DataValidator(data.device, 'string', 2, 6)) {
            return result = GetValidationError(2);
        }

        if(!utils.DataValidator(data.role, 'string', 2, 6)) {
            return result = GetValidationError(3);
        }

        if(!utils.DataValidator(data.party_size, 'number', 1)) {
            return result = GetValidationError(4);
        }

        if(!utils.DataValidator(data.age, 'object', 2)) {
            return result = GetValidationError(5);
        }

        if(!utils.DataValidator(data.age.min_age, 'number', 1, 2)) {
            return result = GetValidationError(6);
        }

        if(!utils.DataValidator(data.age.max_age, 'number', 1, 2)) {
            return result = GetValidationError(7);
        }

        if(!utils.DataValidator(data.days_available, 'array', 1, 7)) {
            return result = GetValidationError(8);
        }

        if(!utils.ArrayValidator(data.days_available, 'string')){
            return result = GetValidationError(9);
        }

        if(!utils.DataValidator(data.time_available, 'object', 2)){
            return result = GetValidationError(10);
        }

        if(!utils.DataValidator(data.time_available.start, 'string', 5)){
            return result = GetValidationError(11);
        }

        if(!utils.DataValidator(data.time_available.end, 'string', 5)){
            return result = GetValidationError(12);
        }

        return result = GetValidationError(0);
    }

};

function SavePreferences(data) {
    Log('INFO', "Saving preferences");
    return new Promise((resolve, reject) => {
        let preferences = MapPreferenceDataFromRequest(data, true);
        preferences.save(function(err) {
            if(!err) {
                Log('INFO', "Preferences saved successfully");
                resolve(true);
            } else {
                reject(false);
            }
        })
    })
}

function UpdatePreferences(data) {
    Log('INFO', "Updating preferences");
    return new Promise((resolve, reject) => {
        let preferences = MapPreferenceDataFromRequest(data, false);
        Preferences.findOneAndUpdate( {username: data.username}, preferences, function(err) {
            if(!err) {
                Log('INFO', "Preferences updated successfully");
                resolve(true);
            } else {
                Log('Error', err)
                reject(false);
            }
        })
    })
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
            message: "Systems supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 2,
            message: "Device supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 3,
            message: "Role supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 4,
            message: "Party Size supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 5,
            message: "Age supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 6,
            message: "Minumum Age supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 7,
            message: "Maximum Age supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 8,
            message: "Days Available supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 9,
            message: "Days Available data supplied is Invalid"
        },
        {
            error: true,
            id: 10,
            message: "Times Available supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 11,
            message: "Start Time supplied is either Invalid or Missing"
        },
        {
            error: true,
            id: 12,
            message: "End Time supplied is either Invalid or Missing"
        }
    ]
    if(id == 0){
        Log('INFO', "Valid Preferences Data: " + errors[id].message + " - " + id);
    } else {
        Log('INFO', "Invalid Preferences Data: " + errors[id].message + " - " + id);
    }

    return errors[id];
};

function MapPreferenceDataFromRequest(data, new_preferences){
    Log('INFO', "Mapping User Data From Request, new_preferences: " + new_preferences);
    if(new_preferences){
        preferences = new Preferences();
    } else {
        preferences = {}
    }
    preferences.username = data.username;
    preferences.systems = data.systems;
    preferences.device = data.device;
    preferences.role = data.role;
    preferences.party_size = data.party_size;
    preferences.age = data.age;
    preferences.days_free = data.days_free;
    preferences.times_free = data.times_free;
    preferences.distance = data.distance;

    return preferences;
};
