/**
 * NSServerUser
 *
 * @module      :: Model NSServerUser
 * @description :: A list of users associating the user's NextSteps UUID with CAS GUID.
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

    }

};
