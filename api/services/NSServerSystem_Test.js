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
            var testData = {};
            var test = req.param('test');

            // allow to specify a different set on the querystring
            // NOTE: .parse( .stringify() )  is a method to clone an object.
            if (Tests[test]) {
                testData = JSON.parse(JSON.stringify(Tests[test]));
            } else {
                testData = JSON.parse(JSON.stringify(Tests.defaultClientData));
            }

            // if any of the data is provided in the req, keep it:
            for (var t in testData) {
                var val = req.param(t);
                if (val) {
                    testData[t] = val;
                }
            }


            // Lets try to make the data seem more intelligent
            // match the campus_uuids & step_uuids with values from the DB:
            campusMatchUp(testData)
            .fail(function(err){
                dfd.reject(err);
            })
            .then(function(){

                // now matchup the step uuid's
                stepMatchUp(testData)
                .fail(function(err){
                    dfd.reject(err);
                })
                .then(function(){

                    // make sure lastSyncTimestamp is a valid value
                    if (testData.lastSyncTimestamp == '') {

                        // let's use yesterday:

                        var dateNow = new Date();   // actual date of right now

                        var year = dateNow.getFullYear(); // now have YYYY

                        var month = dateNow.getMonth() +1;

                        var days = dateNow.getDate() - 1;
                        if (days < 1) {
                            days = 28;  // just to be sure
                            month = month -1;
                            if (month == 0) {
                                month = 12;
                                year --;
                            }
                        }

                        var newDate = month+"/"+days+"/"+year;

                        testData.lastSyncTimestamp = new Date(newDate).getTime();
                    }

                    // make sure our dates make sense
                    dateMatchUp(testData);

console.log('*** testData ***');
console.log(testData.transactionLog);
console.log();
console.log();

                    // now load up our test data:
                    for( var key in testData) {
                        req.body[key] = testData[key];
                    }

                    dfd.resolve();

                });
            });



            return dfd;
        }
};



var Tests = {
    // basic client submission
    // 3 new contacts
    // 1 update contact
    // 1 delete contact
    // 3 new Steps
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
           },
           {
               'operation': 'create',
               'model': 'ContactStep',
               'params': {
                   'contact_uuid'      : '234567890abcdefxx',
                   'step_uuid'         : 'step1',
                   'step_date'         : 'date1'
               }
           },
           {
               'operation': 'create',
               'model': 'ContactStep',
               'params': {
                   'contact_uuid'      : '234567890abcdefxx',
                   'step_uuid'         : 'step2',
                   'step_date'         : 'date1'
               }
           },
           {
               'operation': 'create',
               'model': 'ContactStep',
               'params': {
                   'contact_uuid'      : '234567890abcdefxx',
                   'step_uuid'         : 'step3',
                   'step_date'         : 'date1'
               }
           }
           ]
    }
};



var campusMatchUp = function( testData ) {
    var dfd = $.Deferred();

    NSServerCampus.find()
    .fail(function(err){
        dfd.reject(err);
    })
    .then(function(list){

        var map = {
                mycampusuuid:'mycampusuuid',
                anothercampusuuid:'anothercampusuuid'
        };

        // now take the campus_uuid's from the first several campuses in
        // our list of campuses:
        var indx = 0;
        for (var key in map) {
            if (list.length > indx) {
                map[key] = list[indx].campus_uuid;
            }
            indx++;
        }

        // now traverse all the log entries and update the uuid's
        var log = testData.transactionLog;
        log.forEach(function(entry){
           if (entry.params.campus_uuid) {
               entry.params.campus_uuid = map[entry.params.campus_uuid];
           }
        });

        dfd.resolve();

    });

    return dfd;
};



var dateMatchUp = function( testData ) {

    // possible date fields:
    var map = {
            step_date:'step_date'
    };

    // for each possible date field make a new date
    var offset = 0;
    for (var k in map) {

        // make  log dates make sense:
        var date = '';              // our string placeholder:
        var dateNow = new Date();   // actual date of right now
        // desired format:  YYYYMMDD
        date += dateNow.getFullYear(); // now have YYYY

        var month = dateNow.getMonth() +1;
        if (month < 10) month = "0"+month;
        date += month;                  // now have YYYYMM

        var days = dateNow.getDate() + offset;
        if (days > 28) days = days - 28; // clamp to 28 max
        if (days < 10) days = '0'+days;  // make sure we have 2 digits
        date += days;                    // now have YYYMMDD

        map[k] = date;
        offset++;
    }

    // now traverse all the log entries and update the dates
    var log = testData.transactionLog;
    log.forEach(function(entry){

        // for each possible Date field:
        for (var m in map) {

            // if that field exists, update it's value with the map value.
            if (entry.params[m]) {
                entry.params[m] = map[m];
            }

        }

    });


};



var stepMatchUp = function (testData) {
    var dfd = $.Deferred();

    // first pull from a list of steps associated with the first
    // campus we have in our transaction Log
    var campusUUID = '';
    testData.transactionLog.forEach(function(log){

        if (campusUUID == '') {
            if (log.params.campus_uuid) {
                campusUUID = log.params.campus_uuid;
            }
        }
    });

//    console.log('   (test data: finding steps for campus_uuid:'+campusUUID);

    NSServerSteps.find({ campus_uuid:campusUUID})
    .fail(function(err){
        dfd.reject(err);
    })
    .then(function(list){

        var map = {
                step1:'step1',
                step2:'step2',
                step3:'step3'
        };

        // now take the step_uuid's from the first several steps in
        // our list of steps:
        var indx = 0;
        for (var key in map) {
            if (list.length > indx) {
                map[key] = list[indx].step_uuid;
            }
            indx++;
        }

        // now traverse all the log entries and update the uuid's
        var log = testData.transactionLog;
        log.forEach(function(entry){
           if (entry.params.step_uuid) {
               entry.params.step_uuid = map[entry.params.step_uuid];
           }
        });

        dfd.resolve();

    });

    return dfd;
};
