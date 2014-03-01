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
    
    campusesForUser: function(userUUID, filter, cb) {
        var dfd = $.Deferred();

        if (typeof cb == 'undefined') {
            if (typeof filter == 'function') {
                cb = filter;
                filter = {};
            }
        }

        filter = filter || {};
        DBHelper.manyThrough(NSServerUserCampus, {user_uuid:userUUID}, NSServerCampus, 'campus_uuid', 'campus_uuid', filter)
        .then(function(listCampuses) {
            if (cb) {
                cb(null, listCampuses);
            }
            dfd.resolve(listCampuses);
        })
        .fail(function(err){
            if (cb) {
                cb(err);
            }
            dfd.reject(err);
        });
        return dfd;

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
