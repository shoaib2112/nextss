/**
 * Created by AJH0e3s on 5/3/2017.
 */
var express = require('express');
var _ = require('lodash');
var subLocRouter = express.Router();
var config = require('../config.js');
var nextGrid = require('../nextGrid.js');
//AJH for substation locations... probably wrong

var cache = {
    subs: [],
    feeders: []
};
subLocRouter.get('/feederLookup', function(req, res){
    res.json(cache.feeders);
});
subLocRouter.cacheFeeders = function () {
    var fdrs = [];
    var qry = {
        "geoJSON.properties.fplClass": "feeder_head"
    };
    nextGrid.mongo.collection('NextGrid_RecentVertices')
        .find(qry)
        .sort({"geoJSON.properties.managementArea": 1, "geoJSON.properties.substation": 1}).toArray(function(err, docs) {
        if (err){
            console.log('feederLookup error: ' + err);

        }
        else {
            docs.forEach(function (d) {
                var obj = {};
                if (_.find(fdrs, function(o) { return o.feederNum === d.geoJSON.properties.feederNum; })) {
                    console.log('Duplicate ' + d.geoJSON.properties.feederNum); //+ JSON.stringify(d)); //  d.geoJSON.properties.feederNum);
                }
                else {
                    obj.managementArea = d.geoJSON.properties.managementArea;
                    obj.substation = d.geoJSON.properties.substation;
                    obj.feederNum = d.geoJSON.properties.feederNum;
                    fdrs.push(obj);
                }
            });
            cache.feeders = fdrs;
            console.log('Cached ' + cache.feeders.length + ' documents for /feederLookup.');
        }
    });
};
subLocRouter.cache = function () {
    var q = {"fplClass":"feeder_head"};
    nextGrid.mongo.collection('assets_refresh').find(q).toArray(function(err, docs) {
        if (err){
            console.log('Substation Location error: ' + err);
        }
        else if (docs.length === 0)
            console.log("No Substation Locations found.");
        else {
            var array=[];
            docs.forEach(function(doc){
                if(!isObjectInArrayByProp(doc, array,'sub')){
                    var subLoc = {sub: doc.sub, points: doc.points};
                    array.push(subLoc);
                }
            });
            cache.subs = array;
            console.log('Cached ' + cache.subs.length + ' documents for /sublocation.');
        }
    });
};
subLocRouter.get('/', function(req, res){
    res.json(cache.subs);
    // var q = {"fplClass":"feeder_head"};
    // // var q = {"sub":{"$in":[]},"fplClass":"feeder_head"};
    // // q.sub.$in =["LANTANA","ACREAGE","ACME"];
    //
    // nextGrid.mongo.collection('assets_refresh').find(q).toArray(function(err, docs) {
    //     if (err){
    //         console.log('Substation Location error: ' + err);
    //         res.json({"error": "Substation Location database not found"});
    //     }
    //     else if (docs.length === 0)
    //         res.json({"error": "No Substation Locations found " });
    //     else {
    //         var array=[];
    //        docs.forEach(function(doc){
    //            if(!isObjectInArrayByProp(doc, array,'sub')){
    //                var subLoc = {sub: doc.sub, points: doc.points};
    //                array.push(subLoc);
    //            }
    //        });
    //         res.json(array);
    //     }
    // });
});

module.exports = subLocRouter;

function isObjectInArrayByProp(obj,array,prop){
    var count=0;
    array.forEach(function(item){
        if(obj[prop]== item[prop]){count++}
    });
    if(count===0){
        return false
    }else{
        return true
    }
}