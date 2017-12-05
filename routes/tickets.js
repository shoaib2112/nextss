var express = require('express');
var tktRouter = express.Router();
var moment = require('moment');
//var _ = require('underscore');
//var config = require('../config.js');
var geo = require('../lib/geo.js');
var nextGrid = require('../nextGrid.js');

// ma, sc, sub, feeder
tktRouter.get('/:type/:id/:dtbegin/:dtend*?', function (req, res) {
    var qry = {
        "TCKT_CRTE_DTTM" : {
            "$gte": moment(req.params.dtbegin).toDate(),
            "$lte": moment(req.params.dtend || req.params.dtbegin + ' 11:59:59 PM').toDate()
        }
    };
        
    switch (req.params.type) {
        case "ma":
            qry.MGR_AREA_CODE = req.params.id;
            break;
        case "sc":
            qry.SRV_CTR_NAME = req.params.id;
            break;
        case "sub":
            qry.SUBSTATION = req.params.id.toUpperCase();
            break;
        case "feeder":
            qry.FDR_NUM = parseInt(req.params.id);
            break;
    }

    if (req.query.dates) {
        qry.Date_str = {
            "$in": req.query.dates.split(',')
        }
    }

    nextGrid.mongo.collection('NextGrid_Tickets').find(qry, {}).toArray(function (err, docs) {
        if (err) {
            console.log('Tickets error:' + err);
            res.json({ "error": "Tickets data not found." });
        }
        else {
            // filter tickets on lat,lng 
            if (req.query.lng && req.query.lat) {
                var fltr = [];
                var lng = parseFloat(req.query.lng);
                var lat = parseFloat(req.query.lat);
                for (var i = 0, len = docs.length; i < len; i++) {
                    if (geo.distToPoint(docs[i].lat, lat, docs[i].lng, lng) < geo.RADIUS)
                        fltr.push(docs[i]);
                }
                //console.log("Original: " + docs.length + " fltr: " + fltr.length);
                res.json(fltr);
            }
            else {
                res.json(docs)
            }
        }

    });
});



tktRouter.get('/trucks/:id', function (req, res) {
    var qry = {};
    // qry.DW_TCKT_KEY = {
    //     "$in": req.params.id.split(",").map(Number)
    // }
    qry.DW_TCKT_KEY = parseInt(req.params.id);
    qry.TCKT_TYPE_CODE = 'FDR';
    // var qry = {
    //     "TCKT_CRTE_DTTM" : {
    //         "$gte": new Date(req.params.dtbegin),
    //         "$lte": new Date(req.params.dtend || req.params.dtbegin + ' 11:59:59 PM')
    //     }
    // };

    nextGrid.mongo.collection('NextGrid_Tickets').find(qry, {}).toArray(function (err, docs) {
        if (err) {
            console.log('Tickets error:' + err);
            res.json({ "error": "Tickets data not found." });
            return;
        }
        else if (docs.length === 0) {
            console.log('Ticket not found ');
            res.json({ "error": "Tickets data not found." });
            return;
        }
        var tkt = docs[0],
            trucks = [],
            qryTruck = {};

        //qryTruck.vehicle_number = "/.*" + tkt.CREW_TRUK_CODE.substring(2) + ".*/i";
        nextGrid.mongo.collection('NextGrid_TruckCrews').find({ "CREW_ID": tkt.IVGT_ID }, {}).toArray(function (err, docs) {
//11137400, 11138418
            if (docs[0].VEHICLE_NUMBER) {
                //var vehicle = docs[0].VEHICLE_NUMBER;
                qryTruck.truck_code = docs[0].VEHICLE_NUMBER;
                //if (tkt.CREW_TRUK_CODE) {

                //qryTruck.driver_name = "Fredrickson / Flynn WB4221";
                    //qryTruck.driver_name = "/" + tkt.CREW_TRUK_CODE + "/i";
                    //qryTruck.truck_code = tkt.CREW_TRUK_CODE.substring(2);
                    qryTruck.datetime = {
                        "$gte": new Date(tkt.PWR_OFF_DTTM),
                        "$lte": new Date(tkt.TCKT_RESTOR_DTTM)
                    };
                nextGrid.mongo.collection('NextGrid_Trucks').find(
                    qryTruck, {})
                    .limit(1)
                    .toArray(function (err, truckdocs) {
                    if (err) console.log('Ticket Trucks error:' + err);
                    console.log(truckdocs.length + " truck records");
                    tkt.trucks = truckdocs;
                    res.json(tkt);
                });
                }
                else {
                    //qryTruck.truck_code = "";
                    tkt.trucks = [];
                    res.json(tkt);
                    return;
                }

        });
        //
        //if (req.query.lng && req.query.lat) {
        //     var fltr = [];
        //     var lng = parseFloat(req.query.lng);
        //     var lat = parseFloat(req.query.lat);
        //     for (var i = 0, len = docs.length; i < len; i++) {
        //         if (geo.distToPoint(docs[i].lat, lat, docs[i].lng, lng) < geo.RADIUS)
        //             fltr.push(docs[i]);
        //     }
            //console.log("Original: " + docs.length + " fltr: " + fltr.length);
         //   res.json(fltr);
        //}
        // else {
        //     res.json(docs)
        // }


    });
});

//tktRouter.get('/', function(req, res){
//    var q = "SELECT t.dw_tckt_key, t.trbl_tckt_num, t.tckt_crte_dttm, sa.mgr_area_code, sa.SRV_CTR_NAME, d.FDR_NUM, " +
//        "tf.totl_call_for_the_tckt, tf.tckt_type_code, tf.irpt_type_code, tf.dvc_key, tf.cust_afct_cnt, tf.TCKT_STAT_CODE, tf.TCKT_DVC_COOR " +
//        "FROM psdwdm.ticket t " +
//        "JOIN psdwdm.ticket_facts tf ON tf.dw_tckt_key = t.dw_tckt_key AND tf.CRNT_ROW_FLAG = 'Y' " +
//        "JOIN psdwdm.DEVICE d ON d.DVC_KEY = tf.DVC_KEY " +
//        "JOIN psdwdm.service_area sa ON sa.srv_area_key = tf.srv_area_key AND sa.CRNT_ROW_FLAG = 'Y' ";

//    if (req.query.type === 'ma')
//        q += "WHERE sa.mgr_area_code = '" + req.query.value + "' ORDER BY t.tckt_crte_dttm DESC";
//    else if (req.query.type === 'sc')
//        q += "WHERE sa.SRV_CTR_NAME = '" + req.query.value + "' ORDER BY t.tckt_crte_dttm DESC";
//    else if (req.query.type === 'sub'){
//        var wrappedFeeders = "'" + req.query.value.replace(/,/g, "','") + "'";
//        q += " WHERE d.FDR_NUM IN (" + wrappedFeeders + ")" + " ORDER BY t.tckt_crte_dttm DESC";
//    }
//    else if (req.query.type === 'feeder')
//        q += "WHERE d.FDR_NUM = '" + req.query.value + "' ORDER BY t.tckt_crte_dttm DESC";
//    else
//        res.json({"error": "bad type"});

//    oracledb.getConnection({user: config.oracleDwUser, password: config.oracleDwPassword, connectString: config.oracleDwConnectString}, function(err, cn) {
//        if (err) {
//            console.error(err.message);
//            return;
//        }
//        cn.execute(q, [], {maxRows: 1000, outFormat: oracledb.OBJECT}, function (err, result) {
//            if (err) {
//                console.error(err.message);
//                res.json({"error": "trouble tickets database issue"});
//            }
//            else if (result.rows.length === 0)
//                res.json({"error": "trouble tickets data not found"});
//            else
//                res.json(result.rows);
//            cn.release(function (err) {
//                if (err)
//                    console.error(err.message);
//            });
//        });
//    });
//});

tktRouter.post('/', function(res, req) {
});
module.exports = tktRouter;


