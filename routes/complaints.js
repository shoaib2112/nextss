/**
 * Created by CXS0W3K on 2/27/2017.
 *
 * Customer Complaints
 */
'use strict';
var express = require('express');
var complRouter = express.Router();
var moment = require('moment');
var config = require('../config.js');
var nextGrid = require('../nextGrid.js');

complRouter.get("/", function (req, res) {
    var qry = {
        "inquiryDate" : {
            "$gte": moment().subtract(1, 'year').startOf('day').toDate()
        }
    };
    if (req.query.ma)
        qry.ma = req.query.ma.toUpperCase();
    if (req.query.feeder) {
        qry.feederNum = {
            "$in": req.query.feeder.split(",")
        }
    }

    nextGrid.mongo.collection('NextGrid_Complaints')
        .find(qry, {"_id": 0, "SRV_AREA_KEY": 0, "DW_TCKT_KEY": 0, "BU_NAME": 0, "XFRM_DVC_KEY": 0})
        .sort({"inquiryDate": -1})
        .toArray(function (err, docs) {

            if (err) {
                console.log('Complaints error:' + err);
                res.json({ "error": "Complaints data not found." });
            }
            else {
                res.json(docs)
            }
    });

});
module.exports = complRouter;