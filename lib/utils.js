// utility functions
'use strict';
var _ = require('lodash');

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
var handleError = function(req, res, err){
    console.log("URL: " + req.headers.referer);
    console.log("Query: " + req.headers.query);
    console.log("Error: " + err);
    res.send(err);
};

var mapRequestToModel = function(model, req){
    for (var key in req.body){
        model[key] = req.body[key];
    }
};
var utils =  {
    // Merge 2 array of objects. arr1's length should be >= to arr2
    // arr1 will be udpated but not arr2. Objects should have a mongo key _id
    mergeObjects: function (arr1, arr2) {
        for (var i = 0, len = arr1.length; i < len; i++) {
            var obj = _.find(arr2, function (a) { return a._id === arr1[i]._id && arr1[i]._id != null; });

            if (!obj)
                continue;

            _.forIn(obj, function(value, key) {
                if (key !== '_id')
                    arr1[i][key] = value;
            });
        }
    }
};
module.exports = utils;