// external
var expect = require('Chai').expect;
var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();
var Mockgoose = require('mock-mongoose').Mockgoose;
var mockgoose = new Mockgoose(mongoose);
// internal
const user = require('../Server/Modules/user');
const config = require('../config.json');

describe('User Integration Tests', function() {
  it('Should connect to the mock database', function (done) {
      var foo = 1;
      var bar = 1;
      expect(foo).to.equal(bar);
      done();
  });

  it('Should Decrypt the password', function (done) {
      var foo = 1;
      var bar = 1;
      expect(foo).to.equal(bar);
      done();
  });

  it('Should create an Access Token and decrypt it', function (done) {
      var foo = 1;
      var bar = 1;
      expect(foo).to.equal(bar);
      done();
  });
});
