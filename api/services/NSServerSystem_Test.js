/**
 * NSServerSystem_Test
 *
 * @module      :: Service
 * @description :: Test services to simulate communication with an external system.
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

        },


        validateUser: function(req, res) {
            var dfd = $.Deferred();

            // this is our testing Stub, so load in our
            // expected incoming data:
            var testData = Tests.defaultClientData;
            var test = req.param('test');

            // allow to specify a different set on the querystring
            if (Tests[test]) {
                testData = Tests[test];
            }

            // if any of the data is provided in the req, keep it:
            for (var t in testData) {
                var val = req.param(t);
                if (val) {
                    testData[t] = val;
                }
            }

            // now load up our test data:
            for( var key in testClientData) {
                req.body[key] = testClientData[key];
            }
            return dfd;
        }
};



var Tests = {
    defaultClientData : {
        'username' : 'jon@vellacott.co.uk',
        'password' : 'manila',
        'lastSyncTimestamp': '',
        'appVersion': '0.0.1',
        'transactionLog': [
           {
               'operation': 'create',
               'model': 'Contact',
               'params': {
                   'contact_uuid'      : '01234567890abcdef',
                   'contact_firstname' : 'Samuel',
                   'contact_lastname'  : 'Smith',
                   'contact_nickname'  : 'Sam',
                   'campus_uuid'       : 'mycampusuuid',
                   'year_id'           : '1',
                   'contact_phone'     : '123-456-7890',
                   'contact_email'     : 'sam.smith@gmail.com',
                   'contact_notes'     : 'blond hair'
               }
           },
           {
               'operation': 'create',
               'model': 'Contact',
               'params': {
                   'contact_uuid'      : '234567890abcdef01',
                   'contact_firstname' : 'Susan',
                   'contact_lastname'  : 'Smith',
                   'contact_nickname'  : 'Sue',
                   'campus_uuid'       : 'mycampusuuid',
                   'year_id'           : '1',
                   'contact_phone'     : '123-456-7890',
                   'contact_email'     : 'susan.smith@gmail.com',
                   'contact_notes'     : 'wife of Sam'
               }
           },
           {
               'operation': 'create',
               'model': 'Contact',
               'params': {
                   'contact_uuid'      : '234567890abcdefxx',
                   'contact_firstname' : 'Jason',
                   'contact_lastname'  : 'Smith',
                   'contact_nickname'  : '',
                   'campus_uuid'       : 'anothercampusuuid',
                   'year_id'           : '3',
                   'contact_phone'     : '123-456-7890',
                   'contact_email'     : 'jason.smith@gmail.com',
                   'contact_notes'     : ''
               }
           },
           {
               'operation': 'update',
               'model': 'Contact',
               'params': {
                   'contact_uuid'      : '234567890abcdef01',
                   'contact_firstname' : 'Susan',
                   'contact_lastname'  : 'Smith',
                   'contact_nickname'  : 'Susie',
                   'campus_uuid'       : 'mycampusuuid',
                   'year_id'           : '2',
                   'contact_phone'     : '123-456-7890',
                   'contact_email'     : 'susan.smith@gmail.com',
                   'contact_notes'     : 'wife of Sam'
               }
           },
           {
               'operation': 'destroy',
               'model': 'Contact',
               'params': {
                   'contact_uuid'      : '234567890abcdefxx',
                   'contact_firstname' : 'Jason',
                   'contact_lastname'  : 'Smith',
                   'contact_nickname'  : '',
                   'campus_uuid'       : 'anothercampusuuid',
                   'year_id'           : '3',
                   'contact_phone'     : '123-456-7890',
                   'contact_email'     : 'jason.smith@gmail.com',
                   'contact_notes'     : ''
               }
           }
           ]
    }
}

