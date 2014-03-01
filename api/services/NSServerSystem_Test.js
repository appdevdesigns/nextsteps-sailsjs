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
           var gma = {
               assignments:{},
               measurements:{}
           };

            console.log('Test.download() ...');


           //// Temporary Testing options:

            gma.assignments[101] = 'Assign1b';
            gma.assignments[199] = 'Assign3';

            gma.measurements[199] = [
                  {
                      measurementId: 92,
                      measurementName: "name1b",
                      measurementDescription: "desc1b",
                      measurementValue: 33
                  }];



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



