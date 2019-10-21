// external

// internal
const config = require('../../config.json');
const utils = require('./utils');
const Log = utils.Log;
// local
var exports = module.exports = {};



exports.CheckDateTimeout = function(date){
    let todays_date = new Date().now;
    let timeout = config.tokenTimeOut;
    Log('INFO', todays_date);
    Log('INFO', date);
    if(todays_date - date > timeout){
        let result = true;
    } else {
        let result = false;
    }
    return result;
}
