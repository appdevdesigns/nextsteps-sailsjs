/**
 * NSServerPrepareOutgoingData
 *
 * @module      :: Policy
 * @description :: Prepare the response data for a client sync.
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

////Request format:
//{
//    "lastSyncTimestamp": 1234567890,
//    "appVersion": "1.5.0",
//    "transactionLog": [{
//        "operation": "create",
//        "model:": "Campus",
//        "params": {
//            "uuid": "01234567890abcdef",
//            "language_code": "en",
//            "name": "UAH"
//        }
//    }]
//}
//Response format:
//{
//    "status": success
//    "data": {
//        "lastSyncTimestamp": 1234567890,
//        "transactionLog": [{
//            "operation": "create",
//            "model:": "Campus",
//            "params": {
//                "uuid": "01234567890abcdef",
//                "language_code": "en",
//                "name": "UAH"
//            }
//        }]
//    }
//}

module.exports = function(req, res, next) {

    console.log('preparing outgoing data ...');
    var lastTime = req.param('lastSyncTimestamp');
    var userId = req.appdev.userUUID;

console.log('userId['+userId+']');
console.log('lastTime['+lastTime+']');

    NSServerTransactionLog.getLogForUser(userId, lastTime, function(err, data){
        if (err) {
            // exit policy chain w/o calling next();
            ADCore.comm.error(res, 'Failed to obtain transaction log, ' + err); 
        }
        else {
            req.appdev.transactionLog = data;
            next();
        }
    });
//    // Reading Transaction logs and storing in req.appdev.transactionlogs:
//    req.appdev.transactionLog=[{
//        "operation": "create",
//        "model:": "Campus",
//        "multilingual": false,
//        "params": {
//            "uuid": "01234567890abcdef",
//            "language_code": "en",
//            "name": "UAH"
//        }
//    }];

};
