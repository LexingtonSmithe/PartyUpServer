// external
var expect = require('Chai').expect;
// internal
const user = require('../Server/Modules/user');
const config = require('../config.json');

describe('User Unit Tests', function() {
  it('Should Encrypt the password', function (done) {
      var password = "password";
      var encryptedPassword = "92bc9d1aba93853520b2a2fee4041718"
      var test = user.EncryptPassword(password)
      expect(test).to.equal(encryptedPassword);
      done();
  });

  it('Should Decrypt the password', function (done) {
      var password = "password";
      var encryptedPassword = "92bc9d1aba93853520b2a2fee4041718";
      var test = user.DecryptPassword(encryptedPassword);
      expect(test).to.equal(password);
      done();
  });

  it('Should create an Access Token and decrypt it', function (done) {
      var username = "bob";
      var date = Date.now();
      var unencryptedToken = "";
      unencryptedToken += config.secret;
      unencryptedToken += date;
      unencryptedToken += username;
      var encryptedToken = user.CreateAccessToken(username);
      var decryptedToken = user.DecryptAccessToken(encryptedToken);
      expect(unencryptedToken).to.equal(decryptedToken);
      done();
  });
});
