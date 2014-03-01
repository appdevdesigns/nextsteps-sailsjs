/**
 * NSServerUserCampus
 *
 * @module      :: Model NSServerUserCampus
 * @description :: Association model for correlating users and campuses.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    tableName: 'nextsteps_user_campus',

    attributes: {

  	    /* e.g.
  	    nickname: 'string'
  	    */

        user_UUID	: 'STRING',


        campus_UUID	: 'STRING'
    },

    // Life cycle callbacks
    afterCreate: function(newEntry, cb) {
        // Get the campus and user
        NSServerCampus.findOne({ UUID: newEntry.campus_UUID })
        .then(function(campus){
            NSServerUser.findOne({ UUID: newEntry.user_UUID })
            .then(function(user){
                // Get campus transaction entry
                DBHelper.addTransaction('create', campus, user)
                .then(function(){
                    cb(null);
                })
                .fail(function(err){
                    cb(err);
                });
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
