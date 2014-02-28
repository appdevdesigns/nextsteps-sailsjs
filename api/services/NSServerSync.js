/**
 * NSServerSync
 *
 * @module      :: Service
 * @description :: This is handles the sync service for NextSteps Server

 *
 */
var $ = require('jquery');
var GMA = require('gma-api');
var ADCore = require('./ADCore.js');

var syncFormat = {
    lastSyncTimestamp:1,
    appVersion:1,
    transactionLog:1,
    username:1,
    password:1
};


var paramsCorrect = function( req, format) {

    var correct = true;
    if (typeof req.param('test') != 'undefined') {
        ADCore.auth.markAuthenticated(req, 'GUID1');
    } else {
      for (var f in format) {
          if (typeof req.param(f) == 'undefined') {
              correct = false;
              break;
          }
      }
    }
    return correct;
}


module.exports = {
    synchronize: function (req, res) {
        var dfd = $.Deferred();
        if (!paramsCorrect(req, syncFormat) ) {
            dfd.reject({status:"required param not defined"});
        } else {
            // read In given Data
            var userID = req.param('username');
            var password = req.param('password');
          
            var guid = ADCore.auth.getAuth(req);
            var dfdReady = $.Deferred();
            
            
            // validateUser
            validateUser(guid)
            .then(function(uuid){
console.log('validation done...');
                if (true || config.gma) {
                    // setupGMA
                    setupGMA(userID, password)
                    .then(function(gma){
console.log('GMA setup done...');
                        // getAssignments
                        var assignmentsDone = getAssignments(gma);
                        
                        // getMeasurements
                        var measurementsDone = getMeasurements(gma);
                    
                        
                        $.when(assignmentsDone, measurementsDone)
                        .then(function(){
console.log('GMA assignments and measurements done ...');
                            dfdReady.resolve();
                        })
                        .fail(function(err){
                            dfd.reject(err);
                        });
                        
                        
                    })
                    .fail(function(err){
                        dfd.reject(err);
                    });
                } else {
                    // Nothing to do if no GMA
                    dfdReady.resolve();
                }
                // Get transactions to send
                var lastSyncTimestamp = req.param('lastSyncTimestamp');
                getTransactionsForUser(uuid, lastSyncTimestamp)
                .then(function (logToSend){
                    var transactionLog = req.param('transactionLog');
                    applyTransactionsFromUser(uuid, transactionLog)
                    .then(function(timestamp) {
                        dfd.resolve({
                            "lastSyncTimestamp": timestamp,
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
                    })
                    .fail(function(err){
                        dfd.reject(err);
                    });
                })
                .fail(function(err){
                    dfd.reject(err);
                });
            })
            .fail(function(err){
                dfd.reject(err);
            });
            
            $.when(dfdReady)
            .then(function(){
                
            })
            .fail(function(err){
                dfd.reject(err);
            });
      }
      
      return dfd;
    },
    
    // These are for exposing private functions for testing only
    test: {
        validateUser: function( guid ) {
            return validateUser(guid);
        },
        setupGMA: function( username, password ) {
            return setupGMA( username, password );
        },
        getAssignments: function( gma ) {
            return getAssignments( gma );
        }
    }
};



var validateUser = function( guid ) {
    var dfd = $.Deferred();
    
    console.log('validating user ... ');
    if (!guid) {
        dfd.reject("Invalid GUID");
    } else {
        // is in User table?
        // If not, generate UUID and insert
        var uuid = ADCore.util.createUUID();
        // create uuid, guid
        dfd.resolve(uuid);
    }
    
    return dfd;
};



var setupGMA = function( username, password ) {
    var dfd = $.Deferred();
    console.log('setting up GMA .. ');
    /// setup here:
    var dummy = {
        nodes: { 101: "Assign1", 120: "Assign2"}
    };
    dfd.resolve(dummy);
    
    return dfd;
};



var getAssignments = function( gma ) {
    var dfd = $.Deferred();
    console.log('getting assignments ');
    
    // assume all new
    var numDone = 0;
    var numToDo = 0;
    for (var id in gma.nodes){
        var createIt = function(gmaId, name) {
            NSServerCampus.create({
        
                UUID: ADCore.util.createUUID(),
                node_id: gmaId,
            })
            .then(function(campus){
                campus.addTranslation({
                    language_code: 'en',
                    short_name: name
                })
                .then(function(){
                    numDone++;
                    if (numDone == numToDo){
                        dfd.resolve();
                    }
                })
                .fail(function(err){
                    dfd.reject(err);
                });
            })
            .fail(function(err){
                dfd.reject(err);
            });
        };
        createIt(id, gma.nodes[id]);
        numToDo++;
    }
    /*
    1.1 if Add
        insert CAMPUS[ UUID, nodeID ] 
        insert CampusTrans [ langCode, name ]
       else
    If update and name change -> update campusTrans[lang, name]
                -> for all users in userCampus with campus_uuid 
                    -> TransactionLog [user_uuid, timestamp, ….]
                

    1.2. -> user_campus[user_uuid, campus_uuid]
        -> TransactionLog [user_uuid, timestamp, ….] 
     */
//    dfd.resolve();
    
    return dfd;
};



var getMeasurements = function( gma ) {
    var dfd = $.Deferred();
    console.log('getting measurements ');
    /*
    2. gma.getMeasurement()
    Each and every measurement -> 
        if new Add -> Step[uuid, mid] & stepTrans [lang, name,    description]
            -> for all users in user-campus with campus_uuid
                -> TransactionLog [user_uuid, timestamp, ….]
        else
        if udpate -> udpate stepTrans[lang, name, desc]
        -> for all users in user.campus with campus_uuid
            -> TransactionLog [user_uuid, timestamp, ….]

     */
    dfd.resolve();
    
    return dfd;
};


var getTransactionsForUser = function( userUuid, lastSync ) {
    var dfd = $.Deferred();
    console.log('getting transactions to send ');
    /*
    Filter transaction log by user and last update time

     */
    dfd.resolve("log");
    
    return dfd;
};

var applyTransactionsFromUser = function( userUuid, log ) {
    var dfd = $.Deferred();
    console.log('applying transactions from user ');
    /*
    Apply changes from the user
    Add each entry to the transaction log
    Return the current sync time
     */
    dfd.resolve("syncTime = now");
    
    return dfd;
};


