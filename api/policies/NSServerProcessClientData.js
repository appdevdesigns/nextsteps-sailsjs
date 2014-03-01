/**
 * Process Client Data
 *
 * @module      :: Policy
 * @description :: We are given a series of transaction logs to process from the client
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

//var modelMap = {
//    "Campus" : NSServerCampus,
//    "Contact" : NSServerContact,
//        
//}

module.exports = function(req, res, next) {

    console.log('process client data ...');

    // do all that hard work here
    var log = req.param('transactionLog');
    
//    for ( var t = 0; t < log.length(); t++ )
//        applyTransaction(req, res, log[t]);

    next();
};

//var applyTransaction = function(req, res, xaction){
//
//    var model = getServerModel(xaction.model);
//    // if hasTrans, parse params 
//    model.processTransaction(xaction.operation, xaction.params);
//
//    
//}
//
//var getServerModel = function(clientModel){
//    
//    var serverModel = null;
//    
//    switch (clientModel) {
//        case 'Campus':
//            serverModel = NSServerCampus;
//            break;
//        case 'Contact':
//            
//        ContactStep
//        ContactTag
//        Group
//        Step
//        Tag
//        Year
//            
//    }
//}
////Request format:
//{
//  "lastSyncTimestamp": 1234567890,
//  "appVersion": "1.5.0",
//  "transactionLog": [{
//      "operation": "create",
//      "model:": "Campus",
//      "params": {
//          "uuid": "01234567890abcdef",
//          "language_code": "en",
//          "name": "UAH"
//      }
//  }]
//}
//Response format:
//{
//  "status": success
//  "data": {
//      "lastSyncTimestamp": 1234567890,
//      "transactionLog": [{
//          "operation": "create",
//          "model:": "Campus",
//          "params": {
//              "uuid": "01234567890abcdef",
//              "language_code": "en",
//              "name": "UAH"
//          }
//      }]
//  }
//}