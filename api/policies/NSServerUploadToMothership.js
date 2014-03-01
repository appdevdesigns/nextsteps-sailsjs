/**
 * Sync To GMA
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
//// This is where we define our known adaptors:
var externalSystems = null;


module.exports = function(req, res, next) {

    if (externalSystems == null) {
        externalSystems = {
                'none': function(req, res) { var dfd = $.Deferred(); dfd.resolve(); return dfd; },
                'test': NSServerSystem_Test.upload,
                'GMA' : NSServerSystem_GMA.upload
        };
    }

    if (externalSystems[sails.config.nsserver.externalSystem]) {

        externalSystems[sails.config.nsserver.externalSystem](req,res)
        .fail(function(err){
            ADCore.comm.error(res, err);
        })
        .then(function( data ){

            // everything completed normally
            next();

        });


    } else {
        var err = new Error('*** Error: unknown configured system ['+sails.config.nsserver.externalSystem+']');
        console.log(err);
        next(err);
    }

};
