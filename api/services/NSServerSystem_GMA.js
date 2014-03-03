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

//// TODO: this is only for testing at Hack-a-thon
        if ((userID != 'jon@vellacott.co.uk')
                || (password != 'manila')) {
            console.log('  *** userID['+userID+'] pword['+password+']');
            dfd.reject(new Error('Invalide GMA User'));
            return dfd;
        }

        setupGMA(userID, password)
        .fail(function(err){

            console.log();
            console.error(' *** error attempting to setupGMA():');
            console.log(err);
            dfd.reject(err);

        })
        .then(function(gma){
console.log('  - authenticated in GMA');

            for (var id in gma.measurements) {
                var newMeasurementList = [];
                var currList = gma.measurements[id];
                currList.forEach(function(measurement){
                   newMeasurementList.push(measurement.data);
                });
                gma.measurements[id] = newMeasurementList;

            }

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


