var $ = require('jquery');

var ADUtil = require('./helpers/util_helper.js');
var tsails = null;
var GMA = null;



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





var assert = require('chai').assert;
describe('NSServerSystem_GMA: ', function () {
  before(function(done){

      this.timeout(10000);

      var initDone = ADUtil.testingDBInit({
          models:[],
          dataPaths:[]
      });
      $.when(initDone).then(function(data){
          tsails = data;
          GMA = tsails.services.nsserversystem_gma;
          done();
      })
      .fail(function(err){
          done(err);
      });

  });

  describe (' uploadGatherSteps : ', function (){


      it(' able to call ', function(){
          var req = new ADUtil.Request(reqData);
          before(function(done){
              GMA.test('uploadGatherSteps', req, function(err){
                  done(err);
              });
          });

          assert.ok(true, 'we should have gotten here.');

      });

  });


});
