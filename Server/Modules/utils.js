const config = require('../../config.json');
const errors = require('../Data/Errors');
var exports = module.exports = {};

exports.GetDate = function(username, password){


}

exports.CheckDateTimeout = function(date, timeout){
    var todays_date = new Date().now;
    exports.Log('INFO', todays_date);
    exports.Log('INFO', date);
    if(todays_date - date > timeout){
        var result = true;
    } else {
        var result = false;
    }
    return result;
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
