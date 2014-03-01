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
    }

};
