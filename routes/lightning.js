/**
 * Created by CXS0W3K on 5/1/2017.
 */
var express = require('express');
var sql = require('mssql');
var moment = require('moment');
var ltgRouter = express.Router();
var nextGrid = require('../nextGrid.js');
var utils = require('../lib/utils.js');

// May source lightning from schneider
ltgRouter.get('/dailyschneider', function(req, res){
    var qry = {};

    qry.valid_utc = {
        "$gte": new Date(req.query.date),
        "$lte": new Date(req.query.edate || req.query.date + ' 11:59:59 PM')
    };

    if (req.query.dates) {
        qry.valid_utc_str = {
            "$in": req.query.dates.split(',')
        }
    }

    if (req.query.type === 'ma')
        qry.ma = req.query.value;
    else if (req.query.type === 'sc')
        qry.sc = req.query.value;
    else if (req.query.type === 'sub')
        qry.sub = req.query.value.replaceAll('_', ' '); //qry.sub = req.query.value.replace('_', ' ');
    else if (req.query.type === 'feeder')
        qry.feeder = req.query.value;
    else
        res.json({ "error": "bad type" });

    nextGrid.mongo.collection('lightning_schneider').find(qry).toArray(function(err, docs) {
        if (err){
            console.log('lightning day fail: ' + err);
            res.json({"error": err});
        }
        else if (docs.length === 0)
            res.json({"error": "No lightning hits found for day " + req.query.date});
        else
            res.json(docs);
    });
});

ltgRouter.get('/daily', function(req, res){
    var q = {};

    q.datetime = {
        "$gte": moment(req.query.date).toDate(),
        "$lte": moment(req.query.edate || req.query.date + ' 11:59:59 PM').toDate()
    };

    if (req.query.dates) {
        q.dt = {
            "$in": req.query.dates.split(',')
        }
    }

    if (req.query.type === 'ma')
        q.ma = req.query.value;
    else if (req.query.type === 'sc')
        q.sc = req.query.value;
    else if (req.query.type === 'sub')
        q.sub = req.query.value.replaceAll('_', ' '); //q.sub = req.query.value.replace('_', ' ');
    else if (req.query.type === 'feeder')
        q.feeder = req.query.value;
    else
        res.json({ "error": "bad type" });

    nextGrid.mongo.collection('lightning_daily').find(q).toArray(function(err, docs) {
        if (err){
            console.log('lightning day fail: ' + err);
            res.json({"error": "lightning daily database not found"});
        }
        else if (docs.length === 0)
            res.json({"error": "No lightning hits found for day " + req.query.date});
        else
            res.json(docs);
    });
});

// Deprecated until it's not
// ltgRouter.get('/YTD', function(req, res){
//     var q;
//     if (req.query.type === 'ma')
//         q = {ma: req.query.value};
//     else if (req.query.type === 'sc')
//         q = {sc: req.query.value};
//     else if (req.query.type === 'sub')
//         q = {sub: req.query.value.replace('_', ' ')};
//     else if (req.query.type === 'feeder')
//         q = {feeder: req.query.value};
//     else
//         q = {};
//
//     //console.log(q);
//     nextGrid.mongo.collection('lightning_ytd').find(q).toArray(function(err, docs) {
//         if (err){
//             console.log('lightning ytd fail: ' + err);
//             res.json({"error": "lightning ytd database not found"});
//         }
//         else if (docs.length === 0)
//             res.json({"error": "No lightning hits found YTD"});
//         else
//             res.json(docs);
//     });
// });

// Raw YTD lightning strikes from SQL Server, using boundaries
ltgRouter.get('/ytd_raw/:year/:lat1/:lng1/:lat2/:lng2', function (req, res) {
    var dt = new Date();
    var yr = req.params.year ||  dt.getFullYear();

    var request = new sql.Request(nextGrid.connDPDCSQL);
    request.input('yr', sql.Int, yr);
    request.input('lat1', sql.Float, req.params.lat1);
    request.input('lat2', sql.Float, req.params.lat2);
    request.input('long1', sql.Float, req.params.lng1);
    request.input('long2', sql.Float, req.params.lng2);
    request.execute('dbo.nextGrid_get_lightningYTD_Raw', function (err, recordset, returnValue) {
        if (err) {
            console.log("Error: " + err);
            return;
        }
        res.json(recordset);
    });
});
module.exports = ltgRouter;