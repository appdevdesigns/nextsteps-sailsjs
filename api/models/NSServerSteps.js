/**
 * NSServerSteps
 *
 * @module      :: Model NSServerSteps
 * @description :: List of known steps. The measurement_UUID field corresponds to the GMA measurement id.
 *                 See also NSServerStepsTrans for translation strings related to this model.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    tableName: 'nextsteps_steps',

    attributes: {
  	
    	  /* e.g.
    	  nickname: 'string'
    	  */
    
         UUID	: 'STRING',


         measurement_UUID	: 'STRING'
    }

};
