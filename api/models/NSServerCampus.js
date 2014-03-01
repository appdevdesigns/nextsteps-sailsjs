/**
 * NSServerCampus
 *
 * @module      :: Model NSServerCampus
 * @description :: A list of known campuses. The node_id field represents the GMA node id.
 *                 See also NSServerCampusTrans for translation strings associated with campuses.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
var $ = require('jquery');

module.exports = {

  tableName: 'nextsteps_campus',

  attributes: {

  	/* e.g.
  	nickname: 'string'
  	*/

    campus_uuid	: 'STRING',


    node_id	: 'INTEGER',


    // Generate transaction entry
    transaction: function(operation, lang, cb) {
        var dfd = $.Deferred();
        var xEntry = {  'operation': operation,
                        'model': 'Campus',
                        'params': {
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
console.log('Campus.transaction(): translation results:');
console.log(transEntry);
                    xEntry.params.campus_label = transEntry.campus_label;
//                    xEntry.params.long_name = transEntry.long_name;
console.log(xEntry);
                    if (cb) {
                        cb(xEntry);
                    }
                    dfd.resolve(xEntry);
                }
            });
        }
        return dfd;
    },

    addTranslation: function(transEntry, cb) {
        var dfd = $.Deferred();
        transEntry.campus_id = this.id;
        NSServerCampusTrans.create(transEntry)
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
        NSServerCampusTrans.find({campus_id:this.id,language_code:lang})
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



    users: function(filter, cb) {
        var dfd = $.Deferred();

        if (typeof cb == 'undefined') {
            if (typeof filter == 'function') {
                cb = filter;
                filter = {};
            }
        }

        filter = filter || {};
        DBHelper.manyThrough(NSServerUserCampus, {campus_uuid:this.campus_uuid}, NSServerUser, 'user_uuid', 'user_uuid', filter)
        .then(function(listUsers) {
            if (cb) {
                cb(null, listUsers);
            }
            dfd.resolve(listUsers);
        })
        .fail(function(err){
            if (cb) {
                cb(err);
            }
            dfd.reject(err);
        });
        return dfd;
    }
  },


  // Life cycle callbacks
  afterCreate: function(newEntry, cb) {
      // Nothing to do.  No users if we're just now creating a node
      cb();
  },

  afterUpdate: function(entry, cb) {
      NSServerCampus.findOne(entry.id)
      .then(function(campus){
          // Notify all users
          campus.users().
          then(function(users){
              var numDone = 0;
              var numToDo = 0;
              users.forEach(function(user){
                  DBHelper.addTransaction('update', campus, user)
                  .then(function(){
                      numDone++;
                      if (numDone == numToDo){
                          cb(null);
                      }
                  })
                  .fail(function(err){
                      cb(err);
                  });
                  numToDo++;
              });
              if (numToDo == 0){
                  cb(null);
              }
          })
          .fail(function(err){
              cb(err);
          });
      })
      .fail(function(err){
          cb(err);
      });
  }


};
