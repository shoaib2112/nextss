var express = require('express');
var amiRouter = express.Router();
var pg = require('pg');

amiRouter.get('/', function (req, res){
    res.json({message: 'this is the ami API'});
});

amiRouter.get('/meters', function(req, res){
    var pgConnectionString = process.env.DATABASE_URL || 'postgres://pdapps_app_user:Hphis!6bq@goxgpm01.fpl.com:5432/fpl';
    var docs = [];
    console.log(req.query.dateFrom, req.query.dateTo, req.query.fplID);
    pg.connect(pgConnectionString, function(err, client, done) {
        if (err) {
            pg.end();
            console.log('pg fail: ' + err);
            return res.json({"error": "pg not found"});
        }
        var q = client.query("SELECT ami.meter_pit_read_fact.read_time, round(ami.METER_PIT_READ_FACT.MRDG,0)" +
            " FROM ami.METER_PIT_READ_FACT, ami.premise_meter" +
            " WHERE ami.premise_meter.ami_dvc_name = ami.METER_PIT_READ_FACT.ami_dvc_name" +
            " AND ami.premise_meter.efct_strt_date <= ami.meter_pit_read_fact.read_time" +
            " AND ami.premise_meter.efct_end_date > ami.meter_pit_read_fact.read_time" +
            " AND ami.METER_PIT_READ_FACT.UIQ_CHNL_NUM = 3" +
            " AND ami.METER_PIT_READ_FACT.READ_TYPE = 'RI'" +
            " AND ami.meter_pit_read_fact.read_time >= '" + req.query.dateFrom + "'::timestamp with time zone" +
            " AND ami.meter_pit_read_fact.read_time < '" + req.query.dateTo + "'::timestamp with time zone" +
            " AND ami.premise_meter.FPL_ID = " + req.query.fplID);
        console.log(q);
        q.on('row', function (row) {
            docs.push(row);
        });
        q.on('end', function () {
            pg.end();
            return res.json(docs);
        });
    })
});

module.exports = amiRouter;