var express = require('express');
var monRouter = express.Router();
var sql = require('mssql');
var sqlCn = require('../nextGrid').sqlCn;
var _ = require('underscore');

// For DTS programs error messages are normally in this crazy SQL table with millions of rows, we will get the most recent of each
// Then we will get the knownAgent table. For other C# programs the error messages are here (which is better)
// We should fix the transfer programs to clean this mess up
monRouter.get('/', function(req, res) {
    var msgHash = {};
    var msgObj = {};
    var request2 = new sql.Request(sqlCn);
    var q2 = "SELECT T.agentId, T.createDate, T.errorMessage FROM transferAgent.agentTransferHistory T " +
        "JOIN (SELECT agentID, Max(CreateDate) MaxDate FROM transferAgent.agentTransferHistory " +
        "WHERE agentId in (SELECT distinct id FROM transferAgent.knownAgent) GROUP BY agentId) S " +
        "ON T.agentId = S.agentId and T.createDate = S.MaxDate ORDER BY agentId";
    request2.query(q2, function(err, recordset) {
        if (err)
            console.log('SQL Server query: ' + q2 + ' error: ' + err);
        else
            _.forEach(recordset, function(msg) {
                msgHash[msg.agentId] = {msg: msg.errorMessage, date: msg.createDate}
            });
        var request = new sql.Request(sqlCn);
        var q = "SELECT id, name, lastRunTime, hostName, message, tech, description, tablesUpdated, sourceDbFiles, sourceTables, dbFileType " +
            "FROM transferAgent.knownAgent WHERE isActive != 0 AND tech != 'Java' ORDER BY id";
        request.query(q, function(err, recordset) {
            if (err){
                console.log('SQL Server query: ' + q + ' error: ' + err);
                res.json({"error": "monitor get failed"});
            }
            else{
                _.forEach(recordset, function(rec) {
                    if (rec.tech == 'DTS'){
                        msgObj = msgHash[rec.id];
                        if (msgObj != null)
                            rec.message = msgObj.msg;
                    }
                    if (rec.message === null || rec.message == ' ' || rec.message.toLowerCase() === 'ok')
                        rec.message = '';
                    if (rec.id < 10)
                        rec.id = 'C0' + rec.id;
                    else
                        rec.id = 'C' + rec.id;
                });
                res.json(recordset);
            }
        });
    });
});

// For Java programs there is not much we can do but list them
monRouter.get('/j', function(req, res) {
    var request = new sql.Request(sqlCn);
    var q = "SELECT id, tx_application_name, ts_check_date, tx_notes, running_on_server FROM dbo.tbl_UNI_applications_health_monitor WHERE fl_active = 'True' ORDER BY id";
    request.query(q, function(err, recordset) {
        if (err){
            console.log('SQL Server query: ' + q + ' error: ' + err);
            res.json({"error": "monitor get/j failed"});
        }
        else{
            _.forEach(recordset, function(rec) {
                if (rec.id < 10)
                    rec.id = 'J00' + rec.id;
                else if (rec.id > 99)
                    rec.id = 'J' + rec.id;
                else
                    rec.id = 'J0' + rec.id;
            });
            res.json(recordset);
        }
    });
});

module.exports = monRouter;