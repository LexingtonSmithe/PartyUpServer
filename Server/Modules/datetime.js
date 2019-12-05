// external

// internal
const config = require('../../config.json');
const utils = require('./utils');
const Log = utils.Log;
const User = require('../Models/user');
// local
module.exports = {

    CheckTokenDateTimeout : function(date){
        Log('INFO', "Checking date timeout for token");
        return CalculateTimeout(date, config.tokenTimeOut);
    },

    CheckSearchDateTimeout : function(date){
        Log('INFO', "Checking date timeout for search");
        return CalculateTimeout(date, config.searchTimeOut);
    },

    GetLastLoginDate : function(username){
        Log('INFO', "Getting last login date of: " + username);
        return new Promise((resolve, reject) => {
            User.findOne({username: username}, function(err, user){
                if(user) {
                    Log('INFO', "Found last login date: " + user.last_login);
                    resolve(user.last_login);
                } else {
                    reject(Error(2));
                }
                if(err){
                    reject(Error(8, err));
                }
            })
        })
    }
};

function DaysToMilliseconds(days){
    let hours_in_a_day = 24
    let minutes_in_a_day = hours_in_a_day * 60
    let seconds_in_a_day = minutes_in_a_day * 60
    let milliseconds_in_a_day = seconds_in_a_day * 1000
    let result = days * milliseconds_in_a_day;
    return result;

}

function CalculateTimeout(date_to_check, date_to_check_against){
    let todays_date = Date.now();
    let timeout = DaysToMilliseconds(date_to_check_against);
    let timeDifference = todays_date - date_to_check;
    Log('INFO', "Checking date timeout: " + timeout + " Time Difference: " + timeDifference);
    var result;
    if(timeDifference < timeout){
        result = false;
        Log('INFO', "Date supplied is within timeout range");
    } else {
        result = true;
        Log('INFO', "Supplied date is out of timeout range: " + timeout);
    }
    return result;
}
