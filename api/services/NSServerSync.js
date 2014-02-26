/**
 * ADCore
 *
 * @module      :: Service
 * @description :: This is handles the sync service for NextSteps Server

 *
 */
var $ = require('jquery');

module.exports = {
    synchronize: function (req, res) {
      var dfd = $.Deferred();
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
      return dfd;
    }
};
