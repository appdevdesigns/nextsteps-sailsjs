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
                
                case 'Campus':
                    DBHelper.applyCampusTransaction(userUUID, xaction.operation, xaction.params)
                    .then(function(){
                        dfd.resolve();
                    })
                    .fail(function(err){
                        dfd.reject(err);
                    });
                    break;
                    
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
                 DBHelper.multilingualCreate(NSServerCampus, params)
                 .then(function(campus){
                     // Add entry to association model
                      var ucParms = {user_uuid : userUUID, 
                             campus_uuid : campus.campus_uuid};
                      
                     NSServerUserCampus.create(ucParms)
                     .done(function(err, userCampus){
                         if (err) {
                             // Failed to add entry to association table,
                             // remove previous created entry
                             DBHelper.multilingualDestroy(NSServerCampus, {id : campus.id}, 'campus_id')
                             .then(function(){}) // ignore return status
                             .fail(function(err){});
                             dfd.reject(err);
                         } else {
                             console.log('Created campus entry ' + campus.campus_uuid + ' for user ' + userUUID);
                             dfd.resolve();
                         }
                     });
                 })
                 .fail(function(err){
                     dfd.reject(err);
                 });
                 // Create campus entry
                 
                 break; // create
                 
             case 'update':
                 
                 NSServerCampus.findOne({campus_uuid: params.campus_uuid})
                 .done(function(err, campus){
                     if(!err) {
                         if ( ! campus.userModifyRestricted() ) {
                             var transParms = {};
                             if ( undefined != params.campus_label )
                                 transParms.campus_label = params.campus_label;
                             if ( undefined != params.long_name )
                                 transParms.long_name = params.long_name;
                             
                             var criteria = { campus_id     : campus.id, 
                                              language_code : params.language_code
                                            };
                             
                             NSServerCampusTrans.update(criteria, transParms)
                             .done(function(err, trans){
                                 if (!err) {
                                     console.log('Updated campus entry for campus ' + campus.campus_uuid);
                                     dfd.resolve();
                                 } else {
                                     dfd.reject(err);
                                 }
                             });
                             
                         } else {                            
                             console.log('Unable to update campus entry, permission denied');
                             dfd.resolve(); // Continue processing transaction log
                         }
                       
                     } else { // Unable to find campus
                         dfd.reject(err);
                     }
                 });
                  break; // update

             case 'destroy':

                 NSServerCampus.findOne({campus_uuid: params.campus_uuid})
                 .done(function(err, campus){
                     if(err) {
                         dfd.reject(err);  
                     } else if (undefined == campus) {
                         // campus not found
                         dfd.resolve();
                     } else {
                         // Determine if campus can be destroyed
                         if ( ! campus.userModifyRestricted() ) {
                             DBHelper.multilingualDestroy(NSServerCampus, {campus_uuid : params.campus_uuid}, 'campus_id')
                             .then(function(){
                                 console.log('Deleted campus ' + params.campus_uuid + ' for user ' + userUUID);
                                  dfd.resolve();
                              })
                              .fail(function(err){
                                  dfd.reject(err);
                              });

                          } else {
                              console.log('Failed to delete campus, permission denied');
                              dfd.resolve(); // Continue processing transaction log                        
                          }
                      }
                 });

              break; // destroy

             default: // unrecognized operation
                 var err = new Error('Unrecognized operation in client transaction for Campus model');
                 dfd.reject(err);
                 break; // default
         } // switch
         
         return dfd;
         
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
                                 NSServerContact.destroy({ contact_uuid : params.contact_uuid})
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
         
     }, // applyContactTransaction

     /*
      * Function to create an entry in the primary and translation tables for a model.
      * @param model - model definition for primary table, e.g. NSServerCampus
      * @param params - parameters for new entry (JSON object)
      * @return jquery deferred object
      */
     multilingualCreate : function(model, params) {
         
         var dfd = $.Deferred();
         
         var modelTrans = null;
         if ( undefined != model.getTransModel) {
             modelTrans = model.getTransModel();
         };
         
         var someParms = {};
         for (key in model.attributes) {
             someParms[key] = params[key];
         }
         
         model.create(someParms)
         .done(function(err, entry){
             if (!err) {
                 if (! modelTrans) {
                     // No translation model, we're done
                     dfd.resolve(entry); // Return entry
                 } else {
                     // Gather translation parameters and create entry in translation model
                     var transParms = {};
                     for (key in modelTrans.attributes) {
                         if (undefined != params[key]) {
                             transParms[key] = params[key];                  
                         }
                     }
                      
                     entry.addTranslation(transParms)
                     .then(function(){
                         dfd.resolve(entry); // Return entry

                     })
                     .fail(function(err){
                         // Failed to create entry in translation model
                         // Need to destroy entry in primary model, ignore return value
                         model.destroy({id : entry.id})
                         .done(function(err) {}); // .done required
                         dfd.reject(err);                  
                     });
                      
                  }
             } else {
                 dfd.reject(err);
             }
          });
         
         return dfd;
     },
 
     /*
      * Function to destroy an entry in the primary table and all entries in the associated
      * translation table for a model.
      * @param model - model definition for primary table, e.g. NSServerCampus
      * @param params - parameters used to identify entry in primary table (JSON object)
      * @param field - field name used to associate the translation table to primary table.
      * @return jquery deferred object
      */
     // TODO: refactor this so we don't need the field parameter
     multilingualDestroy : function(model, params, field){
         
         var dfd = $.Deferred();
         
         var modelTrans = null;
         if (undefined != model.getTransModel) {
             modelTrans = model.getTransModel();
         };
         
         model.findOne(params)
         .done(function(err, entry){
             if (!err) {
                 var criteria = {};
                 criteria[field] = entry.id;
                 if(modelTrans) {
                     modelTrans.destroy(criteria)
                     .done(function(err){}); // ignore return status
                 }
                 model.destroy(params)
                 .done(function(err){
                     dfd.resolve(); // ignore return status
                 });
                 
             } else {
                 // Entry couldn't be found, equivalent to destroy so we call dfd.resolve()
                 dfd.resolve();
             }
         });
         
         return dfd;
         
     }
     
};


//// LEFT OFF:
//// - figure out unit tests for testing the controller output.