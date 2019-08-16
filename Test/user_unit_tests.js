// external
var expect = require('Chai').expect;
// internal
const user = require('../Server/Modules/user');
const config = require('../config.json');

describe('User Unit Tests', function() {
  it('Should Encrypt the password', function (done) {
      var password = "password";
      var encryptedPassword = "1a2124793feb02fc6bfdece630b4ed99"
      var test = user.EncryptPassword(password)
      expect(test).to.equal(encryptedPassword);
      done();
  });

  it('Should Decrypt the password', function (done) {
      var password = "password";
      var encryptedPassword = "1a2124793feb02fc6bfdece630b4ed99";
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
