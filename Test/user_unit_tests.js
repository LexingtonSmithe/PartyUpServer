// external
var expect = require('Chai').expect;
// internal
const user = require('../Server/Modules/user');
const config = require('../config.json');
config.logLevel = "ERROR";

describe('User Validation Tests', function() {
    function makeTestUser(){
        return  {
              "username" : "testusername",
              "password" : "testpassword",
              "display_name" : "testname",
              "bio": "test bio description of play style and or character ideas",
              "name": {
                  "first_name" : "test",
                  "last_name" : "testerson"
              },
              "contact": {
                  "email" : "test@test.com",
                  "telephone" : "01611234567"
              },
              "date_of_birth"  : "01/01/1990",
              "city" : "Manchester",
              "country" : "UK",
              "location" : {
                  "latitude" : 53.480759,
                  "longditude" : -2.290126
              }
          }
    }

    it('Should successfully validate user', function (done){
        let user_data = makeTestUser();
        let result = user.ValidateUser(user_data);
        expect(result.message).to.equal("Supplied Data Is Present And Correct");
        done();
    })

    it('Should require username for user creation', function (done){
        let user_data = makeTestUser();
        user_data.username = undefined;
        let result = user.ValidateUser(user_data);
        expect(result.message).to.equal("Username supplied is either Invalid or Missing");

        user_data.username = "X";
        result = user.ValidateUser(user_data);
        expect(result.message).to.equal("Username supplied is either Invalid or Missing");

        user_data.username = "abcdefghijklmnopqrstuvwxyz";
        result = user.ValidateUser(user_data);
        expect(result.message).to.equal("Username supplied is either Invalid or Missing");

        done();
    })

    it('Should require password for user creation', function (done){
        let user_data = makeTestUser();
        user_data.password = undefined;
        let result = user.ValidateUser(user_data);
        expect(result.message).to.equal("Password supplied is either Invalid or Missing");
        done();
    })

    it('Should require display_name for user creation', function (done){
        let user_data = makeTestUser();
        user_data.display_name = undefined;
        let result = user.ValidateUser(user_data);
        expect(result.message).to.equal("Display Name supplied is either Invalid or Missing");
        done();
    })

    it('Should require bio for user creation', function (done){
        let user_data = makeTestUser();
        user_data.bio = undefined;
        let result = user.ValidateUser(user_data);
        expect(result.message).to.equal("Bio supplied is either Invalid or Missing");
        done();
    })

    it('Should require name for user creation', function (done){
        let user_data = makeTestUser();
        user_data.name = undefined;
        let result = user.ValidateUser(user_data);
        expect(result.message).to.equal("Names supplied is either Invalid or Missing");
        done();
    })

    it('Should require first_name for user creation', function (done){
        let user_data = makeTestUser();
        user_data.name.first_name = undefined;
        let result = user.ValidateUser(user_data);
        expect(result.message).to.equal("First Name supplied is either Invalid or Missing");
        done();
    })

    it('Should require last_name for user creation', function (done){
        let user_data = makeTestUser();
        user_data.name.last_name = undefined;
        let result = user.ValidateUser(user_data);
        expect(result.message).to.equal("Last Name supplied is either Invalid or Missing");
        done();
    })

    it('Should require contact for user creation', function (done){
        let user_data = makeTestUser();
        user_data.contact = undefined;
        let result = user.ValidateUser(user_data);
        expect(result.message).to.equal("Contact supplied is either Invalid or Missing");
        done();
    })

    it('Should require email for user creation', function (done){
        let user_data = makeTestUser();
        user_data.contact.email = undefined;
        let result = user.ValidateUser(user_data);
        expect(result.message).to.equal("Email supplied is either Invalid or Missing");
        done();
    })

    it('Should require telephone for user creation', function (done){
        let user_data = makeTestUser();
        user_data.contact.telephone = undefined;
        let result = user.ValidateUser(user_data);
        expect(result.message).to.equal("Telephone supplied is either Invalid or Missing");
        done();
    })

    it('Should require date_of_birth for user creation', function (done){
        let user_data = makeTestUser();
        user_data.date_of_birth = undefined;
        let result = user.ValidateUser(user_data);
        expect(result.message).to.equal("Date of Birth supplied is either Invalid or Missing");
        done();
    })

    it('Should require city for user creation', function (done){
        let user_data = makeTestUser();
        user_data.city = undefined;
        let result = user.ValidateUser(user_data);
        expect(result.message).to.equal("City supplied is either Invalid or Missing");
        done();
    })

    it('Should require country for user creation', function (done){
        let user_data = makeTestUser();
        user_data.country = undefined;
        let result = user.ValidateUser(user_data);
        expect(result.message).to.equal("Country supplied is either Invalid or Missing");
        done();
    })

    it('Should require location for user creation', function (done){
        let user_data = makeTestUser();
        user_data.location = undefined;
        let result = user.ValidateUser(user_data);
        expect(result.message).to.equal("Location supplied is either Invalid or Missing");
        done();
    })

    it('Should require latitude for user creation', function (done){
        let user_data = makeTestUser();
        user_data.location.latitude = undefined;
        let result = user.ValidateUser(user_data);
        expect(result.message).to.equal("Latitude supplied is either Invalid or Missing");
        done();
    })

    it('Should require longditude for user creation', function (done){
        let user_data = makeTestUser();
        user_data.location.longditude = undefined;
        let result = user.ValidateUser(user_data);
        expect(result.message).to.equal("Longditude supplied is either Invalid or Missing");
        done();
    })

    it('Should check display name for profanity', function (done){
        let user_data = makeTestUser();
        user_data.display_name = "D Fucker";
        let result = user.ValidateUser(user_data);
        expect(result.message).to.equal("Display Name supplied is inappropriate");
        done();
    })

    it('Should check Bio for profanity', function (done){
        let user_data = makeTestUser();
        user_data.bio = "I only play bard cos I wanna fuck a dragon";
        let result = user.ValidateUser(user_data);
        expect(result.message).to.equal("Bio contains words or phrases that are inappropriate");
        done();
    })

});
