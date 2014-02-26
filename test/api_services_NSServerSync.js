var nssSync = require('../api/services/NSServerSync.js');
var assert = require('chai').assert;

var reqGood = {};
var reqBad = {};
var resExpectError = {};
var resNoError = {};

describe('NSS Sync Service: ', function () {
  before(function(){
  });
  
  it ('Stub', function (){
    nssSync.synchronize(reqGood, resNoError).done(function(data){
        assert.ok(true, 'Should have called this function');
        
    });
    
  });
});