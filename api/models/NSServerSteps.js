/**
 * NSServerSteps
 *
 * @module      :: Model NSServerSteps
 * @description :: List of known steps. The measurement_UUID field corresponds to the GMA measurement id.
 *                 See also NSServerStepsTrans for translation strings related to this model.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
var $ = require('jquery');

module.exports = {

    tableName: 'nextsteps_steps',

    attributes: {
  	
    	  /* e.g.
    	  nickname: 'string'
    	  */
    
         UUID	: 'STRING',

         campus_UUID   : 'STRING',

         measurement_id	: 'STRING',

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
             dfd = $.Deferred();
             if (!this.isPersonal()) {
                 NSServerCampus.findOne({
                     UUID: this.campus_UUID
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
             return (this.campus_UUID == null);
         },
         
         // Get list of user objects associated with this step
         // Handles both personal steps and campus steps
         users: function(cb) {
             dfd = $.Deferred();
             if (this.isPersonal()) {
                 // A Personal step; get the user UUIDs
                 NSServerUserSteps.find({
                     step_UUID: this.UUID
                 })
                 .then(function(userSteps) {
                     // Now get the user objects
                     var userObjs = [];
                     var numDone = 0;
                     var numToDo = 0;
                     for (var i in userSteps){
                         userSteps[i].user()
                         .then(function(user){
                             userObjs.push(user);
                             numDone++;
                             if (numDone == numToDo){
                                 // All done
                                 if (cb) {
                                     cb(null, userObjs);
                                 }
                                 dfd.resolve(userObjs);
                             }
                         })
                         .fail(function(err){
                             if (cb) {
                                 cb(err);
                             }
                             dfd.reject(err);
                         });
                     }
                 })
                 .fail(function(err){
                     if (cb) {
                         cb(err);
                     }
                     dfd.reject(err);
                 });
             } else {
                 // A campus step; get the campus object
                 this.campus()
                 .then(function(campus){
                     // Now get the user objects
                     campus.users()
                     .then(function(userObjs){
                         // All done
                         if (cb) {
                             cb(null, userObjs);
                         }
                         dfd.resolve(userObjs);
                     })
                     .fail(function(err){
                         if (cb) {
                             cb(err);
                         }
                         dfd.reject(err);
                     });
                 })
                 .fail(function(err){
                     if (cb) {
                         cb(err);
                     }
                     dfd.reject(err);
                 });
             }
             
             return dfd;
         }

    }

};
