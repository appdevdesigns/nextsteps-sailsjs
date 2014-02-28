/**
 * ADCore
 *
 * @module      :: Service
 * @description :: This is a collection of core appdev features for an application.

 *
 */
var $ = require('jquery');

module.exports = {


    manyThrough: function(modelA, AFilter, modelB, keyAB, keyB, filter, cb) {
        var dfd = $.Deferred();

        filter = filter || {};
console.log('dbHelper.manyThrough():');

        modelA.find(AFilter)
        .then(function(list){

            var ids = [];
            for (var i=0; i<list.length; i++) {
                ids.push(list[i][keyAB]);
            }
            filter[keyB] = ids;
console.log('modelB.filter:');
console.log(filter);

            modelB.find(filter)
            .then(function(listCampuses){

console.log('modelB list:');
console.log(listCampuses);

console.log('....');
console.log('cb():');
console.log(cb);
                /*
                var numDone = 0;
                for(var lc=0; lc<listCampuses.length; lc++) {

                    var addIt = function(item) {
                        item.trans(function(err, trans) {

                            if (err) {
                                console.log(err);
                            } else {
                                item.name = trans.name;
                            }
                            numDone++;
                            if (numDone >= listCampuses.length) {
                                if (cb) cb(null, listCampuses);
                                dfd.resolve(listCampuses);
                            }

                        });
                    };
                    addIt(listCampuses[lc]);
                }
                */
                if (cb) cb(null, listCampuses);
                dfd.resolve(listCampuses);

            })
            .fail(function(err){
                if (cb) cb(err);
                dfd.reject(err);
            });

        })
        .fail(function(err){
            if (cb) cb(err);
            dfd.reject(err);
        });

        return dfd;
    },



    translateList:function(list, mapObj, cb) {
        var dfd = $.Deferred();

        var addIt = function(item) {
//console.log('in addIt():');
//console.log(item);

            item.trans(function(err, trans) {

                if (err) {

                    console.log(err);
                    dfd.reject(err);
                    numDone = -1; // ensures we never hit .resolve();

                } else {
                    for (var m in mapObj) {
                        if (mapObj[m]) {
                            if (typeof trans[m] != 'undefined') {
                                item[m] = trans[m];
                            }
                        }
                    }
                    item.name = trans.name;
                }
                numDone++;
                if (numDone >= list.length) {
                    if (cb) cb(null, list);
                    dfd.resolve(list);
                }

            });
        };

        var numDone = 0;
        for(var lc=0; lc<list.length; lc++) {


            addIt(list[lc]);
        }


        return dfd;
    }
};


//// LEFT OFF:
//// - figure out unit tests for testing the controller output.