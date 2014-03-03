/**
 * NSServerSystem_GMA
 *
 * @module      :: Service
 * @description :: This is the driver for communicating with the GMA system.
 *
 */
var $ = require('jquery');
var GMA = require('gma-api');
var async = require('async');


module.exports = {



    /**
     * @function download
     *
     * *** Required NSServerSystem Interface Method.
     *
     * This method handles pulling data from the GMA system and packaging
     * it in a format the NextStepsServer can understand.
     *
     * @param obj req
     * @param object res
     * @return jQuery Deferred
     */
    download: function( req, res) {
        var dfd = $.Deferred();

        console.log('GMA.download() ...');

        var gma = null;


        async.series([


            //// Step 1:  Make sure we have a gma object
            function(next) {
                if (req.nssystem.gma.gma){
                    gma = req.nssystem.gma.gma;
                    next();
                } else {

                    var userID = req.param('username');
                    var password = req.param('password');
                    loginGMA(userID, password)
                    .fail(function(err){
                        next(err);
                    })
                    .then(function(newGma){
                        gma = newGma;
                        next();
                    });
                }
            },


            //// Step 2:  Make sure we have assignments pulled
            function(next) {
                if (req.nssystem.gma.assignments){
                    next();
                } else {

                    storeAssignments(req, gma)
                    .fail(function(err){
                        next(err);
                    })
                    .then(function(){
                        next();
                    });
                }
            },


            //// Step 3: Package GMA Data into NSServer format
            function(next) {
                var byID = req.nssystem.gma.assignments.byID;
                var list = req.nssystem.gma.assignments.list;

                // now get measurements and package results in proper format
                packageObjects(byID, list)
                .fail(function(err){
                    next(err);
                })
                .then(function(data){
                    next(null, data);
                });
            }


        ], function(err, results) {
            if (err) {
                console.log(err);
                dfd.reject(err);
            } else {

                // finally transform the package into NSServer format:
                var data = results.pop();  // <-- data from last step

                for (var id in data.measurements) {
                    var newMeasurementList = [];
                    var currList = data.measurements[id];
                    currList.forEach(function(measurement){
                       newMeasurementList.push(measurement.data);
                    });
                    data.measurements[id] = newMeasurementList;
                }

                dfd.resolve(data);
            }
        });

        return dfd;
    },



    /**
     * @function upload
     *
     * *** Required NSServerSystem Interface Method.
     *
     * This method handles pushing data into the GMA system.
     *
     * When the method completes, all reports impacted by the current
     * user submission will have been updated.
     *
     * @param obj req
     * @param object res
     * @return jQuery Deferred
     */
    upload: function( req, res ) {

        var dfd = $.Deferred();

        console.log('GMA.upload() ...');

        async.series([


                      //// Step 1:  Gather All the ContactSteps to process
                      // when done: req.nssystem.gma.upload.stepsToDo = {
                      //    measurementID:[{ date: ContactSteps.step_date, obj:measurementObj}],
                      //    ...
                      // }
                      function(next) {
//                          uploadGatherSteps(req, next);
                      },


                      //// Step 2:  Determine Different Reports To Submit
                      // for mid in stepsToDo
                      //    for list in list[]
                      //        get Report for list[i].date // list[i].obj.reportForDate(list[i].date)
                      //        add to reportsToSubmit
                      //
                      // when done:  req.nssystem.gma.upload.reportsToSubmit = {
                      //    startDate:[{Report}, {Report}...],
                      // }
                      function(next) {
//                          uploadDetermineStatKinds(req, next);
                      },


                      //// Step 3: Submit Reports:
                      // For each startDate
                      //  For each report
                      //    for each measurement
                      //        gather all ContactSteps for time period
                      //        measurement.value( length of array)
                      //        measurement.save();
                      function(next) {
//                             uploadSubmitReports(req, next);
                      }


                  ], function(err, results) {
                      if (err) {
                          console.log(err);
                          dfd.reject(err);
                      } else {

                          var data = {};

                          dfd.resolve(data);
                      }
                  });
/*

- Server:  onUpdate() of a stats resource
if (current stat.gmaSynced == true)
    if stat stays within the same period
          update the entry, and leave the gmaSynced value as is
    else
          recalculate that stat value for current period (minus this stat)
          submit GMA update for that measurement & period
          then set this stat as gmaSynced == false (should then be detected in next section)
          and of course save the stat info
    end if
else
    just save the stat info.
end if


- Server: onDelete() of a stats resource
if (current stat.gmaSynced == true)
      recalculate that stat value for current period (minus this stat)
      submit GMA update for that measurement & period
      then set this stat as gmaSynced == false (should then be detected in next section)
      and of course save the stat info
else
just remove the stat info.
end if


- Server: onTimer() :  Perform a GMA Sync operation.
for each user queued in GMASyncQueue
for each node for this user
figure out the period for the node
get the stats needing syncing  grouped by period  (all have gmaSynced == false)

for each stat period
for each stat in that period
calculate all the stats that exist
next stat

submit to GMA all stat totals for this period
if success ->   update stats entry to gmaSync = true
else  notify [who?]/[How?]
next stat period
next node
next user



 */


        dfd.resolve();

        return dfd;
    },


    // These are for exposing private functions for testing only
    test: {
//        loginGMA:function(){  },


    },



    /**
     * @function validateUser
     *
     * *** Required NSServerSystem Interface Method.
     *
     * This method attempts to authenticate the user's username/password
     * credentials against GMA.
     *
     * If successful:  req.nssystem.gma.gma is populated with the active gma
     *                 object to be reused for the rest of this Plug-In's
     *                 operation.
     *
     * If unsuccessful: the deferred is rejected.
     *
     * @param string username
     * @param string password
     * @return jQuery Deferred
     */
    validateUser: function(req, res, cb){
        var dfd = $.Deferred();

        console.log('  - gma validating user ... ');

        // ok, we're going to do the work of gathering all our Assignments here
        // since we'll need to use it later.

        if (typeof req.nssystem == 'undefined') {
            req.nssystem = {};
        }

        // this is where we store our data:
        req.nssystem.gma = {};



        var userID = req.param('username');
        var password = req.param('password');
//// TODO: this is only for testing at Hack-a-thon
if ((userID != 'jon@vellacott.co.uk')
        || (password != 'manila')) {
    console.log('  *** userID['+userID+'] pword['+password+']');
    dfd.reject(new Error('Invalide GMA User'));
    return dfd;
}
        loginGMA(userID, password)
        .fail(function(err){
            if (cb) cb(err);
            dfd.reject(err);
        })
        .then(function(gma){

            // save instance of gma connection for later:
            req.nssystem.gma.gma = gma;


            // go ahead and request assignments for later use:
            if (!req.nssystem.gma.assignments) {

                storeAssignments(req, gma)
                .fail(function(err){
                    if (cb) cb(err);
                    dfd.reject(err);
                })
                .then(function(){
                    if (cb) cb();
                    dfd.resolve();
                });

            } else {

                if (cb) cb();
                dfd.resolve();
            }

        });

        return dfd;
    }
};



/**
 * @function loginGMA
 *
 * Authenticate the user's username, password credentials against GMA.
 *
 * If successful, then the active GMA object is returned which can be
 * used to interact with GMA on the user's behalf.
 *
 *
 * @param string username
 * @param string password
 * @return jQuery Deferred
 */
var loginGMA = function(username, password) {
    var dfd = $.Deferred();

    var gma = new GMA({
        gmaBase: sails.config.nsserver.gmaBaseURL,
        casURL: sails.config.nsserver.casURL
    });

    gma.loginDrupal(username, password)
    .fail(function(err){
        console.log("  *** Problem logging in to GMA server");
        console.log(err);
        dfd.reject(err);
    })
    .then(function(){
//console.log("gma.loginDrupal().done():  success");
        console.log('  - gma auth results: GID['+gma.GUID+']  '+gma.preferredName+'   '+gma.renId);

        dfd.resolve(gma);
    });

    return dfd;

};



/**
 * @function packageNSData
 *
 * Given the Assignment information for the user, parse all the
 * Measurement information associated with these assigments and
 * return them in the following format:
 * {
 *      assignments: {
 *          ID1:'name1',
 *          ID2:'name2',
 *          ...
 *          IDN:'nameN'
 *      },
 *      measurements: {
 *          AssignmentID1:[
 *              {MeasurementObject},
 *              {MeasurementObject}
 *          ]
 *      }
 * }
 *
 * @param string username
 * @param string password
 * @return jQuery Deferred
 */
var packageObjects = function(byID, list) {
    var dfd = $.Deferred();

    var gmaData = {};

    console.log("  - gma returned "+list.length+' assignments');

    gmaData.assignments = byID;
    gmaData.measurements = {};

    var numDone = 0;
    for (var l=0; l<list.length; l++) {

        var getMeasurements = function(assignment) {
            assignment.getMeasurements()
            .fail(function(err){
                dfd.reject(err);
            })
            .then(function(listMeasurements){
                console.log('    - assignment '+assignment.nodeId+' has '+listMeasurements.length+' measurements ');
                gmaData.measurements[assignment.nodeId] = listMeasurements;
                numDone++;
                if (numDone >= list.length) {
                    dfd.resolve(gmaData);
                }
            });
        };
        getMeasurements(list[l]);
    }

    return dfd;
};


/*
var pullAssignments = function(gma) {
    var dfd = $.Deferred();

    var gmaData = {};

    gma.getAssignments()
    .fail(function(err){
        console.log("Problem fetching user assignments");
        console.log(err);
        dfd.reject(err);
    })
    .then(function(byID, byName, list) {

        console.log("  - gma returned "+list.length+' assignments');

        gmaData.assignments = byID;
        gmaData.measurements = {};

        var numDone = 0;
        for (var l=0; l<list.length; l++) {

            var getMeasurements = function(assignment) {
                assignment.getMeasurements()
                .fail(function(err){
                    dfd.reject(err);
                })
                .then(function(listMeasurements){
                    console.log('    - assignment '+assignment.nodeId+' has '+listMeasurements.length+' measurements ');
                    gmaData.measurements[assignment.nodeId] = listMeasurements;
                    numDone++;
                    if (numDone >= list.length) {
                        dfd.resolve(gmaData);
                    }
                });
            };
            getMeasurements(list[l]);
        }

    });

    return dfd;
};
*/



/**
 * @function storeAssignments
 *
 * Store the current user's GMA assignments into the req object.
 *
 * on a successful completion, we will store :
 *  req.nssystem.gma.assignments.list = [ {AssignmentObject},...]
 *  req.nssystem.gma.assignments.byID = { ID:'name', ID2:'name2', ... }
 *
 * @param object req
 * @param object gma
 * @return jQuery Deferred
 */
var storeAssignments = function(req, gma) {
    var dfd = $.Deferred();

    req.nssystem.gma.assignments = null;

    gma.getAssignments()
    .fail(function(err){
        console.log("    * Problem fetching user assignments");
        console.log(err);
        dfd.reject(err);
    })
    .then(function(byID, byName, list) {
        req.nssystem.gma.assignments = {};
        req.nssystem.gma.assignments.list = list;
        req.nssystem.gma.assignments.byID = byID;

        dfd.resolve();
    });

    return dfd;
};



/*
var setupGMA = function( username, password ) {
    var dfd = $.Deferred();

    var gmaData = {};

//console.log('in setupGMA() ... ');

    /// setup here:
    // create new gma instance
    var gma = new GMA({
        gmaBase: sails.config.nsserver.gmaBaseURL,
        casURL: sails.config.nsserver.casURL
    });

    gma.loginDrupal(username, password)
    .fail(function(err){
        console.log("Problem logging in to GMA server");
        console.log(err);
        dfd.reject(err);
    })
    .done(function(){
//console.log("gma.loginDrupal().done():  success");
        console.log('  - gma auth results: GID['+gma.GUID+']  '+gma.preferredName+'   '+gma.renId);

//console.log("\nFetching user assignments...");
        gma.getAssignments()
        .fail(function(err){
            console.log("Problem fetching user assignments");
            console.log(err);
            dfd.reject(err);
        })
        .done(function(byID, byName, list) {

            console.log("  - gma returned "+list.length+' assignments');

            gmaData.assignments = byID;
            gmaData.measurements = {};

            var numDone = 0;
            for (var l=0; l<list.length; l++) {

                var getMeasurements = function(assignment) {
                    assignment.getMeasurements()
                    .fail(function(err){
                        dfd.reject(err);
                    })
                    .then(function(listMeasurements){
                        console.log('    - assignment '+assignment.nodeId+' has '+listMeasurements.length+' measurements ');
                        gmaData.measurements[assignment.nodeId] = listMeasurements;
                        numDone++;
                        if (numDone >= list.length) {
                            dfd.resolve(gmaData);
                        }
                    });
                };
                getMeasurements(list[l]);
            }

        });
    });

    return dfd;
};
*/

