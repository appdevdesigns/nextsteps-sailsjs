/**
 * NSServerSystem_GMA
 *
 * @module      :: Service
 * @description :: This is the driver for communicating with the GMA system.
 *
 */
var $ = require('jquery');
var GMA = require('gma-api');


module.exports = {

    download: function( req, res) {
        var dfd = $.Deferred();


        console.log('GMA.download() ...');

        // Sync the Data from GMA

        var userID = req.param('username');
        var password = req.param('password');
            //req.appdev.userUUID = 'UUID';
            // setupGMA
        setupGMA(userID, password)
        .fail(function(err){
            console.log();
            console.error(' *** error attempting to setupGMA():');
            console.log(err);
            dfd.reject(err);
        })
        .then(function(gma){

//console.log('GMA setup done...');
//console.log(gma);


            for (var id in gma.measurements) {
                var newMeasurementList = [];
                var currList = gma.measurements[id];
                currList.forEach(function(measurement){
                   newMeasurementList.push(measurement.data);
                });
                gma.measurements[id] = newMeasurementList;
            }

/*
//// Temporary Testing options:
if (typeof req.param('test2') != 'undefined') {
    gma.assignments[101] = 'Assign1b';
    gma.assignments[199] = 'Assign3';
    gma.measurements[101][1].measurementName = 'NAME2';
    gma.measurements[101][1].measurementDescription = 'DESC2';
    gma.measurements[120].push(
           {
               measurementId: 25,
               measurementName: "name4a",
               measurementDescription: "desc4a",
               measurementValue: 33
           });

    gma.measurements[199] = [
          {
              measurementId: 92,
              measurementName: "name1b",
              measurementDescription: "desc1b",
              measurementValue: 33
          }];
    req.appdev.userUUID = 'UUID2';
}
*/
            dfd.resolve(gma);

        });

        return dfd;
    },



    upload: function( req, res ) {

        var dfd = $.Deferred();

        console.log('GMA.upload() ...');

        dfd.resolve();

        return dfd;
    },


    // These are for exposing private functions for testing only
    test: {

    }
};







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
        console.log(gma.GUID, gma.preferredName, gma.renId);

//console.log("\nFetching user assignments...");
        gma.getAssignments()
        .fail(function(err){
            console.log("Problem fetching user assignments");
            console.log(err);
            dfd.reject(err);
        })
        .done(function(byID, byName, list) {

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

/*
    var dummy = {
        assignments: { 101: "Assign1", 120: "Assign2"},
        measurements: {
            101: [
            {
                measurementId: 12,
                measurementName: "name1",
                measurementDescription: "desc1",
                measurementValue: 33
            },
            {
                measurementId: 13,
                measurementName: "name2",
                measurementDescription: "desc2",
                measurementValue: 33
            },
            {
                measurementId: 14,
                measurementName: "name3",
                measurementDescription: "desc3",
                measurementValue: 33
            }],


            120: [
              {
                  measurementId: 22,
                  measurementName: "name1a",
                  measurementDescription: "desc1a",
                  measurementValue: 33
              },
              {
                  measurementId: 23,
                  measurementName: "name2a",
                  measurementDescription: "desc2a",
                  measurementValue: 33
              },
              {
                  measurementId: 24,
                  measurementName: "name3a",
                  measurementDescription: "desc3a",
                  measurementValue: 33
            }]
        }
    };
    dfd.resolve(dummy);
*/

    return dfd;
};


