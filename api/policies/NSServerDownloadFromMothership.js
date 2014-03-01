/**
 * NSServerSyncFromGMA
 *
 * @module      :: Policy
 * @description :: Retrieve Assignments and Measurements from GMA.
 *                 Apply any changes to our tables
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

var $ = require('jquery');

//// This is where we define our known adaptors:
var externalSystems = null;


module.exports = function(req, res, next) {

    if (externalSystems == null) {
        externalSystems = {
                'none': function(req, res) { var dfd = $.Deferred(); dfd.resolve({assignments:{}, measurements:{}}); return dfd; },
                'test': NSServerSystem_Test.download,
                'GMA' : NSServerSystem_GMA.download
        };
    }

    if (externalSystems[sails.config.nsserver.externalSystem]) {

        externalSystems[sails.config.nsserver.externalSystem](req,res)
        .fail(function(err){
            ADCore.comm.error(res, err);
        })
        .then(function( data ){

            // External data retrieved; now make sure we're in sync
            syncAssignments(data.assignments, req.appdev.userUUID)
            .fail(function(err){
                ADCore.comm.error(res, err);
            })
            .then(function(){
//console.log('   syncAssignments() .then() ');
                syncMeasurements(data.measurements)
                .fail(function(err){
                    ADCore.comm.error(res, err);
                })
                .then(function(){
//console.log('GMA assignments and measurements done ...');
                    next();
                });
            });

        });


    } else {

        var err = new Error('*** Error: unknown configured system ['+sails.config.nsserver.externalSystem+']');
        console.log(err);
        next(err);
    }

};





var updateCampus = function(campus, name) {
    var dfd = $.Deferred();

    NSServerCampusTrans.findOne({
        campus_id: campus.id,
        language_code: 'en'
    })
    .then(function(trans){
        if (trans && (name != trans.short_name)){
            trans.short_name = name;
            trans.save(function(err){
                if (err){
                    dfd.reject(err);
                } else {
                    dfd.resolve();
                }
            });
        } else if (trans) {
            dfd.resolve();
        } else {
            dfd.reject("Data error:  Translation Entry not found");
        }
    })
    .fail(function(err){
        dfd.reject(err);
    });

    return dfd;
};



var createCampus = function(gmaId, name) {
    var dfd = $.Deferred();

    NSServerCampus.create({
        UUID: ADCore.util.createUUID(),
        node_id: gmaId,
    })
    .then(function(campus){
        campus.addTranslation({
            campus_id: campus.id,
            language_code: 'en',
            short_name: name
        })
        .then(function(){
            dfd.resolve();
        })
        .fail(function(err){
            dfd.reject(err);
        });
    })
    .fail(function(err){
        dfd.reject(err);
    });

    return dfd;
};



var processNode = function(gmaId, name) {
    var dfd = $.Deferred();

    NSServerCampus.findOne({
        node_id: gmaId
    })
    .then(function(campus){
        if (campus){
            // Update the campus
            updateCampus(campus, name)
            .then(function(){
                dfd.resolve();
            })
            .fail(function(err){
                dfd.reject(err);
            });
        } else {
            // Create the campus
            createCampus(gmaId, name)
            .then(function(){
                dfd.resolve();
            })
            .fail(function(err){
                dfd.reject(err);
            });
        }
    })
    .fail(function(err){
        dfd.reject(err);
    });

    return dfd;
};



var syncNodeData = function(nodes) {
    var dfd = $.Deferred();

    var numDone = 0;
    var numToDo = 0;
//console.log(' syncNodeData() :');
//console.log('    nodes:');
//console.log(nodes);

    for (var id in nodes){
        processNode(id, nodes[id])
        .then(function(){
            numDone++;
            if (numDone == numToDo){
//console.log('    syncNodeData().processNode(). done ... resolving()');
                dfd.resolve();
            }
        })
        .fail(function(err){
            numDone++;
            dfd.reject(err);
        });
        numToDo++;
    }
    return dfd;
};



var addUserToCampus = function(userUUID, campus) {
    var dfd = $.Deferred();
    NSServerUserCampus.findOne({
        user_UUID: userUUID,
        campus_UUID: campus.UUID
    })
    .then(function(userCampus){
        if (!userCampus){
            // Need to create one
            NSServerUserCampus.create({
                user_UUID: userUUID,
                campus_UUID: campus.UUID
            })
            .then(function(){
                dfd.resolve();
            })
            .fail(function(err){
                dfd.reject(err);
            });
        } else {
            // Nothing to do
            dfd.resolve();
        }

    })
    .fail(function(err){
        dfd.reject(err);
    });
    return dfd;
};



var addUserToNodes = function(userUUID, nodes) {
    var dfd = $.Deferred();

    var numDone = 0;
    var numToDo = 0;

    for (var id in nodes){
        NSServerCampus.findOne({
            node_id: id
        })
        .then(function(campus){
            if (campus){
                addUserToCampus(userUUID, campus)
                .then(function(){
                    numDone++;
                    if (numDone == numToDo){
                        dfd.resolve();
                    }
                })
                .fail(function(err){
                    dfd.reject(err);
                });
            } else {
                dfd.reject("Data error:  Campus not found");
            }

        })
        .fail(function(err){
            dfd.reject(err);
        });
        numToDo++;
    }
    return dfd;
};



var syncAssignments = function( assignments, userUUID ) {
    var dfd = $.Deferred();
    console.log('getting assignments ... ');

    // Make sure our tables match the latest from GMA
    syncNodeData(assignments)
    .then(function(){
//console.log('   syncNodeData().then() ... ');
        // Update User-Node assignments
        addUserToNodes(userUUID, assignments)
        .then(function(){
            dfd.resolve();
        })
        .fail(function(err){
            dfd.reject(err);
        });
    })
    .fail(function(err){
        dfd.reject(err);
    });

    return dfd;
};



var updateStep = function(step, measurement) {
    var dfd = $.Deferred();
    NSServerStepsTrans.findOne({
        step_id: step.id,
        language_code: 'en'
    })
    .then(function(trans){
        if (trans
            && (   (trans.name != measurement.measurementName)
                || (trans.description != measurement.measurementDescription)) ){
            trans.name = measurement.measurementName;
            trans.description = measurement.measurementDescription;
            trans.save(function(err){
                if (err){
                    dfd.reject(err);
                } else {
                    dfd.resolve();
                }

            });
        } else if (trans) {
            dfd.resolve();
        } else {
            dfd.reject("Data error:  Translation Entry not found");
        }
    })
    .fail(function(err){
        dfd.reject(err);
    });
    return dfd;
};



var createStep = function(campusUUID, measurement) {
    var dfd = $.Deferred();
    NSServerSteps.create({
        UUID: ADCore.util.createUUID(),
        campus_UUID: campusUUID,
        measurement_id: measurement.measurementId
    })
    .then(function(step){
        step.addTranslation({
            step_id: step.id,
            language_code: 'en',
            name: measurement.measurementName,
            description: measurement.measurementDescription
        })
        .then(function(){
            dfd.resolve();
        })
        .fail(function(err){
            dfd.reject(err);
        });
    })
    .fail(function(err){
        dfd.reject(err);
    });
    return dfd;
};



var processMeasurement = function(campusUUID, measurement) {
    var dfd = $.Deferred();

    NSServerSteps.findOne({
        campus_UUID: campusUUID,
        measurement_id: measurement.measurementId
    })
    .then(function(step){
        if (step){
            // Update the step
            updateStep(step, measurement)
            .then(function(){
                dfd.resolve();
            })
            .fail(function(err){
                dfd.reject(err);
            });
        } else {
            // Create the step
            createStep(campusUUID, measurement)
            .then(function(){
                dfd.resolve();
            })
            .fail(function(err){
                dfd.reject(err);
            });
        }
    })
    .fail(function(err){
        dfd.reject(err);
    });

    return dfd;

};



var processNodeMeasurements = function(nodeId, measurements) {
    var dfd = $.Deferred();

    // only process if there are some measurements to do
    if (measurements.length > 0) {


        // Find the campus
        NSServerCampus.findOne({
            node_id: nodeId
        })
        .then(function(campus){
            if (campus){
                var numDone = 0;
                var numToDo = 0;

                for (var id in measurements){


                        processMeasurement(campus.UUID, measurements[id])
                        .then(function(){
                            numDone++;
                            if (numDone == numToDo){
                                dfd.resolve();
                            }
                        })
                        .fail(function(err){
                            dfd.reject(err);
                        });
                        numToDo++;

                }
            } else {
                dfd.reject("Data error:  Campus not found");
            }
        })
        .fail(function(err){
            dfd.reject(err);
        });

    } else {

        // there were no measurements assigned to this nodeID ... why?
        console.log(' there were no measurements assigned to nodeID['+nodeId+']');
        console.log('   ==> that doesn\'t seem like expected behavior!');

        dfd.resolve();
    }

    return dfd;

};



var syncMeasurementData = function(measurements) {
    var dfd = $.Deferred();

    var numDone = 0;
    var numToDo = 0;



//console.log( 'syncMeasurementData():  trying to process these measurements:');
//console.log(measurements);

    for (var nodeId in measurements){
        numToDo++;
        processNodeMeasurements(nodeId, measurements[nodeId])
        .then(function(){
            numDone++;
            if (numDone == numToDo){
//console.log('syncMeasurementData() ... resolving() ');
                dfd.resolve();
            }
        })
        .fail(function(err){
            dfd.reject(err);
        });
    }

    return dfd;
};



var syncMeasurements = function( measurements ) {
    var dfd = $.Deferred();
    console.log('getting measurements ... ');

    // Make sure our tables match the latest from GMA
    syncMeasurementData(measurements)
    .then(function(){
        dfd.resolve();
    })
    .fail(function(err){
        dfd.reject(err);
    });

    /*
    2. gma.getMeasurement()

    Each and every measurement ->
        if new Add -> Step[uuid, mid] & stepTrans [lang, name,    description]
            -> for all users in user-campus with campus_uuid
                -> TransactionLog [user_uuid, timestamp, ….]
        else
        if udpate -> udpate stepTrans[lang, name, desc]
        -> for all users in user.campus with campus_uuid
            -> TransactionLog [user_uuid, timestamp, ….]

     */

    return dfd;
};



