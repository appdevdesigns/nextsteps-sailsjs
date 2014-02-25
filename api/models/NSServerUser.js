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


    password	: 'STRING'
  }

};
