var express = require('express');
var moment = require('moment');
var websvc = require('request');
var config = require('../config.js');
var workRouter = express.Router();


workRouter.get('/hvt', function(req, res) {

    var dt = moment(req.query.date).format('YYYYMMDD').toString();
    websvc(config.hvt.url + dt + '?format=json', function (error, response, body) {
        if (error) {
            res.json(error);
        }
        else
            res.send(JSON.parse(body));

    });
});
// var sql = require('mssql');
// var sqlCn = require('../nextGrid').sqlCn;
//var _ = require('underscore');

// workRouter.post('/', function (req, res){
//     var request = new sql.Request(sqlCn);
//     var q = "INSERT INTO nextGrid.workRequests (equipType, equipId, comments, workType) VALUES ('" +
//         req.query.equipType + "', '" + req.query.equipId + "', 'This is a nextGrid generated work order', '85O')";
//     console.log(q);
//     request.query(q, function(err, recordset) {
//         if (err){
//             console.log('SQL Server query: ' + q + ' error: ' + err);
//             res.json({"error": "workOrder post failed"});
//         }
//         else {
//             res.json({"success": "insert occurred"});
//         }
//     });
// });
//
// workRouter.get('/', function(req, res) {
//     var request = new sql.Request(sqlCn);
//     var q = "SELECT [workRequest] ,[errorMessage] ,[equipType] ,[equipId], [comments], [workType] FROM [nextGrid].[workRequests]";
//     request.query(q, function(err, recordset) {
//         if (err){
//             console.log('SQL Server query: ' + q + ' error: ' + err);
//             res.json({"error": "work get failed"});
//         }
//         else{
//             res.json(recordset);
//         }
//     });
// });
// /*
// workRouter.get('/:id', function(req, res) {
//     var request = new sql.Request(sqlCn);
//     var q = "SELECT [jobNumber] ,[workRequest] ,[errorMessage] ,[equipType] ,[equipId], [comments] FROM [nextGrid].[workRequests] WHERE equipId = " + req.params.id;
//     console.log(q);
//     request.query(q, function(err, recordset) {
//         if (err){
//             console.log('SQL Server query: ' + q + ' error: ' + err);
//             res.json({"error": "work get failed"});
//         }
//         else
//             res.json(recordset);
//     });
// });
// */
// workRouter.get('/hvtday', function(req, res) {
//     var request = new sql.Request(sqlCn);
//     var q = "SELECT itemJson FROM nextGrid.HVTransformerLog WHERE itemDate = (select max(itemDate) from nextGrid.HVTransformerLog)";
//     request.query(q, function(err, recordset) {
//         if (err){
//             console.log('SQL Server query: ' + q + ' error: ' + err);
//             res.json({"error": "hvt get failed"});
//         }
//         else{
//             res.json(recordset);
//         }
//     });
// });
//
// workRouter.get('/hvtsup', function(req, res) {
//     var request = new sql.Request(sqlCn);
//     var q = "SELECT itemJson FROM nextGrid.HVSuppressLog WHERE itemDate = (select max(itemDate) from nextGrid.HVSuppressLog)";
//     request.query(q, function(err, recordset) {
//         if (err){
//             console.log('SQL Server query: ' + q + ' error: ' + err);
//             res.json({"error": "hvt get failed"});
//         }
//         else{
//             res.json(recordset);
//         }
//     });
// });
//
// workRouter.get('/hvtdrop', function(req, res) {
//     var request = new sql.Request(sqlCn);
//     var q = "SELECT itemJson FROM [Distribution].[nextGrid].[HVTransformerLog] WHERE itemDDB in" +
//         " (SELECT itemDDB FROM (SELECT itemDDB, min(itemDate) as [From], max(itemDate) as [To] FROM [Distribution].[nextGrid].[HVTransformerLog]" +
//         " GROUP BY itemDDB) test WHERE [To] < GETDATE() - 1 And [To] > GETDATE() - 8) ORDER BY itemDate DESC";
//     request.query(q, function(err, recordset) {
//         if (err){
//             console.log('SQL Server query: ' + q + ' error: ' + err);
//             res.json({"error": "hvt get failed"});
//         }
//         else{
//             res.json(recordset);
//         }
//     });
// });
//
// workRouter.get('/hvtall', function(req, res) {
//     var request = new sql.Request(sqlCn);
//     var q = "SELECT itemDate, itemJson, itemDDB FROM nextGrid.HVTransformerLog ORDER BY itemDDB, itemDate DESC";
//     request.query(q, function(err, recordset) {
//         if (err){
//             console.log('SQL Server query: ' + q + ' error: ' + err);
//             res.json({"error": "hvt get failed"});
//         }
//         else{
//             var txs = [];
//             var tx = {ddb: null, start: null, end: null, count: 0};
//             _.forEach(recordset, function(item) {
//                 if (item.itemDDB === tx.ddb){
//                     tx.start = item.itemDate;
//                     tx.count += 1;
//                 }
//                 else {
//                     if (tx.ddb)
//                         txs.push(tx);
//                     tx = {};
//                     tx.ddb = item.itemDDB;
//                     tx.start = item.itemDate;
//                     tx.end = item.itemDate;
//                     try{
//                         var json = JSON.parse(item.itemJson);
//                         for (var key in json){
//                             tx[key] = json[key];
//                         }
//                     }
//                     catch(e){
//                         tx.json = {};
//                     };
//                     tx.count = 1;
//                 }
//             });
//             if (tx.ddb) txs.push(tx);
//             res.json(txs);
//         }
//     });
// });
/*  came off
SELECT itemDDB FROM
(SELECT itemDDB, min(itemDate) as [From], max(itemDate) as [To]
FROM [Distribution].[nextGrid].[HVTransformerLog]
GROUP BY itemDDB) test
WHERE [To] < GETDATE() - 1 And [To] > GETDATE() - 8
ORDER BY [To] desc
*/
module.exports = workRouter;