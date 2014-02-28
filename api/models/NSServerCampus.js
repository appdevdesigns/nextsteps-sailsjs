/**
 * NSServerCampus
 *
 * @module      :: Model NSServerCampus
 * @description :: A list of known campuses. The node_UUID field represents the GMA node id. 
 *                 See also NSServerCampusTrans for translation strings associated with campuses.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
        
    tableName: 'nextsteps_campus',

    attributes: {

        /* e.g.
           nickname: 'string'
         */

        UUID	: 'STRING',


        node_UUID	: 'STRING'
    }

};
