// external
var expect = require('Chai').expect;
// internal
const user = require('../Server/Modules/user');
const config = require('../config.json');
config.logLevel = "ERROR";

describe('User Validation Tests', function() {

  var test_user = {
      "username" : "testusername",
      "password" : "testpassword",
      "display_name" : "testdisplayname",
      "bio": "test bio description of play style and or character ideas",
      "name": {
          "first_name" : "test",
          "last_name" : "testerson"
      },
      "contact": {
          "email" : "test@test.com",
          "telephone" : "0161123456789"
      },
      "date_of_birth"  : "01/01/1990",
      "city" : "Manchester",
      "country" : "UK",
      "location" : {
          "latitude" : 53.480759,
          "longditude" : -2.290126
      }
    }

    it('Should successfully validate user', function (done){
        let user_data = test_user;
        let result = user.ValidateUserData(user_data);
        expect(result.message).to.equal("Supplied Data Is Present And Correct");
        done();
    })

    it('Should require username for user creation', function (done){
        let user_data = test_user;
        delete username = undefined;
        let result = user.ValidateUserData(user_data);
        expect(result.message).to.equal("Username supplied is either Invalid or Missing");
        done();
    })

    // it('Should require display name for user creation', function (done){
    //     let user_data = test_user;
    //     delete user_data.display_name;
    //     let result = user.ValidateUserData(user_data);
    //     expect(result.message).to.equal("No Display Name Supplied");
    //     done();
    // })
    //
    // it('Should require password for user creation', function (done){
    //     let user_data = test_user;
    //     delete user_data.password;
    //     let result = user.ValidateUserData(user_data);
    //     expect(result.message).to.equal("No Password Supplied");
    //     done();
    // })
    //
    // it('Should require name for user creation', function (done){
    //     let user_data = test_user;
    //     delete user_data.name;
    //     let result = user.ValidateUserData(user_data);
    //     expect(result.message).to.equal("No Names Supplied");
    //     done();
    // })
    //
    // it('Should require first_name for user creation', function (done){
    //     let user_data = test_user;
    //     delete user_data.name.first_name;
    //     let result = user.ValidateUserData(user_data);
    //     expect(result.message).to.equal("No First Name Supplied");
    //     done();
    // })
    //
    // it('Should require last_name for user creation', function (done){
    //     let user_data = test_user;
    //     delete user_data.name.last_name;
    //     let result = user.ValidateUserData(user_data);
    //     expect(result.message).to.equal("No Last Name Supplied");
    //     done();
    // })
    //
    // it('Should require contact for user creation', function (done){
    //     let user_data = test_user;
    //     delete user_data.contact;
    //     let result = user.ValidateUserData(user_data);
    //     expect(result.message).to.equal("No Contact Supplied");
    //     done();
    // })
    //
    // it('Should require email for user creation', function (done){
    //     let user_data = test_user;
    //     delete user_data.contact.email;
    //     let result = user.ValidateUserData(user_data);
    //     expect(result.message).to.equal("No Email Supplied");
    //     done();
    // })
    //
    // it('Should require telephone for user creation', function (done){
    //     let user_data = test_user;
    //     delete user_data.contact.telephone;
    //     let result = user.ValidateUserData(user_data);
    //     expect(result.message).to.equal("No Telephone Supplied");
    //     done();
    // })
    //
    // it('Should require date_of_birth for user creation', function (done){
    //     let user_data = test_user;
    //     delete user_data.date_of_birth;
    //     let result = user.ValidateUserData(user_data);
    //     expect(result.message).to.equal("No Date Of Birth Supplied");
    //     done();
    // })
    //
    // it('Should require city for user creation', function (done){
    //     let user_data = test_user;
    //     delete user_data.city;
    //     let result = user.ValidateUserData(user_data);
    //     expect(result.message).to.equal("No City Supplied");
    //     done();
    // })
    //
    // it('Should require country for user creation', function (done){
    //     let user_data = test_user;
    //     delete user_data.country;
    //     let result = user.ValidateUserData(user_data);
    //     expect(result.message).to.equal("No Country Supplied");
    //     done();
    // })
    //
    // it('Should require location for user creation', function (done){
    //     let user_data = test_user;
    //     delete user_data.location;
    //     let result = user.ValidateUserData(user_data);
    //     expect(result.message).to.equal("No Location Supplied");
    //     done();
    // })
    //
    // it('Should require longditude for user creation', function (done){
    //     let user_data = test_user;
    //     delete user_data.location.longditude;
    //     let result = user.ValidateUserData(user_data);
    //     expect(result.message).to.equal("No Longditude Supplied");
    //     done();
    // })
    //
    // it('Should require latitude for user creation', function (done){
    //     let user_data = test_user;
    //     delete user_data.location.latitude;
    //     let result = user.ValidateUserData(user_data);
    //     expect(result.message).to.equal("No Latitude Supplied");
    //     done();
    // })
});
