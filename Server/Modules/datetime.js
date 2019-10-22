// external

// internal
const config = require('../../config.json');
const utils = require('./utils');
const Log = utils.Log;
const User = require('../Models/user');
// local
module.exports = {

    CheckDateTimeout : function(date){
        let todays_date = Date.now();
        let timeout = DaysToMilliseconds(config.tokenTimeOut);
        let timeDifference = todays_date - date;
        Log('INFO', "Current date: " + todays_date);
        Log('INFO', "Checking date timeout: " + timeout + " Time Difference: " + timeDifference);
        var result;
        if(timeDifference < timeout){
            result = true;
            Log('INFO', "Date supplied is within timeout range");
        } else {
            result = false;
            Log('INFO', "Supplied date is out of timeout range: " + timeout);
        }
        return result;
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
