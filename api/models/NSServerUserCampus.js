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
    
    // ------------------------------------------------------
    // Life cycle callbacks
    // ------------------------------------------------------
    afterCreate: function(newEntry, cb) {
 
        // Following a create, we want to add a transaction for the associated user.
        // Get the campus and user
        NSServerCampus.findOne({ campus_uuid: newEntry.campus_uuid })
        .then(function(campus){
            NSServerUser.findOne({ user_uuid: newEntry.user_uuid })
            .then(function(user){
                // Get campus transaction entry
                DBHelper.addTransaction('create', campus, user)
                .then(function(){
                    cb();
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
    }, // afterCreate

    beforeDestroy: function(criteria, cb) {
        
        // Prior to a destroy, we want to add a transaction for the associated user.
         NSServerUserCampus.findOne(criteria)
        .done(function(err, userCampus){
            if (err) {
                cb(err);
            } else {
            
               NSServerCampus.findOne({campus_uuid: userCampus.campus_uuid})
               .done(function(err, campus){
                   if(err) {
                       cb(err);
                   } else {
                       NSServerUser.findOne({user_uuid: userCampus.user_uuid})
                       .done(function(err, user){                       
                           if(err){
                               cb(err);
                           } else {
       
                             DBHelper.addTransaction('destroy', campus, user)
                               .then(function(){
                                   cb(null);
                               })
                               .fail(function(err){
                                   cb(err);
                               });
                           }       
                       });

                   }
               });

            }                    
        });
        
    } // beforeDestroy


};
