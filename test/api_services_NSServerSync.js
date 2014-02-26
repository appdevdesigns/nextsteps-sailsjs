var nssSync = require('../api/services/NSServerSync.js');
var assert = require('chai').assert;
var $ = require('jquery');

var request = function(data) {
    this.data = data;

};
request.prototype.param = function(key) {
    return this.data[key];
};


var reqData = {
    "lastSyncTimestamp": 1234567890,
    "appVersion": "1.5.0",
    "transactionLog": [{
        "operation": "create",
        "model:": "Campus",
        "multilingual": false,
        "params": {
            "uuid": "01234567890abcdef",
            "language_code": "en",
            "name": "UAH"
        }
    }]
};

var resExpectError = {};
var resNoError = {};

describe('NSS Sync Service: ', function () {
  before(function(){
  });
  
  it ('Good Request', function (){
    var req = new request(reqData);
    nssSync.synchronize(req, resNoError).done(function(data){
        assert.ok(true, 'Should have called this function');
        
    });
  });
  it ('Bad Timestamp', function (){
      var noTimestamp = {};
      $.extend(noTimestamp, reqData);
      delete noTimestamp.lastSyncTimestamp;
      var req = new request(noTimestamp);
      nssSync.synchronize(req, resNoError).done(function(data){
          assert.ok(false, 'Expected to fail');
        
      })
      .fail(function(err) {
          assert.ok(true, 'Expected failure');
      });
  });
  it ('Bad App Version', function (){
      var noAppVersion = {};
      $.extend(noAppVersion, reqData);
      delete noAppVersion.appVersion;
      var req = new request(noAppVersion);
      nssSync.synchronize(req, resNoError).done(function(data){
          assert.ok(false, 'Expected to fail');
        
      })
      .fail(function(err) {
          assert.ok(true, 'Expected failure');
      });
  });
  it ('Bad Transaction Log', function (){
      var noTransactionLog = {};
      $.extend(noTransactionLog, reqData);
      delete noTransactionLog.transactionLog;
      var req = new request(noTransactionLog);
      nssSync.synchronize(req, resNoError).done(function(data){
          assert.ok(false, 'Expected to fail');
        
      })
      .fail(function(err) {
          assert.ok(true, 'Expected failure');
      });
  });
  it ('Bad Username', function (){
      var noUsername = {};
      $.extend(noUsername, reqData);
      delete noUsername.username;
      var req = new request(noUsername);
      nssSync.synchronize(req, resNoError).done(function(data){
          assert.ok(false, 'Expected to fail');
        
      })
      .fail(function(err) {
          assert.ok(true, 'Expected failure');
      });
  });
  it ('Bad Password', function (){
      var noPassword = {};
      $.extend(noPassword, reqData);
      delete noPassword.password;
      var req = new request(noPassword);
      nssSync.synchronize(req, resNoError).done(function(data){
          assert.ok(false, 'Expected to fail');
        
      })
      .fail(function(err) {
          assert.ok(true, 'Expected failure');
      });
  });
  
});
