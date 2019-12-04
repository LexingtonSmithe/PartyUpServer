// external
const uuidv1 = require('uuid/v1');
// internal
const config = require('../../config.json');
const errors = require('../Data/Errors');
// local
exports = module.exports = {
    GenerateUUID : function(){
        var uuid = uuidv1();
        return uuid;
    },

    Log : function(level, message, data){
        var parsedData;
        if(typeof data === 'object'){
            parsedData = JSON.stringify(data, 0, 4)
            console.log("stringifying")
        } else {
            parsedData = data || "";
        }
        switch(config.logLevel){

            case "ALL":
                console.log(level + ": " + message + '\n' + parsedData);
            break;

            case "INFO":
                if(level == "INFO"){
                    console.log(level + ": " + message+ '\n', parsedData);
                }
            break;

            case "WARN":
                if(level == "WARN" || level == "ERROR"){
                    console.log(level + ": " + message+ '\n', parsedData);
                }
            break;

            case "ERROR":
                if(level == "ERROR"){
                    console.log(level + ": " + message+ '\n', parsedData);
                }
            break;

            default:
                console.log("Unknown Logging Level Supplied");
            break;
        }
    },

    Error : function(error_code, data){
        var parsedData;
        var that = this;
        if(typeof data === 'object'){
            parsedData = JSON.stringify(data, 0, 4)
        } else {
            parsedData = data || "";
        }
        if(errors[error_code]){
            var response = {
                "error_code": error_code,
                "message": errors[error_code].Message
            }
            exports.Log(errors[error_code].Level, errors[error_code].Code + "\n"+ errors[error_code].Log, parsedData);
        } else {
            var response = exports.Error(0);
        }
        return response;
    },

    DataValidator : function(value, data_type, min_length, max_length){
        // if it has no value
        if(!value){
            return false
        }

        // max_length is optional
        max_length = max_length || min_length;

        if(typeof value != data_type && data_type != 'array'){
            return false;
        }

        // we can't check the length of non strings
        switch(data_type){
            case 'number':
                value = value.toString();
            break;
            case 'array':
                return Array.isArray(value);
            break;
            case 'object':
                value = Object.keys(value);
            break;
        }

        // now the value type is converted to a metric length we can check against it
        if(value.length < min_length || value.length > max_length ){
            return false;
        }

        return true;
    },

    ArrayValidator : function(array, of_what){
        return array.every( function(value) {
            return typeof value == of_what
        })
    },

    CalculateAge : function(date_of_birth){
        // TODO - Actually do a thing that brings back an age instead of the Date of Birth
        let age = 35;

        return age;
    }
}
