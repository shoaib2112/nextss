/**
 * Created by AJH0e3s on 3/15/2017.
 *
 * Management Area Polygons
 * !! FROM Mongo QA
 */
'use strict';
var express = require('express');
var polyMARouter = express.Router();
var config = require('../config.js');
var nextGrid = require('../nextGrid.js');
var cache = {
    poly: []
};
polyMARouter.cache = function () {
    nextGrid.mongo.collection('NextGrid_Mgmt_Areas').find({}).toArray(function (err, docs) {
            if (err) {
                console.log('MA Polygon error:' + err);
            }
            else {
                cache.poly = docs;
                console.log('Cached ' + docs.length + ' documents for /polygonMgmtArea.');
            }
    });
};
polyMARouter.get("/", function (req, res) {
    res.json(cache.poly);
    // nextGrid.mongo.collection('NextGrid_Mgmt_Areas')
    //     //NextGrid_Mgmt_Areas
    //     .find({})//polygonMgmtArea
    //     //.sort({"inquiryDate": -1})
    //     .toArray(function (err, docs) {
    //         if (err) {
    //             console.log('MA Polygon error:' + err);
    //             res.json({ "error": "Polygon data not found." });
    //         }
    //         else {
    //             res.json(docs)
    //         }
    // });

});

module.exports = polyMARouter;