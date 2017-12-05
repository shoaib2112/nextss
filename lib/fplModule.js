'use strict';
var _ = require('lodash');
var config = require('../config.js');
var nextGrid = require('../nextGrid.js');

var cache = {
    subs: [],
    feeders: []
};

// fpl meta data- basic arrays of all fdrs, subs
var fpl = {
    getCache: function () {
        return cache;
    },
    cacheFpl: function() {
        module.exports.getSubs().then(function (subz) {
            cache.subs = subz;
            console.log('Cached ' + cache.subs.length + ' Substations in fplModule');

            module.exports.getFdrs().then(function (f) {
                cache.feeders = f;
                console.log('Cached ' + cache.feeders.length + ' Feeders  in fplModule');
            });
        })
            .catch(function (err) {
               console.log(err);
            });

    },
    getSubs: function () {
        return new Promise(function (resolve, reject) {
                nextGrid.mongo.collection('NextGrid_RecentVertices').distinct('geoJSON.properties.substation',
                    function (err, docs) {
                        if (err) {
                            return reject(err);
                        }
                        else {
                            // Altering sub names- array to string, replace, back to array
                            var subs = docs.join(',')
                                        .replaceAll('_', ' ')
                                        .split(',');
                            return resolve(subs);
                        }
                });
        });
    },
    getFdrs: function () {
            return new Promise(function (resolve, reject) {
                nextGrid.mongo.collection('NextGrid_RecentVertices').distinct('geoJSON.properties.feederNum',
                    function (err, docs) {
                        if (err) {
                            return reject(err);
                        }
                        else {
                            return resolve(_.filter(docs, function(d) { return !isNaN(d)}));
                        }
                    });
            });
        }            
};
module.exports = fpl;