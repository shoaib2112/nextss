'use strict';
var compress = require('compression');
var express = require('express');
//var _ = require('underscore');
var sql = require('mssql');
var bodyParser = require('body-parser');
var path = require('path');
var config = require('./config.js');
//var moment = require('moment');
//var oracledb = require('oracledb');
//var fs = require('fs');
var cluster = require('cluster');
var logs = require('./routes/logs');
var dbconn = require('./lib/dbConnections');
var fpl = require('./lib/fplModule');
var os = require('os');
var async = require('async');

var app = express();
app.use(compress());   // Must be first
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST. GET, PUT, DELETE, OPTIONS");
    next();
});
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname + '/frontEnd')));
app.use(express.static(path.join(__dirname + '/build')));
var nglog = function (req, res, next) {
    if (req.hostname === 'localhost') {
        return next();
    }
    var obj = {
        slid: (typeof(req.headers["cookie"]) !== "undefined" ? req.headers["cookie"].split("=")[1] : ""),
        method: req.method,
        dateTime: new Date(),
        host: req.hostname,
        url: req.url,
        agent: req.headers["user-agent"]
    };
    exports.mongo.collection('NextGrid_Userlog').insert(obj, function (err, rec) {
        if (err)
            console.log('Log error: ' + err);

        next();
    });
};
app.use(nglog);
var cache = {
    metadata: []
};
// var orclCache = {
//     psc: [],
//     als: []
// };
// Timers ///////////////////////////////////////////////////
// setInterval(function () { loadPSC(); }, config.psc_interval);
// setInterval(function () { loadALS(); }, config.als_interval);

// routes ---------------------------------------------------------------------------
var assetRouter = express.Router();
var ltgRouter = require('./routes/lightning');
var authRouter = require('./routes/authentication');
var userRouter = require('./routes/user');
var amiRouter = require('./routes/ami');
var faultRouter = require('./routes/fault');
var vinesRouter = require('./routes/vines');
var caRouter = require('./routes/conditionAssessment');
var tktRouter = require('./routes/tickets');
var workRouter = require('./routes/work');
var monRouter = require('./routes/datamon');
var imgRouter = require('./routes/images');
var devicesRouter = require('./routes/devices');
var mongodevicesRouter = require('./routes/mongodevices');
var logRouter = require('./routes/logs');
var complRouter = require('./routes/complaints');
var polyMARouter = require('./routes/polygonMgmtArea');
var momsRouter = require('./routes/momentaries');
var subLocRouter = require('./routes/subLocation');

app.use('/authenticate', authRouter);
app.use('/admin', userRouter);
app.use('/ami', amiRouter);
app.use('/fault', faultRouter);
app.use('/vines', vinesRouter);
app.use('/lightning', ltgRouter);
app.use('/condAssess', caRouter);
app.use('/tickets', tktRouter);
app.use('/assets', assetRouter);
app.use('/work', workRouter);
app.use('/monitor', monRouter);
app.use('/img', imgRouter);
app.use('/devices', devicesRouter);
app.use('/mongodevices', mongodevicesRouter);
app.use('/logs', logRouter);
app.use('/complaints', complRouter);
app.use('/polygonMgmtArea', polyMARouter);
app.use('/momentaries', momsRouter);
app.use('/sublocation', subLocRouter);

app.get('/metadata', function(req, res){
    res.json(cache.metadata);
});

app.get('/cme', function(req, res){
    var startDate = new Date(req.query.startDate),
        endDate = new Date(req.query.endDate),
        substation = req.query.substation;

    var FeederCME = {},
        LateralCME = {};

    exports.mongo.collection('CMEFeeder').find(
        {
            outg_date: {
                $gte: new Date(startDate),
                $lt: new Date(endDate)
            },
            substation: substation
        }
    ).toArray(function(err, docs){
        if(err) {
            console.log('load cmeFeeder data fail: ' + err);
            res.json({"error" : "cmeFeeder data not found"});
        }
        else if( docs.length === 0){
            res.json({"Error" : "cmeFeeder list data not found"});
        }
        else
            for(var i = 0; i < docs.length; i++){
                var fdrNum = docs[i].fdr_num;
                if(typeof FeederCME[docs[i].fdr_num] === 'undefined'){
                    FeederCME[fdrNum] = {
                        fdr_num: docs[i].fdr_num,
                        momCount: 0,
                        custCount: 0
                    }
                }
                if(!isNaN(parseInt(docs[i].mom_cnt)) && !isNaN(parseInt(docs[i].custCount))) {
                    FeederCME[fdrNum].momCount += parseInt(docs[i].mom_cnt);

                    FeederCME[fdrNum].custCount += parseInt(docs[i].custCount);
                }
            }

            exports.mongo.collection('CMELateral').find(
                {
                    date: {
                        $gte: new Date(startDate),
                        $lt: new Date(endDate)
                    },
                    substn_name: substation
                }
            ).toArray(function(err, docs){
                if(err) {
                    console.log('cme data fail: ' + err);
                    res.json({"error" : "cme data not found"});
                }
                else if( docs.length === 0){
                    res.json({"Error" : "cme list data not found"});
                }
                else {
                    for(var i = 0; i < docs.length; i++){
                        var lateralFPLID = docs[i].lat_fplid;
                        if(typeof LateralCME[lateralFPLID] === 'undefined'){
                            LateralCME[lateralFPLID] = {
                                momCount: 0,
                                custCount: 0,
                                lat_fplid: docs[i].lat_fplid,
                                substation: docs[i].substn_name,
                                feeder: docs[i].fdr_num,
                                lat: docs[i].sw_latitude,
                                lon: docs[i].sw_longitude
                            }
                        }

                        LateralCME[lateralFPLID].momCount += parseInt(docs[i]['mtr_ops_under_1_min']);
                        LateralCME[lateralFPLID].custCount += parseInt(docs[i]['cust_count']);
                    }

                    for (var prop in LateralCME) {
                        // skip loop if the property is from prototype
                        if(!LateralCME.hasOwnProperty(prop)) continue;

                        var latCME =  LateralCME[prop];


                        latCME.CME = latCME.momCount/latCME.custCount;
                        if(typeof FeederCME[latCME.feeder] !== 'undefined'){

                            latCME.feederCME = FeederCME[latCME.feeder].momCount/FeederCME[latCME.feeder].custCount;

                            latCME.comparison = latCME.CME/latCME.feederCME;
                            if(latCME.comparison <= 1)
                                latCME.colorCode = 'green';
                            else if(latCME.comparison > 1 && latCME.comparison <= 1.5)
                                latCME.colorCode = 'yellow';
                            else if(latCME.comparison > 1.5)
                                latCME.colorCode = 'red';
                            console.log(latCME.feederCME);
                        }
                    }

                    res.json(LateralCME);

                    // console.log(LateralCME);
                }

            })
    })


});

app.get('/toEnd/:fplID', function(req, res){
    var fplIDToTraceBy = req.params.fplID,
        faultIndicator = {};

        async.series([
            function(callback){
                exports.mongo.collection('NextGrid_RecentVertices').find({'geoJSON.properties.fplID': fplIDToTraceBy}).toArray(function(err, docs){
                    if(err){
                        console.log('Error in getting node of: ' + fplIDToTraceBy + ' from NextGrid_RecentVertices');
                        res.json({'error ' : err});
                    }

                    else if (docs.length === 0) res.json({'error' : 'No Node found'});
                    else {
                        faultIndicator = docs[0];
                        callback();
                    }
                })
            },

            function(callback){
                exports.mongo.collection('NextGrid_RecentVertices').aggregate([
                    {
                        $geoNear: {
                            near: //{ type: "Point", coordinates:[
                                // -80.11924743652344,
                                // 26.323265075683594
                                faultIndicator.geoJSON.geometry,
                            //] },
                            distanceField: "dist.calculated",
                            maxDistance: 30,
                            query: { $or: [{'geoJSON.properties.fplClass': 'oh_switch'}, {'geoJSON.properties.fplClass': 'oh_fuse_switch'}] },
                            includeLocs: "dist.location",
//        num: 1,
                            spherical: true
                        }
                    }

                    ,{
                        $sort: {
                            'dist.calculated': 1
                        }
                    }

                    ,{
                        $limit: 1
                    }

                    ,{
                        $graphLookup: {
                            from: 'NextGrid_RecentEdges',
                            startWith: '$nodeId',
                            connectFromField: 'toNode',
                            connectToField: 'fromNode',
                            as: 'nodesToMap',

                            restrictSearchWithMatch: {
                                phase: faultIndicator.geoJSON.properties.phase
                            }
                        }
                    }

                    ,{
                        $project: {
                            nodesToMap: 1
                        }
                    }

                    ,{
                        $unwind: '$nodesToMap'
                    }

                    ,{
                        $lookup:
                            {
                                from: "NextGrid_RecentVertices",
                                localField: "nodesToMap.toNode",
                                foreignField: "nodeId",
                                as: "Vertices"
                            }
                    }

                    ,{
                        $project:
                            {
                                Vertices: 1
                            }
                    }

                    ,{
                        $unwind: '$Vertices'
                    }

                    ,{
                        $lookup:
                            {
                                from: 'NextGrid_RecentVertices',
                                localField: 'Vertices.geoJSON.properties.parentID',
                                foreignField: 'geoJSON.properties.parentID',
                                as: 'primaries'
                            }
                    }

                    ,{
                        $unwind: '$primaries'
                    }

                    ,{
                        $project: {
                            primaries: 1
                        }
                    }

//                     ,{
//                         $match:
//                             {
//                                 $or: [
//                                     {'primaries.geoJSON.properties.fplClass' : 'ug_primary'},
//                                     {'primaries.geoJSON.properties.fplClass' : 'oh_primary'}
// //        {'primaries.geoJSON.properties.fplClass' : 'feeder_head'}
//                                 ]}
//                     }
                ]).toArray(function(err, docs){
                    if(err){
                        console.log('error graphLookup for end of feeder: ' + err );
                        res.json({'error' : err});
                    }
                    else if(docs.length === 0){
                        res.json({'error': 'No nodes found for trace'});
                    }
                    else {
                        res.json(docs);
                    }
                })
            }


        ])



});

app.get('/FAMP/:substation/:fdr*?' , function (req, res){
    var FAMPs = [];
    var FAMPGroups = [];
    async.series([
        function(callback){
            var qry = {};

            if (req.params.substation)
                qry['substation'] = req.params.substation;

            if(req.params.fdr)
                qry['feederNum'] = req.params.fdr;

            exports.mongo.collection('NextGrid_FAMP').find(qry).toArray(function(err, docs) {
                if (err) {
                    console.log('Error in /FAMP' + err);
                    res.json({"error": err});
                }
                else if (docs.length === 0)
                    res.json({"error": "No FAMPS found."});
                else {
                    FAMPs = docs;
                    callback();
                }
            });
        },
        //organize by dates
        function(callback){
            for(var i = 0; i < FAMPs.length; i++){
                var addedToGroup = false;
                for(var j = 0; j < FAMPGroups.length; j++){
                    //same Feeder and is within ten seconds
                    if(FAMPGroups[j][0].feederNum === FAMPs[i].feederNum && isLessThanTenSeconds(FAMPGroups[j][0].Date, FAMPs[i].Date)){
                        FAMPGroups[j].push(FAMPs[i]);
                        addedToGroup = true;
                        break;
                    }
                }

                if(!addedToGroup){
                    var tempGroupedFAMP = [];
                    tempGroupedFAMP.push(FAMPs[i]);
                    FAMPGroups.push(tempGroupedFAMP);
                }
            }

            callback();

            function isLessThanTenSeconds(originalDate, newDate){
                var TEN_SECONDS = 1000* 10;

                if(Math.abs(new Date(originalDate)-new Date(newDate))<TEN_SECONDS){
                    return true;
                }
                else return false;
            }
        },
        //order groups larger than 1 by how close it is to feederHead
        function(callback){
            for(var i = 0; i < FAMPGroups.length; i++){
                if(FAMPGroups[i].length > 1){
                    async.forEachOfLimit(
                        FAMPGroups[i],
                        1,
                        function (FAMP, key, callbackEach) {
                            console.log(FAMP);
                        },
                        function (error) {
                            if (error) console.log('error: ', error);
                            res.json(FAMPgroups);

                        })
                }
            }
            res.json(FAMPGroups);
        }
    ]);

});

app.get('/cropGrid', function(req, res){
    exports.mongo.collection('ha_vertices').aggregate( [
        {
            $match: {
                nodeId: 275151138,
            }
        }

        ,
        {
            $graphLookup: {
                from: "ha_edges",
                startWith: "$nodeId",
                connectFromField: "fromNode",
                connectToField: "toNode",
                as: "backToFeeder",
                restrictSearchWithMatch: {
                    phase: "A"
                }
            }
        }

        ,
        {
            $project: {
                backToFeeder: 1
            }
        }
        ,
        {
            $unwind: "$backToFeeder"

        }

        ,
        {
            $lookup:
                {
                    from: "ha_vertices",
                    localField: "backToFeeder.fromNode",
                    foreignField: "nodeId",
                    as: "vertice_data"
                }
        }

        ,
        {
            $project:
                {
                    vertice_data: 1
                }
        }

        ,
        {
            $unwind: "$vertice_data"
        }

        ,
        {
            $lookup:
                {
                    from: "ha_vertices",
                    localField: "vertice_data.DvcAttr.parentID",
                    foreignField: "DvcAttr.parentID",
                    as: "primary"
                }
        }

        ,
        {
            $unwind: "$primary"
        }

        ,
        {
            $match: {
                $or: [{
                    "primary.DvcAttr.fplClass": "ug_primary",
                    "primary.DvcAttr.fplClass": "oh_primary",
                    'vertice_data.dateInserted':  new Date("2017-06-28T20:21:26.000+0000")
                }]
            }
        }

        ,
        {
            $project: {
                "primary.DvcAttr": 1
            }
        }

    ] ).toArray(function(err, docs){
        if(err) {
            console.log('vertice data fail: ' + err);
            res.json({"error" : "vertice data not found"});
        }
        else if( docs.length === 0){
            res.json({"Error" : "Vertice list data not found"});
        }
        else
            res.json(docs);
    })
});

app.get('/boundingboxPremises', function(req, res){
    console.log('request received for premises withing bounding box');
    var premisesToReturn = [];
    // console.log(req.query.cords);

    var swLon = parseFloat(req.query.swLon),
        swLat = parseFloat(req.query.swLat),
        neLon = parseFloat(req.query.neLon),
        neLat = parseFloat(req.query.neLat);

    var queryCords = [ [ [swLon,swLat],
        [neLon,swLat],
        [neLon, neLat],
        [swLon,neLat],
        [swLon,swLat] ] ];
    //
    // var queryCords = JSON.parse(req.query.cords);
    // res.json(queryCords);

    exports.mongo.db('Customer_DEV').collection('Premises').find({
        geometry: {
            $geoWithin: {
                $geometry: {
                    type : "Polygon" ,
                    coordinates: queryCords
                }
            }
        }
    }).toArray(function (err, premises) {
        // res.json(premises);

        async.forEachOfLimit(
            premises,
            1,
            function(premise, key, callbackEach){
                if(premise.properties.tx_fpl_id === null){
                    console.log(premise);
                    premisesToReturn.push({
                        prem_num: premise._id,
                        prem_stat_ds: premise.properties.prem_stat_ds,
                        prem_cords: premise.geometry.coordinates,
                        // transformer_cords: transformer.DvcAttr.cords[0]
                        transformer_cords: null
                    });

                    callbackEach();
                }
                else{
                    var transformerFPLID = premise.properties.tx_fpl_id.toString();
                    // console.log(transformerFPLID);
                    exports.mongo.db('Magog').collection('NextGrid_RecentVertices').find({
                        // 'geoJSON.properties.fplID' : premise.properties.tx_fpl_id.toString()
                        'geoJSON.properties.fplID' : transformerFPLID
                    }).toArray(function(err, transformers){
                        var transformer = transformers[0];
                        if(typeof transformer === 'undefined'){
                            console.log('no results for this fplID: ' + transformerFPLID);
                            premisesToReturn.push({
                                prem_num: premise._id,
                                prem_stat_ds: premise.properties.prem_stat_ds,
                                prem_cords: premise.geometry.coordinates,
                                // transformer_cords: transformer.DvcAttr.cords[0]
                                transformer_cords: null
                            });
                        }
                        else {
                            // console.log('transformer coordinates: ' + transformer.geoJSON.geometry.coordinates);

                            premisesToReturn.push({
                                prem_num: premise._id,
                                prem_stat_ds: premise.properties.prem_stat_ds,
                                prem_cords: premise.geometry.coordinates,
                                // transformer_cords: transformer.DvcAttr.cords[0]
                                transformer_cords: transformer.geoJSON.geometry.coordinates
                            });
                        }



                        callbackEach();
                    })
                }

            },
            function(error){
                if(error) console.log('error: ' , error);
                res.json(premisesToReturn)
            });
    });
});

app.get('/grid', function(req, res){
    exports.mongo.collection('NextGrid_RecentVertices').find({ $or: [
        { 'geoJSON.properties.fplClass' : 'ug_primary' } ,
        {'geoJSON.properties.fplClass' : 'oh_primary'},
        {'geoJSON.properties.fplClass': 'fault_indicator', 'geoJSON.properties.deployment_status': 'In-Service' } ],
        'geoJSON.properties.substation' : req.query.sub}, {geoJSON: 1}).toArray(function(err, docs){
        if(err) {
            console.log('vertice data fail: ' + err);
            res.json({"error" : "vertice data not found"});
        }
        else if( docs.length === 0){
            res.json({"Error" : "Vertice list data not found"});
        }
        else
            res.json(docs);
    })
});
app.get('/so/:type', function(req, res){
    var q;
    if (req.params.type === 'complete')
        q = {complete:1};
    else if (req.params.type === 'incomplete')
        q = {complete:0};
    else if (req.params.type === 'written')
        q = {SWO_STATUS:"WRTN"};

    exports.mongo.collection('switchingOrders').find(q).toArray(function(err, docs) {
        if (err){
            console.log('switching orders fail: ' + err);
            res.json({"error": "switching orders collection not found"});
        }
        else if (docs.length === 0)
            res.json({"error": "switching orders data not found"});
        else
            res.json(docs);
    });
});

assetRouter.get('/', function(req, res){
    var cursor;
    if (isNaN(req.query.feeder)) { //it is a sub if there is no valid feeder
        cursor = exports.mongo.collection('assets_refresh').find({"sub": req.query.sub}, {"nodes":0, "dateInserted": 0, "_id": 0, "assetModel": 0}).toArray(function (err, docs) {
            if (err || !docs) {
                console.log('assets not found for sub %s %s', req.query.sub, err);
                res.json({"error": "id not found " + req.query.sub});
            }
            else {
                    res.json(docs);
            }
        })
    }
    else { // it is a feeder
        cursor = exports.mongo.collection('assets_refresh').find({"feederName":req.query.feeder}, {"nodes":0, "dateInserted": 0, "_id": 0, "assetModel": 0}).toArray(function(err, docs) {
            if (err || !docs) {
                console.log('assets not found for feeder %s %s', req.query.feeder, err);
                res.json({"error": "id not found " + req.query.feeder});
            }
            else
                res.json(docs);
        })
    }
});

app.get('/palm', function(req, res){
    var q;
    if (req.query.type === 'ma')
        q = {'MANAGER_AR': req.query.value};
    else if (req.query.type === 'sub')
        q = {'SUBSTATION':req.query.value.replace('_', ' ')};
    else if (req.query.type === 'feeder')
        q = {'FEEDER':req.query.value};
    else
        q = {};

    exports.mongo.collection('palms').find(q).toArray(function(err, docs) {
        if (err){
            console.log('palm fail: ' + err);
            res.json({"error": "palm collection not found"});
        }
        else if (docs.length === 0)
            res.json({"error": "palm data not found"});
        else
            res.json(docs);
    });
});

app.get('/fci', function(req, res){
    var q = {"_id": "fciSummary"};

    exports.mongo.collection('fciSummary').find(q).toArray(function(err, docs) {
        if (err){
            console.log('fci fail: ' + err);
            res.json({"error": "fci collection not found"});
        }
        else if (docs.length === 0)
            res.json({"error": "fci data not found"});
        else
            res.json(docs);
    });
});
//events gets breaker operations and momentaries. They are loaded into MongoDB from Oracle and SQL by a nightly batch job
app.get('/events', function(req, res){
    var q;
    if (req.query.type === 'sub')
        q = {substation: req.query.value.replace('_', ' ')};
    else
    if (req.query.type === 'feeder')
        q = {feeder: req.query.value};
    else
        q = {};

    exports.mongo.collection('faultEvents').find(q).toArray(function(err, docs) {
        if (err){
            console.log('faultEvents: ' + err);
            res.json({"error": "faultEvents database not found"});
        }
        else if (docs.length === 0)
            res.json({"error": "No faultEvents found"});
        else
            res.json(docs);
    });
});

app.get('/equipLog', function(req, res){
    var qs = "SELECT el.ID_LOG, el.TS_UPDT ,RECKEY_SUB as sub ,RECKEY_FDR as feeder,eln.REPORT_BY ,eln.TXT_REMARKS,LOG_STATUS ,DT_START ,EQU_TYPE,TKT_NUM ,TKT_DATE" +
    " ,f.latitude as lat, f.longitude as lng FROM [dash].[lfo_equipment_log] el LEFT JOIN dash.lfo_equipment_log_notes eln on eln.ID_LOG = el.ID_LOG" +
    " LEFT JOIN tbl_uni_feeders f on f.feeder_num = TRY_CAST(RECKEY_FDR as int) WHERE RECKEY_FDR IS NOT NULL AND RECKEY_FDR != ' ' AND DT_START > DATEADD (month , -6 , GETDATE() )";

    if (req.query.type === 'sub'){
        qs += " AND RECKEY_SUB = '" + req.query.value.replace('_', ' ') + "' ORDER BY id_log desc, TS_UPDT desc";
    }
    else if (req.query.type === 'feeder'){
        qs += " AND RECKEY_FDR = '" + req.query.value + "' ORDER BY id_log desc, TS_UPDT desc";
    }
    else{
        qs += " ORDER BY id_log desc, TS_UPDT desc";
    }
    var request = new sql.Request(exports.connDPDCSQL);
    request.query(qs, function(err, recordset) {
        if (err){
            console.log('SQL Server query: ' + qs + ' error: ' + err);
            res.json({"error": "equipLog get failed"});
        }
        res.json(recordset);
    });
});

// app.get('/cemi/:id', function (req, res) {
//     var fdr = req.params.id;
//
//     oracledb.getConnection({ user: config.oracleDwUser, password: config.oracleDwPassword, connectString: config.oracleDwConnectString }, function (err, conn) {
//         if (err) {
//             console.error('PSDWDMP connect error: ' + err.message);
//             return;
//         }
//         var sql = "select fdr_num, count(distinct case when intr_cnt_ytd > 3 then p.prem_num else null end)cemiytd " +
//                       ",    (SELECT SUM(CEMI3) " +
//                       "     FROM psdwdm.cemi_info " +
//                       "     where fdr_num = '" + fdr + "') cemi12moe " +
//                       "from psdwdm.cemi_info_prem p " +
//                       "where intr_cnt_ytd > 0 and p.regn_name is not null " +
//                       "and fdr_num = '" + fdr + "' " +
//                       "group by fdr_num";
//
//         conn.execute(sql, [], { outFormat: oracledb.OBJECT, maxRows : 1 }, function (err, result) {
//             if (err) {
//                 console.error('PSDWDMP error: ' + err.message);
//                 res.json({"error": "CEMI get failed"});
//             }
//             else
//                 res.json(result.rows);
//
//             conn.release(function (err) {
//                 if (err)
//                     console.error(err.message);
//             });
//         });
//     });
// });
app.get('/feedertickets/:fdr', function (req, res) {
    loadFeederTickets(req.params.fdr).then(function (response) {
        if (!response.length) {
            res.json({ "message": "No tickets for feeder " + req.params.fdr });
            //res.json({ "error": "Feeder tickets get failed" });
        }
        else {
            res.json(response);
        }
    });
});

// app.get('/invreport', function (req, res) {
//     var request = new sql.Request(exports.connDPDCSQL);
//     request.input('dtbegin', sql.NVarChar(20), req.query.dtbegin);
//     request.input('dtend', sql.NVarChar(20), req.query.dtend); // The date column is actually a nvarchar in the table
//     request.input('feeder_num', sql.NVarChar(20), null);
//     request.execute('dbo.nextGrid_get_InvReport', function (err, recordset, returnValue) {
//         if (err) {
//             console.log("Error: " + err);
//             return;
//         }
//         var r = recordset[0];
//         for (var i = 0, len = r.length; i < len; i++) {
//             r[i].trbl_tckt_num = '';
//             r[i].irpt_caus_code = '';
//             r[i].tckt_type_code = '';
//         }
//         res.json(r);
//     });
// });

// app.get('/mitmatrix', function (req, res) {
//     var cache = {
//         cfci: []
//     };
//
//     var conn = null;    // pstactp orcl
//     var qry = "SELECT f.fdr_num,dash.SUBSTATION, dash.REGION, dash.AREA, dash.CUSTOMERS, dash.RELAYTYPE, dash.GIGX, dash.MOMENTARIES, dash.HARDENING, att.last_thermoinspection, att.last_inspectiondate, dash.thermo,  " +
//             "replace(dash.VEG_LATERAL, '''', '-') VEG_LATERAL, dash.FIS, dash.AFS, replace(dash.VEG_FEEDER, '''', '-') VEG_FEEDER, dash.FDR_M_12MOE, dash.FEEDEROH, dash.LATERALOH, dash.FDR_M_YTD, att.POLE, " +
//             "dash.FDR_N_YTD, dash.INTERRUPTIONS, dash.LAT_N_YTD, dash.LAT_N_12MOE " +
//             ",               (select count(*) from PSBPT.dpdc_momentary_rt " +
//             "                 where fdr_num = f.fdr_num) mcount " +
//             ",                (select pf.year from PSBPT.dpdc_priority_fdr pf where f.fdr_num = pf.feeder) priority_fdr " +
//             "FROM (select a.bkr_open_dttm, a.fdr_num from PSBPT.dpdc_momentary a " +
//             "WHERE a.bkr_open_dttm >= '" + moment(req.query.dtbegin).format('DD-MMM-YY') + "' " +
//             "UNION ALL " +
//             "select b.bkr_open_dttm,b.fdr_num from PSBPT.dpdc_momentary_rt b " +
//             "where b.bkr_open_dttm >= '" + moment(req.query.dtbegin).format('DD-MMM-YY') + "')f " +
//             "INNER JOIN PSBPT.DPDC_FEEDER_DASHBOARD dash ON f.fdr_num = dash.FEEDER " +
//             "LEFT JOIN PSBPT.DPDC_FDR_ATTRIBUTE att ON f.fdr_num = att.FEEDER " +
//             "GROUP BY f.fdr_num, dash.SUBSTATION, dash.REGION, dash.AREA, dash.CUSTOMERS, dash.RELAYTYPE, dash.GIGX, dash.MOMENTARIES, dash.HARDENING, att.last_thermoinspection, att.last_inspectiondate, dash.thermo, dash.VEG_LATERAL, " +
//             "dash.FIS, dash.AFS, dash.VEG_FEEDER, dash.FDR_M_12MOE, dash.FEEDEROH, dash.LATERALOH, dash.FDR_M_YTD, att.POLE, " +
//             "dash.FDR_N_YTD, dash.INTERRUPTIONS, dash.LAT_N_YTD, dash.LAT_N_12MOE " +
//             "ORDER BY mcount DESC, dash.FDR_M_YTD DESC";
//
//     loadCFCI().then(function (response) {
//         cache.cfci = response;
//         connectORCL().then(function (response) {
//             conn = response;
//                 conn.execute(qry, [], { outFormat: oracledb.OBJECT, maxRows : 50000 }, function (err, result) {
//                     if (err)
//                         console.error(err.message);
//                     else if (result.rows.length === 0) {
//                         res.json({ "error": "MIT data not found." });
//                         return;
//                     }
//                     var r = result.rows;
//                     var dt = new Date();
//                     var yr = dt.getFullYear();
//
//                     for (var i = 0, len = r.length; i < len; i++) {
//                         r[i].THERMO = getLastDate(r[i].THERMO);
//                         r[i].VEG_FEEDER = getLastDate(r[i].VEG_FEEDER);
//                         r[i].VEG_LATERAL = getLastDate(r[i].VEG_LATERAL);
//                         r[i].POLE = getLastDate(r[i].POLE);
//                         r[i].gigx_change = '';
//                         r[i].toggle = 'N/A';
//                         r[i].ALS = findALS(r[i].FDR_NUM);
//
//                         // fci and cfci are in 1 query and object
//                         var obj = findCFCI(cache.cfci, r[i].FDR_NUM);
//                         if (obj) {
//                             r[i].fci = obj.fci | 0;
//                             r[i].cfci = obj.cfci | 0;
//                         }
//                         else {
//                             r[i].fci = 0;
//                             r[i].cfci = 0;
//                         }
//
//                         r[i].psc = orclCache.psc[r[i].FDR_NUM] || 0;
//
//                         if (r[i].PRIORITY_FDR != null)
//                             r[i].PRIORITY_FDR = r[i].PRIORITY_FDR.indexOf(yr) !== -1 ? 'Y' : 'N';
//                         else
//                             r[i].PRIORITY_FDR = 'N';
//                     }
//                     res.json(r);
//
//                     conn.release(function (err) {
//                         if (err)
//                             console.error(err.message);
//                     });
//                 });
//         // promises end
//         });
//     });
//
// });
// var getLastDate = function (str) { // gets latest date string out of (2015) 2012 2011 2010 2006
//     if (str && typeof (str) !== 'undefined')
//         return str.split(' ')[0].replace('(', '').replace(')', '');
//     return '';
// };
// var connectORCL = function () {
//     return new Promise(function (resolve, reject) {
//         oracledb.getConnection(config.pstactp, function (err, conn) {
//             if (err) {
//                 console.error(err.message);
//                 reject(err);
//             }
//             else
//                 resolve(conn);
//         });
//     });
// };
// var loadALS = function () {
//     var qry = "select fdr , sum(TripSaver2) TripSaver2 " +
//             "from( " +
//             "select(substr(f.district_code, 1, 1) || f.feeder_number) fdr " +
//             ", COUNT(distinct case when b.recloser_type = 'TS2'Then b.id ELSE NULL END) TripSaver2 " +
//             "from sw$admin.recloser a " +
//             ", sw$admin.recloser_unit b " +
//             ", sw$admin.feeder_head f " +
//             "where a.id = b.recloser_id " +
//             "and a.feeder_head_id = f.id " +
//             "and b.status not in ('Removed', 'Proposed Install') " +
//             "group by(substr(f.district_code, 1, 1) || f.feeder_number) " +
//             "union all " +
//             "select(substr(f.district_code, 1, 1) || f.feeder_number) fdr " +
//             ", count(distinct fsu.id) as TripSaver2 " +
//             "from sw$admin.oh_fuse_switch fs " +
//             ",sw$admin.oh_fuse_switch_unit fsu " +
//             ", sw$admin.feeder_head f " +
//             "where  fs.id = fsu.oh_fuse_switch_id " +
//             "and fs.feeder_head_id = f.id " +
//             "and fsu.status not in ('Removed','Proposed Install') " +
//             "and fsu.fuse_type in ('TS2') " +
//             "group by (substr(f.district_code,1,1) || f.feeder_number) " +
//             ") " +
//             "group by fdr";
//     oracledb.getConnection({ user: config.oracleAmsUser, password: config.oracleAmsPassword, connectString: config.oracleAmsConnectString }, function (err, conn) {
//         if (err) {
//             console.error(err.message);
//             return;
//         }
//         //console.log('Loading ALS data...');
//         conn.execute(qry, [], { maxRows: 10000, outFormat: oracledb.OBJECT }, function (err, result) {
//             if (err) {
//                 console.error(err.message);
//             }
//             else {
//                 orclCache.als = [];
//                 orclCache.als = result.rows;
//                 //console.log('Loaded ' + orclCache.als.length + ' ALS');
//             }
//             conn.release(function (err) {
//                 if (err)
//                     console.error(err.message);
//             });
//         });
//     });
// };
var loadFeederTickets = function (fdr) {
    return new Promise(function (resolve, reject) {
        var dt = new Date().getFullYear() + '-01-01T00:00:00.000';
        var qry = {
            "FDR_NUM": parseInt(fdr),
            "TCKT_CRTE_DTTM": {
                "$gte": new Date(dt)
            }
        };
        var proj = {"TRBL_TCKT_NUM": 1, "TCKT_CRTE_DTTM": 1, "IRPT_CAUS_CODE": 1, "TCKT_TYPE_CODE": 1, "IRPT_CAUS_DS": 1};
        exports.mongo.collection('NextGrid_Tickets').find(qry, proj).toArray(function (err, docs) {
            if (err) {
                console.log('Tickets error:' + err);
                reject({ "error": "Tickets data not found." });
            }
            else {
                resolve(docs);
            }

        });
    });
};
// var loadPSC = function () {
//     if (moment().hour() >= 0 && moment().hour() < 6)
//         return;
//
//     oracledb.getConnection({ user: config.oracleDwUser, password: config.oracleDwPassword, connectString: config.oracleDwConnectString }, function (err, conn) {
//         if (err) {
//             console.error('DW connect error: ' + err.message);
//             return;
//         }
//         var sql = "SELECT DISTINCT FDR_NUM, part.FULL_NAME " +
//         "FROM psdwdm.premise p " +
//         "JOIN psdwdm.premise_facts pf ON p.prem_key = pf.prem_key " +
//         "JOIN psdwdm.device d ON pf.xfrm_dvc_key = d.dvc_key " +
//         "JOIN psdwdm.dpdc_part part ON p.cust_acct_num = part.accountnum " +
//         "WHERE p.crnt_row_flag = 'Y' " +
//         "AND pf.crnt_row_flag = 'Y' " +
//         "AND d.crnt_row_flag = 'Y' " +
//         "AND part.accountnum <> '0' " +
//         "ORDER BY 1";
//         //console.log('Loading PSC data...');
//         conn.execute(sql, [], { outFormat: oracledb.OBJECT, maxRows : 50000 }, function (err, result) {
//             if (err) {
//                 console.error('DW SQL error: ' + err.message);
//             }
//
//             orclCache.psc = [];
//             orclCache.psc = _.countBy(result.rows, function (item) {
//                 return item.FDR_NUM;
//             })
//             _.pairs();
//             //console.log(moment().format('MMMM Do YYYY, h:mm:ss a').toString() + ' Loaded ' + Object.keys(orclCache.psc).length + ' PSC');
//
//             conn.release(function (err) {
//                 if (err)
//                     console.error(err.message);
//             });
//         });
//     });
// };
// var loadCFCI = function () {
//     return new Promise(function (resolve, reject) {
//         var request = new sql.Request(exports.connDPDCSQL);
//         request.execute('dbo.cfci_counts', function (err, recordset, returnValue) {
//             if (err) {
//                 console.log(err.message);
//                 reject(err);
//             }
//             else
//                 resolve(recordset[0]);
//         });
//     });
// };
// var findALS = function (fdr) {
//     for (var i = 0, len = orclCache.als.length; i < len; i++) {
//         if (orclCache.als[i].FDR == fdr)
//             return orclCache.als[i].TRIPSAVER2;
//     }
//     return 0;
// };
// var findCFCI = function (cfci, fdr) {
//     for (var i = 0, len = cfci.length; i < len; i++) {
//         if (cfci[i].NM_FEEDER == fdr)
//             return cfci[i];
//     }
//     return null;
// };
app.get('*', function(req, res){
    console.log('404 error: ' + req.url);
    res.status(404).send('This is not the page you are looking for<br>/nextGrid.html is no longer needed. Bigfoot was here.....');
});
var init = function () {
    //.log("Environment = " + process.env.NODE_ENV);
    if (!config.cluster || !cluster.isMaster) {
        dbconn.mongoConnect().then(function (data) {
            console.log("MongoDB " + data.s.databaseName + " OK");
            exports.mongo = data;

                dbconn.sqlConnect().then(function (data) {
                    exports.connDPDCSQL = data;
                    console.log('SQL Server OK');

                });
        })
            .then(function () {
                exports.mongo.collection('metadata').find({}).sort({"sub":1}).toArray(function(err, docs) {
                    if (err){
                        console.log('metadata fail: ' + err);
                    }
                    else {
                        cache.metadata = docs;
                        console.log('Cached ' + docs.length + ' documents for /metadata');
                        polyMARouter.cache();
                        subLocRouter.cache();
                        //subLocRouter.cacheFeeders();
                        fpl.cacheFpl();
                    }
                });
            });
    }
    // Delaying these so it's not querying everytime we restart to test something
    // and radomizing it so not all clusters query the db at the same time
    // setTimeout(function () {
    //     loadPSC();
    //     loadALS();
    // }, 1000 * 60 * _.random(10, 20));

}();
// start server
if (config.cluster && cluster.isMaster) {
    var numWorkers = config.threadLimit || os.cpus().length;

    console.log('NextGrid cluster setting up ' + numWorkers + ' workers...');
    for (var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function (worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
}
else {
    var server = app.listen(config.NEXTGRID_WEBSERVER_PORT, function () {
        console.log('NextGrid is running at http://%s:%s', os.hostname(), server.address().port);
    });
}

// stop server
process.on("SIGINT", function () {
    
    try {
        if (exports.connDPDCSQL) {
            console.log("Closing SQL Server connection.");
            exports.connDPDCSQL.close();
        }
        if (exports.mongo) {
            console.log("Closing MongoDB connection.");
            exports.mongo.close();
        }
    }
    catch (e) {
        //console.log(e.message);
    }
    finally {
        process.exit(0);
    }    
});