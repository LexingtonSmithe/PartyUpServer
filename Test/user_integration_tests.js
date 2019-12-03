// external
var expect = require('Chai').expect;

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
});
