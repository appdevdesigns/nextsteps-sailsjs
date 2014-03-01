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

            console.log('Test.download() ...');


           //// Temporary Testing options:

            var gma = {
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
            }

            dfd.resolve(gma);



            return dfd;
        },



        upload: function( req, res ) {

            var dfd = $.Deferred();

            console.log('Test.upload() ...');

            dfd.resolve();

            return dfd;
        },


        // These are for exposing private functions for testing only
        test: {

        }
};



