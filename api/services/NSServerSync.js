/**
 * ADCore
 *
 * @module      :: Service
 * @description :: This is handles the sync service for NextSteps Server

 *
 */
var $ = require('jquery');

var syncFormat = {
    lastSyncTimestamp:1,
    appVersion:1,
    transactionLog:1,
    username:1,
    password:1
};


var paramsCorrect = function( req, format) {

    var correct = true;
    for (var f in format) {
        if (typeof req.param(f) == 'undefined') {
            correct = false;
            break;
        }
    }
    return correct;
}


module.exports = {
    synchronize: function (req, res) {
      var dfd = $.Deferred();

      if (!paramsCorrect(req, syncFormat) ) {
          dfd.reject({status:"timestamp not defined"});
      }
      else {
        dfd.resolve({
            "lastSyncTimestamp": 1234567890,
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
         });
      }
      return dfd;
    }
};
