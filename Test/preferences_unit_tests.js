// external
var expect = require('Chai').expect;
// internal
const preferences = require('../Server/Modules/preferences');
const config = require('../config.json');
config.logLevel = "ERROR";

describe('Preferences Validation Tests', function() {
    function makeTestPreferences(){
        return  {
        	"systems": "DnD 5e",
        	"device": "IRL",
        	"role": "Player",
        	"party_size": 5,
        	"age": {
                "min_age" : 25,
                "max_age" : 45
            },
        	"days_available": [
                "Sunday"
            ],
        	"time_available":{
                "start" : "16:00",
                "end" : "20:00"
            },
        	"distance": 5
        }
    }

    it('Should successfully validate preferences', function (done){
        let preference_data = makeTestPreferences();
        let result = preferences.ValidatePreferences(preference_data);
        expect(result.message).to.equal("Supplied Data Is Present And Correct");
        done();
    })

    it('Should require systems for preferences creation', function (done){
        let preference_data = makeTestPreferences();
        preference_data.systems = undefined;
        let result = preferences.ValidatePreferences(preference_data);
        expect(result.message).to.equal("Systems supplied is either Invalid or Missing");
        done();
    })

    it('Should require device for preferences creation', function (done){
        let preference_data = makeTestPreferences();
        preference_data.device = undefined;
        let result = preferences.ValidatePreferences(preference_data);
        expect(result.message).to.equal("Device supplied is either Invalid or Missing");
        done();
    })

    it('Should require role for preferences creation', function (done){
        let preference_data = makeTestPreferences();
        preference_data.role = undefined;
        let result = preferences.ValidatePreferences(preference_data);
        expect(result.message).to.equal("Role supplied is either Invalid or Missing");
        done();
    })

    it('Should require party_size for preferences creation', function (done){
        let preference_data = makeTestPreferences();
        preference_data.party_size = undefined;
        let result = preferences.ValidatePreferences(preference_data);
        expect(result.message).to.equal("Party Size supplied is either Invalid or Missing");
        done();
    })

    it('Should require age for preferences creation', function (done){
        let preference_data = makeTestPreferences();
        preference_data.age = undefined;
        let result = preferences.ValidatePreferences(preference_data);
        expect(result.message).to.equal("Age supplied is either Invalid or Missing");
        done();
    })

    it('Should require min_age for preferences creation', function (done){
        let preference_data = makeTestPreferences();
        preference_data.age.min_age = undefined;
        let result = preferences.ValidatePreferences(preference_data);
        expect(result.message).to.equal("Minumum Age supplied is either Invalid or Missing");
        done();
    })

    it('Should require max_age for preferences creation', function (done){
        let preference_data = makeTestPreferences();
        preference_data.age.max_age = undefined;
        let result = preferences.ValidatePreferences(preference_data);
        expect(result.message).to.equal("Maximum Age supplied is either Invalid or Missing");
        done();
    })

    it('Should require days_available for preferences creation', function (done){
        let preference_data = makeTestPreferences();
        preference_data.days_available = undefined;
        let result = preferences.ValidatePreferences(preference_data);
        expect(result.message).to.equal("Days Available supplied is either Invalid or Missing");
        done();
    })

    it('Should require time_available for preferences creation', function (done){
        let preference_data = makeTestPreferences();
        preference_data.time_available = undefined;
        let result = preferences.ValidatePreferences(preference_data);
        expect(result.message).to.equal("Times Available supplied is either Invalid or Missing");
        done();
    })

    it('Should require start time for preferences creation', function (done){
        let preference_data = makeTestPreferences();
        preference_data.time_available.start = undefined;
        let result = preferences.ValidatePreferences(preference_data);
        expect(result.message).to.equal("Start Time supplied is either Invalid or Missing");
        done();
    })

    it('Should require date_of_birth for preferences creation', function (done){
        let preference_data = makeTestPreferences();
        preference_data.time_available.end = undefined;
        let result = preferences.ValidatePreferences(preference_data);
        expect(result.message).to.equal("End Time supplied is either Invalid or Missing");
        done();
    })

});
