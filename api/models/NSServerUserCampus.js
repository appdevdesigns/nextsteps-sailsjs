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
  	
  	    /* e.g.
  	    nickname: 'string'
  	    */
    
        user_UUID	: 'STRING',


        campus_UUID	: 'STRING'
    }

};
