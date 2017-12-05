/**
 * Created by CXS0W3K on 1/30/2017.
 */
'use strict';
var config = require('../config.js'),
    expect = require('chai').expect,
    request = require('request');
console.log('Testing Nodejs web services...');
describe('Homepage', function() {
    var url = 'http://localhost:' + config.port;

    it("didn't load", function(done) {
        request(url, function(error, response, body) {
            // if (!response)
            //     console.log('Server probably not running');
            // else
            //console.log(body);
                expect(response.statusCode).to.equal(200);
                expect(body).to.have.string('<!doctype html>')
                    .and.to.have.string('</html>');
            done();
        });
    });
});
describe('Momentaries', function() {
    var url = 'http://localhost:' + config.port + '/momentaries/aggregates' ;

    it("didn't load", function(done) {
        request(url, function(error, response, body) {
            expect(response.statusCode).to.equal(200);
            expect(body).to.have.length.above(100000);
            done();
        });
    });
});