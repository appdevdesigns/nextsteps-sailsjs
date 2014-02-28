/**
 * Process Client Data
 *
 * @module      :: Policy
 * @description :: We are given a series of transaction logs to process from the client
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

    console.log('process client data ...');

    // do all that hard work here
    var logs = req.param('transactionLogs');

    next();
};
