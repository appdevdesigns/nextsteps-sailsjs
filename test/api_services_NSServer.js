
var ADUtil = require('./helpers/util_helper.js');
var sails = null;
var nsserver = null;

var $ = require('jquery');

/*
var request = function(data) {
    this.data = data;
    this.session = {};
};
request.prototype.param = function(key) {
    return this.data[key];
};
request.prototype.removeParam = function(key) {
    delete this.data[key];
};


var reqData = {
    "lastSyncTimestamp": 1234567890,
    "appVersion": "1.5.0",
    "username": "user",
    "password": "password",
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
*/


var assert = require('chai').assert;
describe('services/NSSSync.js : ', function () {
    before(function(done){
        this.timeout(40000);

        var initDone = ADUtil.testingDBInit({
            models:[],
            dataPaths:[]
        });
        $.when(initDone).then(function(data){
            sails = data;
            done();
        })
        .fail(function(err){
            done(err);
        });
    });

    describe ('ExternalSystems() : ', function (){
        var knownInterfaces = {
                download:1,
                upload:1,
                validateUser:1,
                test:1
        };
        var knownExternalSystems = {
                'none':1,
                'test':1,
                'GMA':1
        };

        // for each expected interface method()
        for (var i in knownInterfaces) {

            it('system['+i+'] defined', function(){
                var system = NSServer.externalSystems(i);
                assert.ok(system,' system is defined');

                // make sure an option for each system is defined
                for (var a in knownExternalSystems) {
                    if (system[a]) {
                        assert.ok(true, ' system '+a+'.'+i+'() found.');
                    } else {
                        assert.ok(false, ' system '+a+'.'+i+'() NOT found!');
                    }
                }
            });

        }

    });

/*
  it ('Good Request', function (){
    var req = new request(reqData);
    ADCore.auth.markAuthenticated(req, 'GUID1');
    nssSync.synchronize(req, resNoError).done(function(data){
        assert.ok(true, 'Should have called this function');
    })
    .fail(function(err) {
        assert.ok(false, 'Expected success');
    });

  });
  it ('Unauth Request', function (){
      var req = new request(reqData);
      nssSync.synchronize(req, resNoError).done(function(data){
          assert.ok(false, 'Should not have called this function');
      })
      .fail(function(err) {
          assert.ok(true, 'Expected failure');
      });

    });
  it ('Missing Timestamp', function (){
      var req = new request(reqData);
      req.removeParam('lastSyncTimestamp');
      nssSync.synchronize(req, resNoError).done(function(data){
          assert.ok(false, 'Expected to fail');
      })
      .fail(function(err) {
          assert.ok(true, 'Expected failure');
      });
  });
  it ('Missing App Version', function (){
      var req = new request(reqData);
      req.removeParam('appVersion');
      nssSync.synchronize(req, resNoError).done(function(data){
          assert.ok(false, 'Expected to fail');
      })
      .fail(function(err) {
          assert.ok(true, 'Expected failure');
      });
  });
  it ('Missing Transaction Log', function (){
      var req = new request(reqData);
      req.removeParam('transactionLog');
      nssSync.synchronize(req, resNoError).done(function(data){
          assert.ok(false, 'Expected to fail');
      })
      .fail(function(err) {
          assert.ok(true, 'Expected failure');
      });
  });
  it ('Missing Username', function (){
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
  it ('Missing Password', function (){
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
*/

});
