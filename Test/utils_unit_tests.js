// external
var expect = require('Chai').expect;
// internal
const utils = require('../Server/Modules/utils');
const config = require('../config.json');
config.logLevel = "ERROR";

describe('Util Data Validation Tests', function() {
    let too_short = "Bum";
    let too_long = "This Is Too Long";
    let example_string = "Test Data";
    let example_number = 6969;
    let example_array = [1, 2 ,3];
    let example_object = {
       some : "data",
       thing : "data",
       test : "data",
       bollocks : "data"
    };

    it('Should reject invalid data for - minimum length', function (done){
        let result = utils.DataValidator(too_short, 'string', 5, 25);
        expect(result).to.be.false;
        done();
    })

    it('Should reject invalid data for - max length', function (done){
        let result = utils.DataValidator(too_long, 'string', 3, 8);
        expect(result).to.be.false;
        done();
    })

    it('Should reject invalid data for - incorrect data type - array', function (done){
        let result = utils.DataValidator(example_string, 'array', 3, 5);
        expect(result).to.be.false;
        done();
    })

    it('Should reject invalid data for - incorrect data type - string', function (done){
        let result = utils.DataValidator(example_number, 'string', 3, 5);
        expect(result).to.be.false;
        done();
    })

    it('Should reject invalid data for - incorrect data type - object', function (done){
        let result = utils.DataValidator(example_number, 'object', 3, 5);
        expect(result).to.be.false;
        done();
    })

    it('Should reject invalid data for - incorrect data type - number', function (done){
        let result = utils.DataValidator(example_string, 'number', 3, 5);
        expect(result).to.be.false;
        done();
    })

    it('Should accept valid data for - correct data type - string', function (done){
        let result = utils.DataValidator(example_string, 'string', 3, 10);
        expect(result).to.be.true;
        done();
    })

    it('Should accept valid data for - correct data type - number', function (done){
        let result = utils.DataValidator(example_number, 'number', 3, 5);
        expect(result).to.be.true;
        done();
    })

    it('Should accept valid data for - correct data type - array', function (done){
        let result = utils.DataValidator(example_array, 'array', 3, 5);
        expect(result).to.be.true;
        done();
    })

    it('Should accept valid data for - correct data type - object', function (done){
        let result = utils.DataValidator(example_object, 'object', 3, 5);
        expect(result).to.be.true;
        done();
    })

});

describe('Util Array Validation Tests', function() {
    let valid_array = [
        "Monday",
        "Tuesday",
        "Wednesday"
    ];

    let slightly_invalid_array = [
        "Monday",
        "Tuesday",
        "Bumday"
    ];

    let very_invalid_array = [
        "Bollocksday",
        "Shitday",
        "Bumday"
    ];

    let comparison_array = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];

    it('Should accept valid array comparison data', function (done){
        let result = utils.ArrayValidator(valid_array, 'string', comparison_array);
        expect(result).to.be.true;
        done();
    })

    it('Should reject invalid array data for - One incorrect value', function (done){
        let result = utils.ArrayValidator(slightly_invalid_array, 'string', comparison_array);
        expect(result).to.be.false;
        done();
    })

    it('Should reject invalid array data for - No matching values', function (done){
        let result = utils.ArrayValidator(very_invalid_array, 'string', comparison_array);
        expect(result).to.be.false;
        done();
    })

});
