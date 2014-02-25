var isAuth = require('../api/policies/isAuthenticated.js');
var assert = require('chai').assert;

var reqGood = {};
var reqBad = {};
var resExpectError = {};
var resNoError = {};

describe('Is Authenticated Policy: ', function () {
    before(function(){
        reqGood.session = {};
        reqGood.session.authenticated = true;

        reqBad.session = {};
        reqBad.session.authenticated = false;

        var fnCatchError = function(message, number) {
            assert.ok(true, 'req was prevented!');
            if (number) {
                assert.operator(number, '>=', 400, ' http response # indicates an error.');
            }
        };

        resExpectError.forbidden = fnCatchError;
        resExpectError.send = fnCatchError;
        
        var fnNoError = function(message, number) {
            assert.ok(false, 'request should not have been prevented');
        };
        
        resNoError.forbidden = fnNoError;
        resNoError.send = fnNoError;

    });
    it ('Authenticated Session', function (){
        isAuth(reqGood, resNoError, function(){
            assert.ok(true, 'Should have called this function');
        });
        
    });
    
    it ('Unuthenticated Session', function (){
        isAuth(reqBad, resExpectError, function(){
            assert.ok(false, 'Should not have continued');
        });
        
    });
    
    
});

