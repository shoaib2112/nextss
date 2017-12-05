var express = require('express');
var faultRouter = express.Router();
var sql = require('mssql');
var nextGrid = require('../nextGrid.js');
var _ = require('underscore');

faultRouter.get('/', function (req, res){
    res.json({message: 'this is the fault API'});
});

// faultMaps gets all faults for a date range and location (ma, sc, sub, or feeder)
// then it gets all segments for the fault
// first query varies depending on the type of location specified
// second query loops for each fault id and adds the segments for the fault
// we have to wait until those queries are complete before returning the results
faultRouter.get('/maps', function(req, res){
    var to = "'" + req.query.to.replace("\'", "").replace("\'", "") + " 23:59:59.999'";
    var qs = "SELECT distinct f.id, feederNumber, DATEADD(hour, 0, faultDate) as faultDate, parentId, f.faultInformation," +
        " f.faultInformation_APhase as faultA, f.faultInformation_BPhase as faultB, f.faultInformation_CPhase as faultC," +
        " CASE f.faultType WHEN 1 THEN 'Breaker' WHEN 2 THEN 'AFS' WHEN 3 THEN 'TS2' WHEN 4 THEN 'FCI' END faultType," +
        " f.faultToConsider_LineToGround, f.faultToConsider_LineToLineToGround, f.faultToConsider_LineToLine, f.faultToConsider_ThreePhase," +
        " dbo.tbl_uni_stations.name as sub, dbo.tbl_UNI_management_areas.name as ma, dbo.tbl_UNI_service_center.service_center as sc" +
        " FROM [Distribution].[dnaf].[fault_synergee] f" +
        " LEFT JOIN [Distribution].[dnaf].[fault_synergeeSection] s ON s.faultId = f.id" +
        " JOIN dbo.tbl_uni_feeders feed on feed.feeder_num = feederNumber" +
        " JOIN dbo.tbl_uni_stations ON dbo.tbl_uni_stations.id = feed.id_station" +
        " JOIN dbo.tbl_UNI_management_areas ON dbo.tbl_UNI_management_areas.id = dbo.tbl_uni_stations.id_ma" +
        " JOIN dbo.tbl_UNI_service_center ON dbo.tbl_UNI_service_center.id = dbo.tbl_uni_stations.id_service_center" +
        " WHERE s.id IS NOT NULL AND DATEADD(hour, 0, faultDate) > " + req.query.from + " AND DATEADD(hour, 0, faultDate) < " + to;

    if (req.query.type === 'ma') {
        qs += " AND dbo.tbl_UNI_management_areas.name = '" + req.query.value +"' ORDER BY feederNumber, faultDate DESC";
    }
    else if (req.query.type === 'sc'){
        qs += " AND dbo.tbl_UNI_service_center.service_center = '" + req.query.value +"' ORDER BY feederNumber, faultDate DESC";
    }
    else if (req.query.type === 'sub'){
        qs += " AND dbo.tbl_uni_stations.name = '" + req.query.value.replace('_', ' ') + "' ORDER BY feederNumber, faultDate DESC";
    }
    else if (req.query.type === 'feeder'){
        qs = "SELECT distinct f.id, feederNumber, DATEADD(hour, 0, faultDate) as faultDate, parentId, f.faultInformation," +
            " f.faultInformation_APhase as faultA, f.faultInformation_BPhase as faultB, f.faultInformation_CPhase as faultC," +
            " CASE f.faultType WHEN 1 THEN 'Breaker' WHEN 2 THEN 'AFS' WHEN 3 THEN 'TS2' WHEN 4 THEN 'FCI' END faultType," +
            " f.faultToConsider_LineToGround, f.faultToConsider_LineToLineToGround, f.faultToConsider_LineToLine, f.faultToConsider_ThreePhase" +
            " FROM [Distribution].[dnaf].[fault_synergee] f" +
            " LEFT JOIN [Distribution].[dnaf].[fault_synergeeSection] s ON s.faultId = f.id" +
            " WHERE s.id IS NOT NULL AND DATEADD(hour, 5, faultDate) > " + req.query.from +
            " AND DATEADD(hour, 0, faultDate) < " + to + " AND feederNumber = " + req.query.value + " ORDER BY faultDate DESC";
    }
    else{
        console.log("bad type: " + req.query.type);
        res.json({"error": "bad type: " + req.query.type});
    }

    var request = new sql.Request(nextGrid.connDPDCSQL);
    request.query(qs, function(err, recordset) {
        if (err){
            console.log('SQL Server query: ' + qs + ' error: ' + err);
            res.json({"error": "faultMaps get failed"});
        }
        var counter = recordset.length;
        var lastParent = null;
        var newFaults = [];
        var r2 = null;
        var q = null;
        var devices = [];
        //console.log('=============== ' + req.query.value + ': ' + counter + ' recs =============================');

        if (counter === 0){
            console.log('SQL Server query: ' + qs + ' error: no records');
            res.json({"error": "No fault maps for that date."});
            return;
        }
        _.forEach(recordset, function(fault) {
            //console.log('fault ' + fault.id);
            fault = fixRecord(fault);

            if (fault.parentId === null){     // this is the regular case
                fault.devices = [];
                fault.devices.push({type:fault.faultType, info:fault.faultInformation});
                fault.segments = [];
                r2 = new sql.Request(nextGrid.connDPDCSQL);
                q = "SELECT sectionId, suggestedColor as color, latitudeFrom as f0, longitudeFrom as f1, latitudeTo as t0, longitudeTo as t1 " +
                    "FROM Distribution.dnaf.fault_synergeeSection WHERE faultId = " + fault.id;
                r2.query(q, function(err, rs) {
                    if (err)
                        console.log('error ' + err + ' on ' + fault.id);
                    else {
                        _.forEach(rs, function (seg) {
                            fault.segments.push({
                                sect: seg.sectionId,
                                color: seg.color,
                                points: [[seg.f0, seg.f1], [seg.t0, seg.t1]]
                            });
                        });
                        newFaults.push(fault);
                        if (--counter === 0){
                            res.json(newFaults);
                        }
                    }
                })
            }
            else if (fault.parentId !== lastParent){
                // this is the multiple-fault case. find the faults with the same parent and do all the segments on first encounter.

                lastParent = fault.parentId;
                fault.devices = [];
                fault.segments = [];
                devices = [];
                devices.push({type:fault.faultType, info:fault.faultInformation});
                console.log(fault.id + ' first of many for ' + fault.parentId + ': ' + devices[0].type);
                r2 = new sql.Request(nextGrid.connDPDCSQL);
                q = "SELECT sectionId, suggestedColor as color, latitudeFrom as f0, longitudeFrom as f1, latitudeTo as t0, longitudeTo as t1 FROM Distribution.dnaf.fault_synergeeSection" +
                    " WHERE faultId IN (SELECT id FROM Distribution.dnaf.fault_synergee WHERE parentId = " + fault.parentId + ") ORDER BY sectionId";
                r2.query(q, function(err, rs) {
                    if (err){
                        console.log('error ' + err + ' on ' + fault.parentId);
                    }
                    else {
                        var lastSeg = {sectionId: null};
                        var segColor;
                        _.forEach(rs, function (seg) {
                            // fix color by downgrading one class if its single and upgrading one if its multiple
                            // May need to count the faults, kind of assuming it is 2-3 for now
                            if (seg.sectionId === lastSeg.sectionId)
                                switch(seg.color){
                                    case 'Yellow': break;
                                    case 'Orange': lastSeg.color += 1; break;
                                    case 'Red': lastSeg.color += 2;
                                }
                            else {
                                pushColor(fault, lastSeg);
                                lastSeg = seg;
                                switch(seg.color){
                                    case 'Yellow': lastSeg.color = 0; break;
                                    case 'Orange': lastSeg.color = 1; break;
                                    case 'Red': lastSeg.color = 2; break;
                                    default: lastSeg.color = 0;
                                }
                            }
                        });
                        pushColor(fault, lastSeg);
                        fault.devices = devices;
                        //console.log(fault.id + ' has devices: ' + fault.devices)
                        newFaults.push(fault);
                        if (--counter === 0)
                            {res.json(newFaults);}
                    }
                });
            }
            else{
                // this is the multiple fault case with subsequent faults on a parent which we have already handled above
                devices.push({type:fault.faultType, info:fault.faultInformation});
                if (--counter === 0)
                    {res.json(newFaults);}
            }
        })
    })
});

pushColor = function(fault, lastSeg) {
    var colorList = ['None', 'Yellow', 'Orange', 'Red'];
    if (lastSeg.sectionId === null)
        return;

    if (lastSeg.color >= colorList.length){
        fault.segments.push({
            sect: lastSeg.sectionId,
            color: 'Red',
            points: [[lastSeg.f0, lastSeg.f1], [lastSeg.t0, lastSeg.t1]]
        });
    }
    else if (lastSeg.color !== 0){
        fault.segments.push({
            sect: lastSeg.sectionId,
            color: colorList[lastSeg.color],
            points: [[lastSeg.f0, lastSeg.f1], [lastSeg.t0, lastSeg.t1]]
        });
    }
};

fixRecord = function(fault) {
    // For AFS, trim the switch ID
    // translate bools to a code for faultType2
    if (fault.faultType === 'AFS')
        fault.faultInformation = fault.faultInformation.substr(6);

    if (fault.faultToConsider_LineToGround && fault.faultToConsider_LineToLineToGround && fault.faultToConsider_LineToLine && fault.faultToConsider_ThreePhase)
        fault.faultType2 = 'ALL';
    else if (fault.faultToConsider_LineToGround)
        fault.faultType2 = 'LTG';
    else if (fault.faultToConsider_LineToLineToGround)
        fault.faultType2 = 'LLG';
    else if (fault.faultToConsider_LineToLine)
        fault.faultType2 = 'LTL';
    else if (fault.faultToConsider_ThreePhase)
        fault.faultType2 = '3P';
    else
        fault.faultType2 = 'XXX';

    return fault;
};

module.exports = faultRouter;