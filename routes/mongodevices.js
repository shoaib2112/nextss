/**
 * Created by CXS0W3K on 10/28/2016.
 */
'use strict';
var nextGrid = require('../nextGrid.js');
var express = require('express');
var devicesRouter = express.Router();
devicesRouter.get('/', function (req, res) {
    res.json({message: 'extendedIds needs /substation/fdr'});
});
devicesRouter.get('/extendedids/:substation/:fdr*?', function (req, res){
    var qry = {

    };

    if (req.params.substation)
        qry['geoJSON.properties.substation'] = req.params.substation;

    if(req.params.fdr)
        qry['geoJSON.properties.feederNum'] = req.params.fdr;

    qry['geoJSON.properties.fplClass'] = 'fault_indicator';

    nextGrid.mongo.collection('NextGrid_RecentVertices').find(qry).toArray(function(err, docs) {
        if (err) {
            console.log('Error in /devices/extendedids/' + err);
            res.json({"error": err});
        }
        else if (docs.length === 0)
            res.json({"error": "No extendedIds found."});
        else
            res.json(docs);

    });


});
module.exports = devicesRouter;