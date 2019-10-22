// external
const uuidv1 = require('uuid/v1');
// internal
const config = require('../../config.json');
const errors = require('../Data/Errors');
// local
module.exports = {
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
                if(type == "INFO"){
                    console.log(level + ": " + message+ '\n', parsedData);
                }
            break;
            case "ERROR":
                if(type == "ERROR"){
                    console.log(level + ": " + message+ '\n', parsedData);
                }
            break;
            case "DEBUG":
                if(type == "DEBUG"){
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
    }    
};
