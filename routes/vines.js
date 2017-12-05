var express = require('express');
var vinesRouter = express.Router();
var sql = require('mssql');
var nextGrid = require('../nextGrid.js');
//var sqlCn = require('../nextGrid.js').connDPDCSQL;
var _ = require('underscore');

vinesRouter.get('/', function (req, res){
    var request = new sql.Request(nextGrid.connDPDCSQL);
    var q = _.template("SELECT em.id as mid, ema.id as aid, comments, ema.latitude, ema.longitude, binaryDataId, [from], ticketDate, ticketNumber, ticketStatus, em.sentDate," +
        " emand.id, uma.name as ma, usc.service_center as sc, s.name as sub, emand.feederNumber as feeder, emand.fplid, emand.ddb " +
        " FROM condition.emailMessageAttachment ema" +
        " JOIN condition.emailMessage em ON em.id = ema.emailMessageId" +
        " LEFT OUTER JOIN condition.emailMessageAttachmentNearestDevice emand ON emand.emailMessageAttachmentId = ema.id" +
        " LEFT JOIN dbo.tbl_UNI_stations s on s.id = emand.subStationId" +
        " LEFT JOIN dbo.tbl_UNI_service_center usc on usc.id = emand.serviceCenterId" +
        " LEFT JOIN dbo.tbl_UNI_management_areas uma on uma.id = emand.managementAreaId" +
        " WHERE ema.latitude IS NOT NULL AND ema.longitude IS NOT NULL AND ema.binaryDataId IS NOT NULL AND emand.ddb > '0'" +
        " AND em.sentDate >= <%=from%> AND em.sentDate <= <%=to%> AND mailType = 'Vines'");
    var qx = q({from: req.query.from, to: req.query.to});
    if (req.query.type === 'ma') {
        qx += " AND uma.name = '" + req.query.value +"' ORDER BY mid DESC";
    }
    else if (req.query.type === 'sc'){
        qx += " AND usc.service_center = '" + req.query.value +"' ORDER BY mid DESC";
    }
    else if (req.query.type === 'sub'){
        qx += " AND s.name = '" + req.query.value +"' ORDER BY mid DESC";
    }
    else if (req.query.type === 'feeder')
        qx += " AND emand.feederNumber = '" + req.query.value +"' ORDER BY mid DESC";
    else{
        console.log("bad type: " + req.query.type);
        res.json({"error": "bad type: " + req.query.type});
    }
    //console.log(qx);
    request.query(qx, function(err, recordset) {
        if (err){
            console.log('SQL Server query: ' + qx + ' error: ' + err);
            res.json({"error": "vines get failed"});
        }
        else
            res.json(recordset);
    });
});

vinesRouter.put('/', function(req, res){
    var request = new sql.Request(nextGrid.connDPDCSQL);
    var q = _.template('UPDATE condition.emailMessageAttachment ' +
        'SET ticketNumber = <%=num%>, comments = \'<%=com%>\', ticketDate = <%=dt%>, ticketStatus = \'<%=act%>\' ' +
        'WHERE condition.emailMessageAttachment.id = <%=id%>');
    var qx = q({num: req.query.number, act: req.query.action, com: req.query.comm, dt: req.query.tdate, id: req.query.aid});
    //console.log(qx);
    request.query(qx, function(err, recordset) {
        if (err){
            console.log('SQL Server query: ' + qx + ' error: ' + err);
            res.json({"error": "vines put failed"});
        }
        res.json(recordset);
    });
});

module.exports = vinesRouter;