/**
 * ValidateUser
 *
 * @module      :: Policy
 * @description :: Make sure we have a req.appdev.nsserver.
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

    console.log('validate user ...');
    req.appdev = {};
    req.appdev.GUID = 'myGUID';


    next();
};
