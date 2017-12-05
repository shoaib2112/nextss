/**
 * Created by CXS0W3K on 11/3/2016.

 */
'use strict';
var express = require('express'),
config = require('../config.js'),
logRouter = express.Router(),
nextGrid = require('../nextGrid.js');

logRouter.get('/', function (req, res) {
    var qry = {};

    nextGrid.mongo.collection('NextGrid_Userlog').find(qry, {}).sort({'dateTime': -1}).toArray(function (err, docs) {
        if (err) {
            console.log('Logs error:' + err);
            res.json({ "error": "Logs data not found." });
        }
        else {
            res.json(docs)
        }

    });
});
logRouter.post('/', function (req, res) {

});
module.exports.saveLog = function (req, res, next) {
    console.log('saveLog-' + req);
    next();

};
module.exports = logRouter;