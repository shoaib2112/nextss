var express = require('express');
var caRouter = express.Router();
var request = require('request');
var parseString = require('xml2js').parseString;
var config = require('../config.js');
// var oracledb = require('oracledb');
// var _ = require('underscore');
//var nextGrid = require('../nextGrid.js');

caRouter.get('/', function(req, res){
    request(config.conditionAssessment.url + req.query.feeders , function (error, response, body) {
        parseString(body, {trim: true}, function (err, result) {
            if (err) {
                res.json(err);
            }
            else if (!result.ArrayOfCaFinding.CaFinding) {
                res.json({"message": "No condAssess records found."});
            }
            else {
                var ca = [];
                result.ArrayOfCaFinding.CaFinding.forEach(function(c) {
                    var obj = {
                        "tran_dtl_id": c.tran_dtl_id[0],
                        "object_type": c.object_type[0],
                        "issue": c.issue[0],
                        "severity": parseInt(c.severity[0]),
                        "latlng_x": parseFloat(c.latlng_x[0]),
                        "latlng_y": parseFloat(c.latlng_y[0]),
                        "feeder_number": c.feeder_number[0],
                        "address": c.address[0]
                    };
                    if (c.image1)
                        obj.image1 = c.image1[0];

                    if (c.image2)
                        obj.image2 = c.image2[0];

                    ca.push(obj);
                });
                res.json(ca);
            }
        });
    });
});

// caRouter.get('/demo', function (req, res) { // Demo ///////////////////////////////////
//     nextGrid.mongodemo.collection('NextGrid_Cond_Assessment').find({}, {}).toArray(function (err, docs) {
//         if (err) {
//             console.log('Cond. Assessment error:' + err);
//             res.json({ "error": "Cond. Assessment data not found." });
//         }
//         else {
//             res.json(docs)
//         }
//
//     });
// });/////////////////////////////////////////////////////

// caRouter.get('/', function(req, res){
//     var q = "SELECT fq.TRAN_DTL_ID, fq.object_type, fq.issue, fq.severity, qd.latlng_x, qd.latlng_y, qd.feeder_number, qd.address," +
//         " EXTRACTVALUE(qd.wk_dtl_xml, '/*/parameter[@name=\"Images\"]/element[@name=\"1\"]') AS IMAGE1" +
//         " FROM SW$ADMIN.CA_FOLLOWUP_QUEUE fq" +
//         " LEFT JOIN SW$ADMIN.CA_TRAN_DTL td ON td.TRAN_DTL_ID = fq.TRAN_DTL_ID" +
//         " LEFT JOIN SW$ADMIN.CA_TRAN_HDR th ON td.TRAN_HDR_ID = th.TRAN_HDR_ID" +
//         " LEFT JOIN SW$ADMIN.CA_QUEUE_DTL qd ON th.WK_LOC_ID = qd.WK_LOC_ID" +
//         " WHERE fq.FLUP_WK_NUM != 'REPAIRED' AND fq.FLUP_WK_STATUS IS NOT NULL AND fq.FLUP_WK_STATUS < '70'";
//     if (req.query.type === 'feeder')
//         q += " AND qd.feeder_number = '" + req.query.value + "'";
//     else if (req.query.type === 'sub'){
//         var wrappedFeeders = "'" + req.query.value.replace(/,/g, "','") + "'";
//         q += " AND qd.feeder_number IN (" + wrappedFeeders +")";
//     }
//     else if (req.query.type === 'ma') {
//         q += " AND qd.management_area = '" + req.query.value + "'";
//     }
//     //console.log(q);
//     oracledb.getConnection({user: config.oracleAmsUser, password: config.oracleAmsPassword, connectString: config.oracleAmsConnectString}, function(err, cn) {
//         if (err) {
//             console.error(err.message);
//             return;
//         }
//         cn.execute(q, [], {maxRows: 10000, outFormat:oracledb.OBJECT}, function(err, result) {
//             if (err) {
//                 console.error(err.message);
//                 res.json({"error": "condAssess database issue"});
//             }
//             else if (result.rows.length === 0)
//                 res.json({"error": "condAssess data not found"});
//             else
//                 res.json(result.rows);
//             cn.release(function (err) {
//                 //console.log('orcl released');
//                 if (err)
//                     console.error(err.message);
//             });
//         });
//     });
// });

module.exports = caRouter;