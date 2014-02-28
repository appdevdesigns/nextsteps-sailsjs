/**
 * isAuthenticated
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

    console.log('preparing outgoing data ...');

  // User is allowed, proceed to the next policy,
  // REading Transaction logs and storing in req.appdev.transactionlogs:
    req.appdev.transactionLog=[{
        "operation": "create",
        "model:": "Campus",
        "multilingual": false,
        "params": {
            "uuid": "01234567890abcdef",
            "language_code": "en",
            "name": "UAH"
        }
    }];

    req.appdev.timestamp = Date.now();

    next();
};
