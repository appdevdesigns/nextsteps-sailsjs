/**
 * Module dependencies
 */
var Sails = require('../../node_modules/sails/lib/app');

module.exports = {

        build: function (cb) {
                var sails = new Sails();
                sails.lift({hooks:{i18n: false}, log:{level:'error'}, session:{secret:'abc123'}}, function (err) {
                        cb(err,sails);
                });
        },

        teardown: function (sails, cb) {
                sails.lower(cb);
        }
};