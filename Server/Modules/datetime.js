// external

// internal
const config = require('../../config.json');
// local
var exports = module.exports = {};



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
