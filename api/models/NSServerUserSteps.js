/**
 * NSServerUserSteps
 *
 * @module      :: Model NSServerUserSteps
 * @description :: Association model to correlate users and custom (user created) steps. Steps stored in GMA are not included
 *                 in this model.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    tableName: 'nextsteps_user_steps',

    attributes: {
  	
        /* e.g.
        nickname: 'string'
        */
        
        user_UUID	: 'STRING',


        step_UUID	: 'STRING'
    }

};
