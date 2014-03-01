/**
 * NSServerStepsTrans
 *
 * @module      :: Model NSServerStepsTrans
 * @description :: Translations for strings associated with NSServerSteps.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    tableName: 'nextsteps_steps_trans',

    attributes: {
  	
        /* e.g.
        nickname: 'string'
        */
        
        step_id         : 'INTEGER',
        
        language_code	: 'STRING',


        name	: 'STRING',


        description	: 'STRING'
    },
    
    // Life cycle callbacks
    afterCreate: function(newEntry, cb) {
        // Tell the campus there's an update
        NSServerSteps.findOne(newEntry.step_id)
        .then(function(step){
            NSServerSteps.afterUpdate(step, cb);
        })
        .fail(function(err){
            cb(err);
        });
    },
    
    afterUpdate: function(entry, cb) {
        // same as after create
        NSServerStepsTrans.afterCreate(entry, cb);
    }


};
