/**
 * NSServerUser
 *
 * @module      :: Model NSServerUser
 * @description :: A list of users associating the user's NextSteps UUID with CAS GUID.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    tableName: 'nextsteps_user',

    attributes: {

        /* e.g.
        nickname: 'string'
        */

        UUID	: 'STRING',


        GUID	: 'STRING',


    campuses: function(filter, cb) {

        var dfd = $.Deferred();

        if (typeof cb == 'undefined') {
            if (typeof filter == 'function') {
                cb = filter;
                filter = {};
            }
        }

        filter = filter || {};

        //
        DBHelper.manyThrough(NSServerUserCampus, {user_UUID:this.UUID}, NSServerCampus, 'campus_UUID', 'UUID', filter)
        .then(function(listCampuses) {

            // now tell the campuses to translate themselves
            DBHelper.translateList(listCampuses, { language_code:true, name:true })
            .then(function(list) {

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
        })
        .fail(function(err){

            if (cb) {
                cb(err);
            }
            dfd.reject(err);
        });

        return dfd;
 /*
        NextStepsUserCampus.find({user_UUID:this.UUID})
        .then(function(list){

            var ids = [];
            for (var i=0; i<list.length; i++) {
                ids.push(list[i].campus_UUID);
            }
            filter.UUID = ids;
            NextStepsCampus.find(filter)
            .then(function(listCampuses){

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
                                cb(null, listCampuses);
                            }

                        });
                    };
                    addIt(listCampuses[lc]);
                }

            })
            .fail(function(err){
                cb(err);
            });

        })
        .fail(function(err){
            cb(err);
        });

*/


    },



    addCampus: function(campusObj, cb) {
        var dfd = $.Deferred();
        NSServerUserCampus.create({
            campus_UUID: campusObj.UUID,
            user_UUID: this.UUID
        })
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



    addTransaction: function(transaction, cb) {
        var dfd = $.Deferred();
        NSServerTransactionLog.create({
            user_UUID: this.UUID,
            transaction: transaction
        })
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
    }

  }

};
