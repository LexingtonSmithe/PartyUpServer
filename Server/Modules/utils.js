const config = require('../../config.json');
var exports = module.exports = {};

exports.GetDate = function(username, password){


}

exports.CheckDateTimeout = function(date, timeout){
    var todays_date = new Date();
    // todo

    if(todays_date - date < timeout){
        var result = true;
    } else {
        var result = false;
    }

    return result;
}

exports.Log = function(level, message, error_code){
    var error_code = error_code || "";
    switch(config.logLevel){
        case "ALL":
            console.log(level + ": " + message);
        break;
        case "INFO":
            if(type == "INFO"){
                console.log(level + ": " + message);
            }
        break;
        case "ERROR":
            if(type == "ERROR"){
                console.log(level + ": " + message);
            }
        break;
        case "DEBUG":
            if(type == "DEBUG"){
                console.log(level + ": " + message);
            }
        break;
        default:
            console.log("Unknown Logging Level Supplied");
        break;
    }
}
