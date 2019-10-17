// external

// internal
const config = require('../../config.json');
const utils = require('./utils');
const Log = utils.Log;
// local
var exports = module.exports = {};



exports.CheckDateTimeout = function(date, timeout){
    var todays_date = new Date().now;
    Log('INFO', todays_date);
    Log('INFO', date);
    if(todays_date - date > timeout){
        var result = true;
    } else {
        var result = false;
    }
    return result;
}
