/**
 * ADCore
 *
 * @module      :: Service
 * @description :: This is a collection of core appdev features for an application.

 *
 */
var $ = require('jquery');

module.exports = {


    manyThrough: function(modelA, AFilter, modelB, keyAB, keyB, filter, cb) {
        var dfd = $.Deferred();

        filter = filter || {};

        modelA.find(AFilter)
        .then(function(list){
            var ids = [];
            for (var i=0; i<list.length; i++) {
                ids.push(list[i][keyAB]);
            }

            if (ids.length == 0) {
//                console.log("modelA empty; all done");
                // None in the first filter; return an empty list
                if (cb) cb(null, []);
                dfd.resolve([]);
            } else {

                filter[keyB] = ids;
//    console.log('modelB.filter:');
//    console.log(filter);

                modelB.find(filter)
                .then(function(listCampuses){

//    console.log('modelB list:');
//    console.log(listCampuses);
//
//    console.log('....');
//    console.log('cb():');
//    console.log(cb);
                    /*
                    var numDone = 0;
                    for(var lc=0; lc<listCampuses.length; lc++) {

                        var addIt = function(item) {
                            item.trans(function(err, trans) {

                                if (err) {
                                    console.log(err);
                                } else {
                                    item.name = trans.name;
                                }
                                numDone++;
                                if (numDone >= listCampuses.length) {
                                    if (cb) cb(null, listCampuses);
                                    dfd.resolve(listCampuses);
                                }

                            });
                        };
                        addIt(listCampuses[lc]);
                    }
                    */
                    if (cb) cb(null, listCampuses);
                    dfd.resolve(listCampuses);

                })
                .fail(function(err){
                    if (cb) cb(err);
                    dfd.reject(err);
                });
            }
        })
        .fail(function(err){
//console.log("manyThrough err: "+err);
            if (cb) cb(err);
            dfd.reject(err);
        });

        return dfd;
    },



    translateList:function(list, mapObj, cb) {
        var dfd = $.Deferred();

        var addIt = function(item) {
//console.log('in addIt():');
//console.log(item);

            item.trans(function(err, trans) {

                if (err) {

                    console.log(err);
                    dfd.reject(err);
                    numDone = -1; // ensures we never hit .resolve();

                } else {
                    for (var m in mapObj) {
                        if (mapObj[m]) {
                            if (typeof trans[m] != 'undefined') {
                                item[m] = trans[m];
                            }
                        }
                    }
                    item.name = trans.name;
                }
                numDone++;
                if (numDone >= list.length) {
                    if (cb) cb(null, list);
                    dfd.resolve(list);
                }

            });
        };

        var numDone = 0;
        for(var lc=0; lc<list.length; lc++) {


            addIt(list[lc]);
        }


        return dfd;
    },

    addTransaction: function(operation, obj, user) {
        var dfd = $.Deferred();
        obj.transaction(operation, user.default_lang)
        .then(function(xEntry){
            NSServerTransactionLog.create({
                user_uuid: user.user_uuid,
                transaction: xEntry
            })
            .then(function(){
                dfd.resolve();
            })
            .fail(function(err){
                dfd.reject(err);
            });
        })
        .fail(function(err){
            dfd.reject(err);
        });
        return dfd;
    },
    
    addTransactionToResponse: function(operation, obj, user, res) {
        var dfd = $.Deferred();
        obj.transaction(operation, user.default_lang)
        .then(function(xEntry){
            // TODO:  Tack this on to the end of the list in the response
            dfd.resolve();
        })
        .fail(function(err){
            dfd.reject(err);
        });
        return dfd;
    },
 
////Request format:
  //{
  //  "lastSyncTimestamp": 1234567890,
  //  "appVersion": "1.5.0",
  //  "transactionLog": [{
//        "operation": "create",
//        "model:": "Campus",
//        "params": {
//            "uuid": "01234567890abcdef",
//            "language_code": "en",
//            "name": "UAH"
//        }
  //  }]
  //}
  //Response format:
  //{
  //  "status": success
  //  "data": {
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
  //  }
  //}
    
    
   applyClientTransaction : function(userUUID, xaction) {
        
        var dfd = $.Deferred();
        
//        var modelMap = {
////              "Campus"        : NSServerCampus,
//              "Contact"       : NSServerContact,
////              "ContactStep"   : NSServerContactStep,
////              "ContactTag"    : NSServerContactTag,
////              "Group"         : NSServerGroup,
////              "Step"          : NSServerStep,
////              "Tag"           : NSServerTag,
////              "Year"          : NSServerYear       
//          };

//        dfd.resolve(data);
//        dfd.reject(err);
                
        if ( (undefined == xaction) || 
             (undefined == xaction.model) ||
             (undefined == xaction.operation) ||
             (undefined == xaction.params)) {
            
            var err = new Error('Attempted to apply invalid transaction from client');
            dfd.reject(err);
            
        } else {
                        
            switch(xaction.model){
                
//                case 'Campus':
//                    DBHelper.applyCampusTransaction(userUUID, xaction.operation, xaction.params)
//                    .then(function(){
//                        dfd.resolve();
//                    })
//                    .fail(function(err){
//                        dfd.reject(err);
//                    });
//                    break;
//                    
                case 'Contact':
                     DBHelper.applyContactTransaction(userUUID, xaction.operation, xaction.params)
                    .then(function(){
                        dfd.resolve();
                    })
                    .fail(function(err){
                        dfd.reject(err);
                    });
                    break;
                    
                default:
                    // Ignore xaction for unknown model
                    dfd.resolve();
                    break;      
            } // switch
        } // else
        
        return dfd;
        
     }, // applyClientTransaction
     
     /* Applies a transaction to the Campus model.
      * @return deferred object
      */
     applyCampusTransaction : function(userUUID, operation, params) {
         
         var dfd = $.Deferred();
         
         switch(operation){
             
             case 'create':
                 
                 // TODO: check to see if campus already exists
                 
                 // Create campus entry
                 var campusParms = {};
                 campusParms.campus_uuid = params.campus_uuid;
                 campusParms.node_id = 0; // client created campuses have no node id.
                 
                 NSServerCampus.create(campusParms)
                 .done(function(err, campus){
                     if (err) {
                         dfd.reject(err);
                     } else {
                         
                         // Add translation
                         var campusTransParms = {};
                         campusTransParms.language_code = params.language_code;
                         campusTransParms.campus_label = params.campus_label;
                         if (params.long_name){
                             campusTransParms.long_name = params.long_name;
                         }
                         campus.addTranslation(campusTransParms)
                         .then(function(){
                             
                             // Add entry to association table
                             NSServerUserCampus.create({
                                 user_uuid:userUUID,
                                 campus_uuid:campus.campus_uuid
                             })
                             .done(function(err, userCampus) {
                                 if(err){
                                     // Unable to add record to joining model
                                     // Destroy orphaned records, ignore return status
                                     NSServerCampus.destroy({campus_uuid : campus.campus_uuid})
                                     .done(function(err){}); // done handler required 
                                     NSServerCampusTrans.destroy({campus_id : campus.campus_id})
                                     .done(function(err){}); // done handler required
                                     
                                     dfd.reject(err);
                                     
                                 } else {
                                     console.log('Added new campus for user ' + userUUID);
                                     dfd.resolve();
                                 }
                             });
                      
                         })
                         .fail(function(err){
                             // We failed to add translation, remove previously added campus entry
                             NSServerCampus.destroy({campus_uuid: campusParms.campus_uuid})
                             .done(function(err, obj) {}); // ignore return, .done required
                             
                             dfd.reject(err);
                             
                         });
                     }

                 });
                 
                 break; // create
                 
             case 'update':
                 // Get campus entry
                 // Check for userModifyRestricted
                 // return or make update
                 
                 NSServerCampus.findOne({campus_uuid : params.campus_uuid})
                 .done(function(err, campus){
                     if (err){
                         dfd.reject(err);
                     } else {
                         if (campus.userModifyRestricted) {
                             // User not allowed to update campus
                         }
                     }
                 })
                 // NOTE: Syntax difference when calling update, no .done() method
                 NSServerContact.update({campus_uuid : params.campus_uuid}, params, 
                         function(err, contact){
                     if (err){
                         dfd.reject(err);
                     } else {
                         console.log('Updated contact ' + params.contact_uuid + 
                                 ' for user ' + userUUID);
                         dfd.resolve();
                     }
                 });
                 break; // update

             case 'destroy':

                 NSServerUserContact.find({contact_uuid:params.contact_uuid})
                .done(function(err, userContacts){
                    if(err){
                        dfd.reject(err);
                    } else {
                        // Destroy joining model entry, ignore return
                         NSServerUserContact.destroy(
                            {user_uuid:userUUID, 
                            contact_uuid:params.contact_uuid})
                        .done(function(err){
                            console.log('Destroyed contact ' + params.contact_uuid +
                                    ' for user ' + userUUID);

                            // If the user is the only person related to this contact,
                            // destroy the contact. Otherwise, someone else is using
                            // the same contact so we keep it.
                            if ( 1 == userContacts.length ) {
                                console.log('destroying contact');
                                // Destroy contact, ignore return
                                NSServerContact.destroy({contact_uuid:params.contact_uuid})
                                .done(function(err){
                                    dfd.resolve();
                                }); 
                                
                            } else {
                                dfd.resolve();
                            }
                        });                         
                     }
                        
                });
                break; // destroy

             default: // unrecognized operation
                 var err = new Error('Unrecognized operation in client transaction for Campus model');
                 dfd.reject(err);
                 break; // default
        } // switch
         
     }, // applyCampusTransaction
     
     /* Applies a transaction to the Contact model.
      * @return deferred object
      */
     applyContactTransaction : function(userUUID, operation, params){
         
         var dfd = $.Deferred();
                 
         switch(operation){
             
             case 'create':
                 // TODO: check to see if contact already exists
                  NSServerContact.create(params)
                 .done(function(err, contact){
                     if (err) {
                         dfd.reject(err);
                     } else {
                         NSServerUserContact.create({
                             user_uuid:userUUID,
                             contact_uuid:contact.contact_uuid
                             })
                         .done(function(err, userContact) {
                             if(err){
                                 // Unable to add record to joining model
                                 // Destroy orphaned record, ignore return status
                                 NSServerContact.destroy({contact_uuid:contact.contact_uuid})
                                 .done(function(err){}); // done handler required                                
                                 dfd.reject(err);
                             } else {
                                 console.log('Added new contact for user ' + userUUID);
                                 dfd.resolve();
                             }
                         });
                     }
                 });
                 break; // create
                 
             case 'update':
                 // TODO: check to see if contact exists
                 // NOTE: Syntax difference when calling update, no .done() method
                 NSServerContact.update({contact_uuid : params.contact_uuid}, params, 
                     function(err, contact){
                         if (err){
                             dfd.reject(err);
                         } else {
                             console.log('Updated contact ' + params.contact_uuid + 
                                     ' for user ' + userUUID);
                             dfd.resolve();
                         }
                     });
                 break; // update
                 
             case 'destroy':

                  NSServerUserContact.find({contact_uuid:params.contact_uuid})
                 .done(function(err, userContacts){
                     if(err){
                         dfd.reject(err);
                     } else {
                         // Destroy joining model entry, ignore return
                          NSServerUserContact.destroy(
                             {user_uuid:userUUID, 
                             contact_uuid:params.contact_uuid})
                         .done(function(err){
                             console.log('Destroyed contact ' + params.contact_uuid +
                                     ' for user ' + userUUID);

                             // If the user is the only person related to this contact,
                             // destroy the contact. Otherwise, someone else is using
                             // the same contact so we keep it.
                             if ( 1 == userContacts.length ) {
                                 console.log('destroying contact');
                                 // Destroy contact, ignore return
                                 NSServerContact.destroy({contact_uuid:params.contact_uuid})
                                 .done(function(err){
                                     dfd.resolve();
                                 }); 
                                 
                             } else {
                                 dfd.resolve();
                             }
                         });                         
                      }
                         
                 });
                 break; // destroy
                 
             default: // unrecognized operation
                 var err = new Error('Unrecognized operation in client transaction for Contact model');
                 dfd.reject(err);
                 break; // default
                 
         } // switch
         
         return dfd;
         
     } // applyContactTransaction

     
};


//// LEFT OFF:
//// - figure out unit tests for testing the controller output.