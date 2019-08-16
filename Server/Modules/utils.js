// external
const uuidv1 = require('uuid/v1');
// internal
const config = require('../../config.json');
const errors = require('../Data/Errors');
// local
var exports = module.exports = {};

exports.GenerateUUID = function(){
    var uuid = uuidv1();
    return uuid;
}

exports.Log = function(level, message, data){
    var data = data || "No Data";
    switch(config.logLevel){
        case "ALL":
            console.log(level + ": " + message + '\n' + data);
        break;
        case "INFO":
            if(type == "INFO"){
                console.log(level + ": " + message+ '\n' + data);
            }
        break;
        case "ERROR":
            if(type == "ERROR"){
                console.log(level + ": " + message+ '\n' + data);
            }
        break;
        case "DEBUG":
            if(type == "DEBUG"){
                console.log(level + ": " + message+ '\n' + data);
            }
        break;
        default:
            console.log("Unknown Logging Level Supplied");
        break;
    }
}

exports.Error = function(error_code, data){
    data = data || "";
    if(errors[error_code]){
        var response = {
            "Error Code": error_code,
            "Message": errors[error_code].Message
        }
        exports.Log(errors[error_code].Level, errors[error_code].Log, data);
    } else {
        var response = exports.Error(0);
    }
    return response;
}
