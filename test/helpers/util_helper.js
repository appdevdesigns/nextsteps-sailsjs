
var path = require('path');
var $  = require('jquery');

var SailsHelper = require('./sails_helper.js'); // helps us load sails

var sails = null;       // local copy of sails instance
var sailsInstances = 0; // number of sails instances reqeusted

var assert = require('chai').assert;





var RequestObj = function(data) {
    this.body = data;
    this.session = {};
};
RequestObj.prototype.param = function(key) {
    return this.body[key];
};
RequestObj.prototype.removeParam = function(key) {
    delete this.body[key];
};





module.exports= {

     // setup db tables according to their descriptions in tableData
    dbSetup: function(tableData, done) {
        var dfd = $.Deferred();
        var countTables = 0;
        var countDone = 0;


        function processTables(tables) {

            for (var t in tables) {

                countTables++;

                var name = t;
                var model = tables[t].model;
                var fields = tables[t].fields;
                var values = '(' + tables[t].values.join('), (') + ')';
                var then = tables[t].then || null;
                var disableKeys = tables[t].disableKeys || false;
                var commandsPre = tables[t].preCommands || null;

                function queryIt( name, model, fields, values, then, keyCheckOff, preCommands) {

                    // disable foreign key checking if requested
                    var done = disableForeignKeys(keyCheckOff, model);
                    var doneCommands = doPreCommands(preCommands, model);
                    $.when(done, doneCommands).then(function(){

                        // delete all entries of a table
                        model.destroy()
                            .then(function(results){

                                // now insert the expected values into the table
                                // model.query('sql query', [optional data], callback);
                                model.query('insert into '+name+' (' + fields +') VALUES '+values, [], function(err) {

                                    // make sure foreign key checks are re-enabled
                                    var keyReset = enableForeignKeys(keyCheckOff, model);
                                    $.when(keyReset).then(function(){


                                        if(err) {

                                            dfd.reject(err);

                                        } else {

                                            countDone++;

                                            // if there are dependent tables process them now:
                                            if (then) {

                                                processTables(then);

                                            } else {

                                                // wait until all are done before resolving()
                                                if (countDone >= countTables)  dfd.resolve();

                                            }
                                        }

                                    });

                                }); // end model.query()

                            }) // end model.destroy().then()
                            .fail(function(err){
                                dfd.reject(err);
                            });



                    });  // end


/*
                    .query('delete from '+name, null, {logging: function(){}, raw:true})
                        .success(function() {
                            sequelize.query('insert into '+name+' (' + fields +') VALUES '+values, null, {logging:false})
                                .success(function(){
                                    countDone++;
                                    if (countDone >= countTables)  done();
                                })
                                .error(function(err) {
                                    console.log(err);
                                    countDone++;
                                    if (countDone >= countTables)  done();
                                })

                        })
                        .error(function(err){
                            console.log(err);
                            countDone++;
                            if (countDone >= countTables)  done();
                        });
*/
                    }
                queryIt(name, model,  fields, values, then, disableKeys, commandsPre);

            }  // end for tables

        } // end processTables

        processTables(tableData);

        return dfd;
    }, // end dbSetup()



    // Provide some mock testing objects for code that fits into
    // the express middleware tools.
    // returns req
    mockExpressObjects: function() {

        var returnObj = {};

        // Create a req object.
        // variations: Authenticated, Not Authenticated, No Session
        returnObj.reqAuthenticated = {
            session: {
                authenticated:{}
            }
        };

        returnObj.reqNotAuthenticated = {
            session: {}
        };

        returnObj.reqNoSession = {};


        // Create the res objeccts:
        // variations:  Expecting Errors, Not Expecting Errors
        // resExpectingErrors: is expecting one of it's methods to be called.
        // resNoError: is not expecting any of it's methods to be called.
        function fnCatchError (message, number) {
            assert.ok(true, ' -> user was prevented!');
            if (number) {
                assert.operator(number, '>=', 400, ' => http response # indicates an error.');
            }
        }
        returnObj.resExpectingError = {
            forbidden:fnCatchError,
            send:fnCatchError
        };


        function fnNoError( message, number) {
            assert.ok(false, ' ==> user should not have been prevented.');
        }
        returnObj.resNoError = {
            forbidden: fnNoError,
            send: fnNoError
        };


        function noNext() {
            assert.ok(false, ' -> should not have proceeded! ');
        }
        returnObj.noNext = noNext;


        function yesNext() {
            assert.ok(true, ' -> properly proceeded on');
        }
        returnObj.yesNext = yesNext;


        return returnObj;

    },



    Request:RequestObj,



    // build an instance of the SailsJS environment
    // callback:  cb(err, sails);
    sails: function(cb) {
        var dfd = $.Deferred();

        if (sails) {
            sailsInstances++;
            if (cb)  cb(null, sails);
            dfd.resolve(sails);
        } else {
            SailsHelper.build(function(err, _sails){
                if (err || !_sails) {
                    if (cb) cb(err||'sails could not be created!');
                    dfd.reject(err || 'sails could not be created');
                } else {
                    sails = _sails;
                    sailsInstances++;
                    if (cb) cb(null, sails);
                    dfd.resolve(sails);
                }
            });
        }

        return dfd;
    },



    // Perform common steps to initialize our testing setup
    // - load SailsJS
    // - verify given models are all in testing mode
    // - initialise DB's to expected values
    testingDBInit: function(options, done) {

        var dfd = $.Deferred();
        var self = this;
        var sails = null;

        this.sails(function(err, sailsInst) {

            if (err || !sailsInst) {
                if (done) done(err | "sails could not be started!");
                dfd.reject(err);

            } else {
                sails = sailsInst;

                // make sure all our models are in 'testing' mode
                 var models = [];
                 options.models = options.models || [];
                 for (var i=0; i<options.models.length; i++) {
                     if (GLOBAL[options.models[i]]) {
                         models.push( GLOBAL[options.models[i]] );
                     }
                 }

                 self.verifyTestingEnvironment(sails, models, function(err) {

                     if (err) {
                         if (done) done(err);
                         dfd.reject(err);
                     } else {

                         var countLoaded = 0;

                         function loadData(filePath) {
                             var cwd = process.cwd();
                             var fp = path.join(cwd, filePath);

                             // ok, so setup our data to known values.
                             var initialData = require(fp);
                             var setup = self.dbSetup(initialData);
                             $.when(setup).then(function(data) {

                                 countLoaded++;
                                 if (countLoaded >= dataPaths.length){
                                     // all dataPaths loaded so
                                     // get started with the tests
                                     if (done) done(null, sails);
                                     dfd.resolve(sails);
                                 }

                             })
                             .fail(function(err){
                                 if (done) done(err);
                                 dfd.reject(err);
                             });
                         }
                         var dataPaths = options.dataPaths || [];
                         for (var f=0; f<dataPaths.length; f++) {
                             loadData(dataPaths[f]);
                         }

                         // make sure we exit if no paths were given
                         if (dataPaths.length == 0){
                             if (done) done(null, sails);
                             dfd.resolve(sails);
                         }

                     }
                 });
            }
        });

        return dfd;
    },



    verifyTestingEnvironment: function(sails, models, done) {

        if (typeof done == 'undefined') {
            done = models;
            models = [];
        }

        // check process.env.NODE_ENV
//        if (process.env.NODE_ENV != 'test') done('not testing environment: process.env.NODE_ENV="'+process.env.NODE_ENV+'"');
//            console.log('process.env.NODE_ENV:['+process.env.NODE_ENV+']');

        // check ../config/local.js  .environment == 'development' || 'testing'
        if (sails.config.environment == 'production') done('not testing or development environment: sails.config.environment="'+sails.config.environment+'"');

        // foreach model provided,  make sure it is not tied to a 'live_*' db
        for (var m=0; m<models.length; m++) {
            if (models[m].adapter.config.database.indexOf('live_') != -1) {
                var err = new Error('model ['+models[m].identity+'] tied to a live database:'+models[m].adapter.config.database)
                return(done(err));
            }
        }

        // if we get here, then I think all the checks pass.
        done();
    }

};



var disableForeignKeys = function(checkingOff, model) {
    var dfd = $.Deferred();

    if (checkingOff) {
//console.log('turning foreign key checking off.');
        model.query('SET FOREIGN_KEY_CHECKS=0;', function(err,results){
            if (err) {
                dfd.reject(err);
            } else {
//console.log('back now');
                dfd.resolve();
            }
        });
    } else {
        dfd.resolve();
    }
    return dfd;
};


var enableForeignKeys = function(checkingOff, model) {
    var dfd = $.Deferred();

    if (checkingOff) {
//console.log('re-enabling foreign key checks.');
        model.query('SET FOREIGN_KEY_CHECKS=1;', function(err,results){
            if (err) {
                dfd.reject(err);
            } else {
                dfd.resolve();
            }
        });
    } else {
        dfd.resolve();
    }
    return dfd;
};



var doPreCommands = function(commands, model) {
    var dfd = $.Deferred();

    if (commands) {

        var countDone=0;

        for (var i=0; i<commands.length; i++){
//console.log('running command:'+commands[i]);
            model.query(commands[i], function(err, data){
                countDone++;
                if (err) {
                    dfd.reject(err);
                } else {
                    if (countDone >= commands.length) {
                        dfd.resolve();
                    }
                }
            });
        }

    } else {
        dfd.resolve();
    }

    return dfd;
};