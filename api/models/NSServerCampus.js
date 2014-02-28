/**
 * NSServerCampus
 *
 * @module      :: Model NSServerCampus
 * @description :: A list of known campuses. The node_UUID field represents the GMA node id. 
 *                 See also NSServerCampusTrans for translation strings associated with campuses.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  tableName: 'nextsteps_campus',

  attributes: {

  	/* e.g.
  	nickname: 'string'
  	*/

    UUID	: 'STRING',


    node_id	: 'INTEGER',

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

        if (typeof cb == 'undefined') {
            cb = filter;
            filter = {};
        }

        filter = filter || {};

        DBHelper.manyThrough(NSServerUserCampus, {campus_UUID:this.UUID}, NSServerUser, 'user_UUID', 'UUID', filter)
        .then(function(listUsers) {
            cb(null, listUsers);
        })
        .fail(function(err){
            cb(err);
        });

    }
  }

};
