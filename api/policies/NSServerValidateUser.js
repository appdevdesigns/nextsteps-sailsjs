/**
 * ValidateUser
 *
 * @module      :: Policy
 * @description :: Add a new user if necessary and retrieve the user's UUID.
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

    console.log();
    console.log();
    console.log('--------------------------------------------------');
    console.log('validate user ... ');
    req.appdev = {};
    console.log();
    console.log('from ip addr: '+req.connection.remoteAddress);
    console.log();
    console.log('provided params:');
    console.log(req.body);
    console.log(req.query);
    console.log(req.data);
    console.log();

    // TODO: Implement ADCore.user.current(req).GUID,
    // Assign userLang from session information
    var userGuid = ADCore.user.current(req).GUID;
    var userLang = ADCore.user.current(req).getLanguageCode(); // get user default language from session info


    if ( req.param('test') ) {

        userGuid = '9ACB3BAC-C706-5096-4ED0-2557002E3ADE';
        req.body.lastSyncTimestamp = Date.now() - 10;
        req.body.username = 'jon@vellacott.co.uk';
        req.body.password = 'manila';

   } else if ( req.param('test2') ) {

        userGuid = '5678';
        req.body.lastSyncTimestamp = Date.now() - 10;
    }


    var uuid = null;
    NSServerUser.findOne({user_guid:userGuid})
    .done(function(err, userObj){

        if (err) {
            // exit policy chain w/o calling next();
            ADCore.comm.error(res, 'Failed to validate user during sync, ' + err);
        }

        else if (userObj) {

            var text = 'Found existing user, uuid = ' + userObj.user_uuid + '  guid='+userObj.user_guid;
            endValidation({
                    logMsg:text,
                    req:req,
                    userObj:userObj,
                    res:res
                },
                next);

        }

        else { // User doesn't exist in model, create new user
            console.log('creating new user for guid = ' + userGuid);
            var newUUID = ADCore.util.createUUID();
            NSServerUser.create({user_uuid:newUUID, user_guid:userGuid, default_lang:userLang})
            .done(function(err, userObj){
                if (err) {
                    // exit policy chain w/o calling next();
                    ADCore.comm.error(res, 'Failed to create user during sync: ' + err);
                } else {

                    var text = 'Created new user record for GUID = ' + userGuid;
                    endValidation({
                            logMsg:text,
                            req:req,
                            userObj:userObj,
                            res:res
                        },
                        next);

                }
            });
        } // else


    }); // .done()
};



var endValidation = function(options, next) {
    var logMsg = options.logMsg;
    var req = options.req;
    var res = options.res;
    var userObj = options.userObj;

    console.log(logMsg);
    req.appdev.userUUID = userObj.user_uuid;
    req.appdev.userLang = userObj.default_lang;


    //// Now give our external system a chance to validate our user's credentials
    var externalSystems = NSServer.externalSystems('validateUser');
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
        var err = new Error('*** Error: NSServerValidateUser: unknown configured system ['+sails.config.nsserver.externalSystem+']');
        console.log(err);
        next(err);
    }

};
