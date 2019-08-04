var exports = module.exports = {};

exports.getDate = function(username, password){


}

exports.checkDateTimeout = function(date, timeout){
    var todays_date = new Date();
    // todo

    if(todays_date - date < timeout){
        var result = true;
    } else {
        var result = false;
    }

    return result;
}
