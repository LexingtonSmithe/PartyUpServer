// external
var expect = require('Chai').expect;
// internal
const date_time = require('../Server/Modules/datetime');
const config = require('../config.json');
config.logLevel = "ERROR";

describe('Date Time Validation Tests', function() {

    it('Token Timeout should NOT return timeout for 1 day', function (done){
        let test_offset = (24*60*60*1000) * 1 // 1 days
        let date_to_check = new Date()
        date_to_check.setTime(date_to_check.getTime() - test_offset)
        let result = date_time.CheckTokenDateTimeout(date_to_check);
        expect(result).to.be.false;
        done();
    })

    it('Token Timeout should return timeout for 6 days', function (done){
        let test_offset = (24*60*60*1000) * 6 // 6 days
        let date_to_check = new Date()
        date_to_check.setTime(date_to_check.getTime() - test_offset)
        let result = date_time.CheckTokenDateTimeout(date_to_check);
        expect(result).to.be.true;
        done();
    })

    it('Search Timeout should NOT return timeout for 1 day', function (done){
        let test_offset = (24*60*60*1000) * 1 // 1 days
        let date_to_check = new Date()
        date_to_check.setTime(date_to_check.getTime() - test_offset)
        let result = date_time.CheckSearchDateTimeout(date_to_check);
        expect(result).to.be.false;
        done();
    })

    it('Search Timeout should return timeout for 6 days', function (done){
        let test_offset = (24*60*60*1000) * 6 // 6 days
        let date_to_check = new Date()
        date_to_check.setTime(date_to_check.getTime() - test_offset)
        let result = date_time.CheckSearchDateTimeout(date_to_check);
        expect(result).to.be.true;
        done();
    })

});
