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

        user_uuid	: 'STRING',

        campus_uuid	: 'STRING'

    },
    
    // Life cycle callbacks
    afterCreate: function(newEntry, cb) {
        // Get the campus and user
        NSServerCampus.findOne({ campus_uuid: newEntry.campus_uuid })
        .then(function(campus){
            NSServerUser.findOne({ user_uuid: newEntry.user_uuid })
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
