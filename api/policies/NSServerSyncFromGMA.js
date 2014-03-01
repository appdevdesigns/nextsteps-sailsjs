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
var GMA = require('gma-api');

module.exports = function(req, res, next) {

    console.log('Sync from GMA ...');

    var dfd = $.Deferred();

    // Sync the Data from GMA
    if (true || config.gma) {
        var userID = req.param('username');
        var password = req.param('password');
        // setupGMA
        setupGMA(userID, password)
        .then(function(gma){
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
console.log('GMA setup done...');
            // GMA data retrieved; now make sure we're in sync
            syncAssignments(gma.assignments, req.appdev.userUUID)
            .then(function(){
                syncMeasurements(gma.measurements)
                .then(function(){
                    console.log('GMA assignments and measurements done ...');
                    dfd.resolve();
                })
                .fail(function(err){
                    dfd.reject(err);
                });
            })
            .fail(function(err){
                dfd.reject(err);
            });
        })
        .fail(function(err){
            dfd.reject(err);
        });
    } else {
        // Nothing to do if no GMA
        dfd.resolve();
    }
    
    $.when(dfd)
    .then(function(){
        next();
    })
    .fail(function(err){
        ADCore.comm.error(res,err);
    });
};

var setupGMA = function( username, password ) {
    var dfd = $.Deferred();
    console.log('setting up GMA .. ');
    /// setup here:

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

    return dfd;
};

var updateCampus = function(campus, name) {
    var dfd = $.Deferred();
    NSServerCampusTrans.findOne({
        campus_id: campus.id,
        language_code: 'en'
    })
    .then(function(trans){
        if (trans && (name != trans.campus_label)){
            trans.campus_label = name;
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
        campus_uuid: ADCore.util.createUUID(),
        node_id: gmaId
    })
    .then(function(campus){
        campus.addTranslation({
            campus_id: campus.id,
            language_code: 'en',
            campus_label: name
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
    
    for (var id in nodes){
        processNode(id, nodes[id])
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
    return dfd;
};

var addUserToCampus = function(userUUID, campus) {
    var dfd = $.Deferred();
    NSServerUserCampus.findOne({
        user_uuid: userUUID,
        campus_uuid: campus.campus_uuid
    })
    .then(function(userCampus){
        if (!userCampus){
            // Need to create one
            NSServerUserCampus.create({
                user_uuid: userUUID,
                campus_uuid: campus.campus_uuid
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
    console.log('getting assignments ');
    
    // Make sure our tables match the latest from GMA
    syncNodeData(assignments)
    .then(function(){
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
        step_uuid: ADCore.util.createUUID(),
        campus_uuid: campusUUID,
        measurement_id: measurement.measurementId
    })
    .then(function(step){
        step.addTranslation({
            step_id: step.id,
            language_code: 'en',
            step_label: measurement.measurementName,
            step_description: measurement.measurementDescription
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
        campus_uuid: campusUUID,
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

    // Find the campus
    NSServerCampus.findOne({
        node_id: nodeId
    })
    .then(function(campus){
        if (campus){
            var numDone = 0;
            var numToDo = 0;
            
            for (var id in measurements){
                processMeasurement(campus.campus_uuid, measurements[id])
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

    return dfd;

};

var syncMeasurementData = function(measurements) {
    var dfd = $.Deferred();

    var numDone = 0;
    var numToDo = 0;
    
    for (var nodeId in measurements){
        processNodeMeasurements(nodeId, measurements[nodeId])
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
    return dfd;
};

var syncMeasurements = function( measurements ) {
    var dfd = $.Deferred();
    console.log('getting measurements ');
    
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
