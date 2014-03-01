/**
 * NSServerUser
 *
 * @module      :: Model NSServerUser
 * @description :: A list of users associating the user's NextSteps UUID with CAS GUID.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
var $ = require('jquery');

module.exports = {

    tableName: 'nextsteps_user',

    attributes: {

        /* e.g.
        nickname: 'string'
        */

        UUID	: 'STRING',


        GUID	: 'STRING',

        default_lang: 'STRING',


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
        }

    }// attributes

};
