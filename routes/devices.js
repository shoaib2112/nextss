/**
 * Created by cxs0w3k on 3/23/2017.
 */
var express = require('express');
var devices = express.Router();
var sql = require('mssql');
//var sqlCn = require('../nextGrid').sqlCn;
var _ = require('underscore');
var async = require('async');
var webrequest = require('request');
var parseString = require('xml2js').parseString;
var nextGrid = require('../nextGrid.js');
var config = require('../config.js');

devices.get('/', function(req, res){
    var q1 = "SELECT s.switch, s.substation, s.feeder, s.fpl_id, s.latitude, s.longitude, s.type, df.deviceFunction" +
        " FROM dbo.tbl_afs_switch s JOIN dbo.tbl_afs_device_function df on s.device_function = df.id ";
    var q2 = "SELECT DISTINCT fi.SUB, fi.fdra as feeder, ftr.SWITCH_NUM, fi.P_fplid, fi.latitude, fi.longitude FROM edna.point p " +
        "JOIN DBO.[sg_FCI_ams_fault_indicators] FI ON SUBSTRing(P.LONGID,16,charindex('.',p.longid,17)-16) = cast(fi.u_fplida as varchar(12)) " +
        "JOIN DBO.sg_FCI_tracker ftr ON ftr.FCIU_FPLID = fi.u_fplida WHERE P.EQUIPMENTTYPEID = 9 AND p.units in ('FAMP','FIND') AND fi.P_status != 'Removed' ";

    if (req.query.type === 'sub'){
        q1 += " WHERE s.substation = '" + req.query.value.replace('_', ' ') + "' ORDER BY s.feeder";
        q2 += " AND fi.SUB = '" +  req.query.value.replace('_', ' ') + "' ORDER BY fi.fdra";
    }
    else if (req.query.type === 'feeder'){
        q1 += " WHERE s.feeder = " + req.query.value;
        q2 += " AND fi.fdra = " +  req.query.value;
    }
    else{
        q1 += " ORDER BY s.substation, s.feeder";
        q2 += " ORDER BY fi.SUB, fi.fdra"
    }

    //console.log(q1);
    //console.log(q2);
    var r1 = new sql.Request(nextGrid.connDPDCSQL);
    r1.query(q1, function(err, rs1) {
        if (err) console.log('SQL Server query: ' + q1 + ' error: ' + err);
        var r2 = new sql.Request(nextGrid.connDPDCSQL);
        r2.query(q2, function(err, rs2) {
            if (err) console.log('SQL Server query: ' + q2 + ' error: ' + err);
            res.json({afs: rs1, fci: rs2});
        });
    });
});

devices.get('/als/2yr', function (req, res) {
    var request = new sql.Request(nextGrid.connDPDCSQL);
    request.input('sub', sql.NVarChar(30), req.query.sub);

    request.execute('dbo.nextGrid_get_als_2year', function (err, recordset, returnValue) {
        if (err) {
            console.log("Error: " + err);
            res.json("Error: " + err);
            return;
        }
        res.json(recordset);
    });


});

devices.get('/als/count', function (req, res) {
    var qry = "SELECT ts_parent_fpl_id, FORMAT(meter_event_tmstmp, 'yyyy-MM-dd') AS EventDay, xfrmr_phase, MAX(Today_Count) AS count, feeder, dvc_coor " +
    "FROM  ami.capStone " +
    "WHERE [meter_event_tmstmp] BETWEEN '" + req.query.bdate + "' AND '" + req.query.edate + " 23:59:59.999' ";

    if (req.query.dates) {
        var dstr = '';
        req.query.dates.split(',').forEach(function(d) {
            dstr += "'" + d + "',";
        });
        qry += "AND FORMAT(meter_event_tmstmp, 'yyyy-MM-dd') IN (" + dstr.slice(0, -1) + ") ";
    }

    qry += "AND ([Today_Count] IS NOT NULL AND [Today_Count] > 0) " +
    "AND [substn_name] = '" + req.query.sub + "' " +
    //"AND ts_parent_fpl_id = " + req.query.id + " " +
    "GROUP BY FORMAT(meter_event_tmstmp, 'yyyy-MM-dd'),[ts_parent_fpl_id],[xfrmr_phase],[feeder],[substn_name],[meter_event_tmstmp], dvc_coor " +
    "ORDER BY EventDay DESC";

    var request = new sql.Request(nextGrid.connDPDCSQL);
    request.query(qry, function (err, recordset, returnValue) {
        if (err) {
            console.log("Error: " + err);
            return;
        }

        var finalALS = [];
        var als = _.uniq(recordset, true, function (item, key, a) { // Strip out dupes from the database
            return item.EventDay + item.count + item.xfrmr_phase + item.ts_parent_fpl_id;
        });

        als.forEach(function (rec) {
            // take the row data and make a,b,c columns
            rec.countA = 0;
            rec.countB = 0;
            rec.countC = 0;

            if (rec.xfrmr_phase === 'A')
                rec.countA = rec.count;
            else if (rec.xfrmr_phase === 'B')
                rec.countB = rec.count;
            else if (rec.xfrmr_phase === 'C')
                rec.countC = rec.count;

            // Merge rows of the same day
            var idx = _.findKey(finalALS, {EventDay: rec.EventDay}) || -1;
            var idx2 = _.findKey(finalALS, {ts_parent_fpl_id: rec.ts_parent_fpl_id }) || -1;

            if (idx === -1 || idx2 === -1) {
                finalALS.push(rec);
            }
            else {
                finalALS[idx].countA += rec.countA;
                finalALS[idx].countB += rec.countB;
                finalALS[idx].countC += rec.countC;
            }

        });

        async.forEachOf(finalALS, function (m, key, cb) {
            var rec = m;
            webrequest(config.amsgss.url + m.dvc_coor, function (error, response, body) {
                //console.log(response);
                if (!error && response.statusCode === 200) {
                    parseString(body, function (err, result) {

                        try {   // fun with xml!
                            if (result.return.hasOwnProperty('service_response')) {
                                var obj = {lat: null, lng: null};

                                obj.lat = result.return.service_response[0].assets_found[0].collection[0].element[0].hash[0].element[1]._ || null;
                                obj.lng = result.return.service_response[0].assets_found[0].collection[0].element[0].hash[0].element[6]._ || null;

                                obj.lat = parseFloat(obj.lat);
                                obj.lng = parseFloat(obj.lng);
                                rec.lat = obj.lat;
                                rec.lng = obj.lng;
                            }
                        }
                        catch (e) {
                        }
                        cb();
                    });
                }
                else {
                    console.log('ERROR: ' + error + ' Could not load service at ' + config.amsgss.url + m.dvc_coor);
                    cb();
                }
            });

        }, function (err) {
            if (err) return next(err);

            res.json(finalALS);
        });

    });
});
module.exports = devices;