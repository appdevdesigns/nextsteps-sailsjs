/**
 * NSServerSteps
 *
 * @module      :: Model NSServerSteps
 * @description :: List of known steps. The measurement_id field corresponds to the GMA measurement id.
 *                 See also NSServerStepsTrans for translation strings related to this model.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
var $ = require('jquery');

module.exports = {

    tableName: 'nextsteps_steps',

    attributes: {
  	    
         step_uuid	: 'STRING',

         campus_uuid   : 'STRING',

         measurement_id	: 'STRING',

         // Is the user restricted from modifying this entry?
         userModifyRestricted: function() {
             // Not allowed if this is a "GMA" node
             return (this.measurement_id != 0);
         },

         // Generate transaction entry
         transaction: function(operation, lang, cb) {
             var dfd = $.Deferred();
             var xEntry = {  'operation': operation,
                             'model': 'Step',
                             'params': {
                                 'step_uuid': this.step_uuid,
                                 'campus_uuid': this.campus_uuid
                             } };
             if (operation != "destroy") {
                 // Look up the translation
                 this.trans(lang, function(err, transEntry){
                     if (err) {
                         if (cb) {
                             cb(err);
                         }
                         dfd.reject(err);
                     } else {
                         xEntry.params.step_label = transEntry.step_label;
                         xEntry.params.description = transEntry.description;
                         if (cb) {
                             cb(xEntry);
                         }
                         dfd.resolve(xEntry);
                     }
                 });
             } else {
                 // Nothing more to do
                 dfd.resolve(xEntry);
             }
             return dfd;
         },
         
         addTranslation: function(transEntry, cb) {
             var dfd = $.Deferred();
             transEntry.step_id = this.id;
             NSServerStepsTrans.create(transEntry)
             .then(function(obj){
                 if (cb) {
                     cb(null);
                 }
                 dfd.resolve();
             })
             .fail(function(err){
                 if (cb) {
                     cb(err);
                 }
                 dfd.reject(err);
             });
             return dfd;
         },

         trans:function(lang, cb) {
             // find the translations for this entry.
             // the translations will be stored in a this.translations {} object
             // trans('en', function(err, list) {})
             //

             var self = this;
             if (typeof cb == 'undefined') {
                 cb = lang;
                 lang = 'en';
             }
             NSServerStepsTrans.find({step_id:this.id,language_code:lang})
             .then(function(listTrans){
                 var thisTrans = {};
                 for (var lt=0; lt<listTrans.length; lt++) {
                     thisTrans[listTrans[lt].language_code] = listTrans[lt];
                 }
                 self.translations = thisTrans;
                 cb(null, listTrans[0]);
             })
             .fail(function(err){
                 cb(err);
             });
         },

         campus: function(cb) {
             var dfd = $.Deferred();
             if (!this.isPersonal()) {
                 NSServerCampus.findOne({
                     campus_uuid: this.campus_uuid
                 })
                 .then(function(campus) {
                     if (cb) {
                         cb(null, campus);
                     }
                     dfd.resolve(campus);
                 })
                 .fail(function(err){
                     if (cb) {
                         cb(err);
                     }
                     dfd.reject(err);
                 });
             } else {
                 dfd.reject("This is a custom step");
             }
             
             return dfd;
         },
         
         isPersonal: function() {
             return (this.campus_uuid == null);
         },
         
         // Get list of user objects associated with this step
         // Handles both personal steps and campus steps
         users: function(cb) {
             var dfd = $.Deferred();
             
             var userListDfd = $.Deferred();
             if (this.isPersonal()) {
                 // A Personal step; get the user UUIDs
                 userListDfd = getPersonalStepUsers(this);
             } else {
                 // A campus step; get the campus users
                 userListDfd = getCampusStepUsers(this);
             }

             $.when(userListDfd)
             .then(function(users){
                 // All done
                 if (cb) {
                     cb(null, users);
                 }
                 dfd.resolve(users);
             })
             .fail(function(err){
                 if (cb) {
                     cb(err);
                 }
                 dfd.reject(err);
             });
             
             return dfd;
         }

    }, // attributes
    
    /*
     * @return model for translation table
     */ 
    getTransModel : function() {
        return NSServerStepsTrans;
    },
    
    // Life cycle callbacks
//    afterCreate: function(newEntry, cb) {
//        createTransaction(newEntry.id, 'create')
//        .then(function(){
//            cb(null);
//        })
//        .fail(function(err){
//            cb(err);
//        });
//    },
//    
    afterUpdate: function(entry, cb) {
        createTransaction(entry.id, 'update')
        .then(function(){
            cb(null);
        })
        .fail(function(err){
            cb(err);
        });
    }
};

var getPersonalStepUsers = function(step) {
    var dfd = $.Deferred();
    // A Personal step; get the user UUIDs
    NSServerUserSteps.find({
        step_UUID: step.UUID
    })
    .then(function(userSteps) {
        // Now get the user objects
        var userObjs = [];
        var numDone = 0;
        var numToDo = 0;
        userSteps.forEach(function(userStep){
            userStep.user()
            .then(function(user){
                userObjs.push(user);
                numDone++;
                if (numDone == numToDo){
                    // All done
                    dfd.resolve(userObjs);
                }
            })
            .fail(function(err){
                dfd.reject(err);
            });
            numToDo++;
        });
        if (numToDo == 0){
            cb(null);
        }
    })
    .fail(function(err){
        dfd.reject(err);
    });
    return dfd;
};

var getCampusStepUsers = function(step) {
    var dfd = $.Deferred();
    // A campus step; get the campus object
    step.campus()
    .then(function(campus){
        // Now get the user objects
        campus.users()
        .then(function(userObjs){
            dfd.resolve(userObjs);
        })
        .fail(function(err){
            dfd.reject(err);
        });
    })
    .fail(function(err){
        dfd.reject(err);
    });
    return dfd;
};

var createTransaction = function(id, operation){
    var dfd = $.Deferred();
    // Get an instance
    NSServerSteps.findOne(id)
    .then(function(step){
        // Notify all users
        step.users()
        .then(function(users){
            var numDone = 0;
            var numToDo = 0;
            users.forEach(function(user){
                DBHelper.addTransaction(operation, step, user)
                .then(function(){
                    numDone++;
                    if (numDone == numToDo){
                        dfd.resolve();
                    }
                })
                .fail(function(err){
                    dfd.reject(err);
                });
                numToDo++;
            });
            if (numToDo == 0){
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
    return dfd;
};
