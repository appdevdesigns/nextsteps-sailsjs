/**
 * NSServerStepsTrans
 *
 * @module      :: Model NSServerStepsTrans
 * @description :: Translations for strings associated with NSServerSteps.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
$ = require('jquery');

module.exports = {

    tableName: 'nextsteps_steps_trans',

    attributes: {
  	        
        step_id         : 'INTEGER',
        
        language_code	: 'STRING',


        step_label	: 'STRING',


        step_description	: 'STRING'
    },
    
    // Life cycle callbacks
    afterCreate: function(newEntry, cb) {
        createTransaction(newEntry.id, 'create')
        .then(function(){
            cb(null);
        })
        .fail(function(err){
            cb(err);
        });
    },
    
    afterUpdate: function(entry, cb) {
        createTransaction(entry.id, 'update')
        .then(function(){
            cb(null);
        })
        .fail(function(err){
            cb(err);
        });
    }


};

var createTransaction = function(id, operation){
    var dfd = $.Deferred();
    // Get an instance
    NSServerSteps.findOne(id)
    .then(function(step){
        // Notify all users
        step.users()
        .then(function(users){
            var numDone = 0;
            var numToDo = 0;
            users.forEach(function(user){
                DBHelper.addTransaction(operation, step, user)
                .then(function(){
                    numDone++;
                    if (numDone == numToDo){
                        dfd.resolve();
                    }
                })
                .fail(function(err){
                    dfd.reject(err);
                });
                numToDo++;
            });
            if (numToDo == 0){
                dfd.resolve();
            }
        })
        .fail(function(err){
            dfd.reject(err);
        });
    })
    .fail(function(err){
        dfd.reject(err);
    });
    return dfd;
};
