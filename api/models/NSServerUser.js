/**
 * NSServerUser
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
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


    username	: 'STRING',


    password	: 'STRING',

    campuses: function(filter, cb) {

        if (typeof cb == 'undefined') {
            cb = filter;
            filter = {};
        }

        filter = filter || {};
        DBHelper.manyThrough(NSServerUserCampus, {user_UUID:this.UUID}, NSServerCampus, 'campus_UUID', 'UUID', filter)
        .then(function(listCampuses) {
            DBHelper.translateList(listCampuses, { language_code:true, name:true })
            .then(function(list) {
                cb(null, listCampuses);
            })
            .fail(function(err){
                cb(err);
            });
        })
        .fail(function(err){
            cb(err);
        });
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


    }
  }

};
