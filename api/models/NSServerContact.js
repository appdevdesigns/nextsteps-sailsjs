/**
 * NSServerContact
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    tableName: 'nextsteps_contact',

    attributes: {

        contact_uuid	: 'STRING',


        contact_firstname	: 'STRING',


        contact_lastname	: 'STRING',


        contact_nickname	: 'STRING',


        campus_uuid	: 'STRING',


        year_id	: 'INT',


        contact_phone	: 'STRING',


        contact_email	: 'STRING',


        contact_notes	: 'STRING'
    }

};
