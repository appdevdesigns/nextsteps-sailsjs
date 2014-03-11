/**
 * Develop Tools
 *
 * @module      :: Policy
 * @description :: Attempting to consolodate any of our Testing routines to
 *                 this step.
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
var $ = require('jquery');


module.exports = function(req, res, next) {

    if (sails.config.environment == 'production') {
        next();
    } else {

        console.log('DEVELOP TOOLS() ...');

        // now populate initial testing data from the Test System:
        NSServerSystem_Test.validateUser(req, res)
        .fail(function(err){
            // now this is weird!
            next(err);
        })
        .then(function(){

            next();
        });

    }

};


