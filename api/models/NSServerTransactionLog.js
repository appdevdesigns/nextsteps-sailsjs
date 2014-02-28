/**
 * NSServerTransactionLog
 *
 * @module      :: Model NSServerTransactionLog
 * @description :: List of transactions.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    tableName: 'nextsteps_transaction_log',

    attributes: {
  	
        /* e.g.
        nickname: 'string'
         */

        user_uuid	: 'STRING',

/*  Using updatedAt field rather than a timestamp.
    timestamp	: 'DATETIME',
    */


        transaction	: 'JSON'
    }

};
