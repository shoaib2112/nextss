'use strict';
var moment = require('moment');
var async = require('async');
var _ = require('lodash');
var express = require('express');
var tcktModule = require('../lib/ticketModule');
var fplModule = require('../lib/fplModule');
var utils = require('../lib/utils');
var nextGrid = require('../nextGrid.js');
var mitRouter = express.Router();

mitRouter.post('/', function (req, res) {
    var ObjectID = require('mongodb').ObjectID;
    var fltr = {_id: new ObjectID(req.body._id)};

    // strip out primary key and convert date
    var obj = _.omit(req.body, ['_id']);
    obj.lastUpdated = new Date(obj.lastUpdated);
    nextGrid.mongo.collection('NextGrid_Momentaries')
        .findOneAndUpdate(fltr, {"$set": obj}, function (err, doc) {
            if (err) {
                console.log('Error in /momentaries' + err);
                res.json({"error": err});
            }
            else {
                res.json(doc);
            }
        });
});
mitRouter.get('/:type/:filter', function (req, res) {
    var qry = {
        "BKR_OPEN_DTTM" : {
            "$gte": new Date(req.query.dtbegin),
            "$lte": new Date(req.query.dtend + ' 11:59:59 PM')
        }
    };

    if (req.params.type === 'sub')
        qry.SUBSTN_NAME = req.params.filter.toUpperCase();
    else
        qry.FDR_NUM = req.params.filter;

    nextGrid.mongo.collection('NextGrid_Momentaries')
        .find(qry)
        .sort({ "BKR_OPEN_DTTM": 1 }).toArray(function(err, docs) {
        if (err) {
            console.log('Error in /momentaries' + err);
            res.json({"error": err});
        }
        else if (docs.length === 0)
            res.json({"error": "No momentaries found."});
        else
            res.json(docs);

    });

});
mitRouter.get('/aggregates_by_type', function (req, res) {
    var momentaries = {
        MAs: {},
        Substations: {},
        Feeders: {}
    };
    var dtDay1ofYr = moment().startOf('year').toDate();
    var dtDay1of12MOE = moment().subtract(1, 'year').startOf('day').toDate();
    var dtEnd = moment().subtract(1, 'days').endOf('day').toDate();

    // Basically 18 queries returned in 1 object: known momentaries labelled by ticket, user, lightning. Grouped by MA,
    // Sub, Feeder
    knownAggregate().then(function (data) {
            res.json(momentaries);
        })
        .catch(function (error) {
            console.log('Mongo aggregate error: ' + error.message);
        });

    function knownAggregate() {
        return new Promise(function (resolve, reject) {
            async.parallel({
                    MAs: function (callback) {
                        var ma = {
                            ticket: {},
                            user: {},
                            lightning: {}
                        };

                        // Using lodash to merge datasets and flatten out the object
                        // tt = trouble ticket, lit = lightning
                        getKnownMomentaries('MA', 'ytd', dtDay1ofYr, dtEnd, 'tt').then(function (data) {
                            ma.ticket.ytd = data;
                            getKnownMomentaries('MA', 'twelvemoe', dtDay1of12MOE, dtEnd, 'tt').then(function (data) {
                                ma.ticket.twelvemoe = data;
                                //ma = _.merge(ma.ticket.ytd, ma.ticket.twelvemoe);
                                utils.mergeObjects(ma.ticket.twelvemoe, ma.ticket.ytd);
                                //ma.ticket.merged = _.merge(ma.ticket.ytd, ma.ticket.twelvemoe);
                                //momentaries.MAs.tickets = _.merge(ma.ticket.ytd, ma.ticket.twelvemoe);
                                getKnownMomentaries('MA', 'ytd', dtDay1ofYr, dtEnd, 'user').then(function (data) {
                                    //momentaries.MAs.user = {};
                                    ma.user.ytd = data;
                                    getKnownMomentaries('MA', 'twelvemoe', dtDay1of12MOE, dtEnd, 'user').then(function (data) {
                                        ma.user.twelvemoe = data;
                                        utils.mergeObjects(ma.user.twelvemoe, ma.user.ytd);
                                        //var usr = _.merge(ma.user.ytd,  ma.user.twelvemoe);

                                        //ma.ticket.merged = _.merge(ma.ticket.merged,  usr);
                                        //momentaries.MAs.user = _.merge(ma.user.ytd,  ma.user.twelvemoe);
                                        getKnownMomentaries('MA', 'ytd', dtDay1ofYr, dtEnd, 'lit').then(function (data) {
                                            ma.lightning.ytd = data;
                                            getKnownMomentaries('MA', 'twelvemoe', dtDay1of12MOE, dtEnd, 'lit').then(function (data) {
                                                ma.lightning.twelvemoe = data;
                                                utils.mergeObjects(ma.lightning.twelvemoe, ma.lightning.ytd);

                                                utils.mergeObjects(ma.ticket.twelvemoe, ma.user.twelvemoe);
                                                utils.mergeObjects(ma.ticket.twelvemoe, ma.lightning.twelvemoe);
                                                momentaries.MAs = ma.ticket.twelvemoe;
                                                //var lght = _.merge(ma.lightning.ytd,  ma.lightning.twelvemoe);

                                                //ma.ticket.merged = _.merge(ma.ticket.merged,  lght);
                                                //momentaries.MAs = _.merge(ma.ticket.merged,  lght);
                                                //momentaries.MAs.lightning = _.merge(ma.lightning.ytd,  ma.lightning.twelvemoe);
                                                callback();

                                            });
                                        });
                                    });
                                });
                            });
                        });

                    },
                    SUBs: function (callback) {
                        var subs = {
                            ticket: {},
                            user: {},
                            lightning: {}
                        };

                        getKnownMomentaries('Substation', 'ytd', dtDay1ofYr, dtEnd, 'tt').then(function (data) {
                            subs.ticket.ytd = data;
                            getKnownMomentaries('Substation', 'twelvemoe', dtDay1of12MOE, dtEnd, 'tt').then(function (data) {
                                subs.ticket.twelvemoe = data;
                                utils.mergeObjects(subs.ticket.twelvemoe, subs.ticket.ytd);
                                //subs.ticket.merged = _.merge(subs.ticket.ytd,  subs.ticket.twelvemoe);
                                //momentaries.Substations.ticket = _.merge(subs.ticket.ytd,  subs.ticket.twelvemoe);
                                getKnownMomentaries('Substation', 'ytd', dtDay1ofYr, dtEnd, 'user').then(function (data) {
                                    subs.user.ytd = data;
                                    getKnownMomentaries('Substation', 'twelvemoe', dtDay1of12MOE, dtEnd, 'user').then(function (data) {
                                        subs.user.twelvemoe = data;
                                        utils.mergeObjects(subs.user.twelvemoe, subs.user.ytd);
                                        //var subz = _.merge(subs.user.ytd, subs.user.twelvemoe);
                                        //subs.ticket.merged = _.merge(subs.ticket.merged, subz);
                                        //momentaries.Substations.user = _.merge(subs.user.ytd, subs.user.twelvemoe);
                                        getKnownMomentaries('Substation', 'ytd', dtDay1ofYr, dtEnd, 'lit').then(function (data) {
                                            subs.lightning.ytd = data;
                                            getKnownMomentaries('Substation', 'twelvemoe', dtDay1of12MOE, dtEnd, 'lit').then(function (data) {
                                                subs.lightning.twelvemoe = data;
                                                utils.mergeObjects(subs.lightning.twelvemoe, subs.lightning.ytd);

                                                utils.mergeObjects(subs.ticket.twelvemoe, subs.user.twelvemoe);
                                                utils.mergeObjects(subs.ticket.twelvemoe, subs.lightning.twelvemoe);
                                                //var templight = _.merge(subs.lightning.ytd, subs.lightning.twelvemoe);
                                                //subs.ticket.merged = _.merge(subs.ticket.merged, templight);
                                                momentaries.Substations = subs.ticket.twelvemoe;
                                                //momentaries.Substations = _.merge(subs.ticket.merged, templight);
                                                //momentaries.Substations.lightning = _.merge(subs.lightning.ytd, subs.lightning.twelvemoe);
                                                callback();
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    },
                    Feeders: function (callback) {
                        var fdrs = {
                            ticket: {},
                            user: {},
                            lightning: {}
                        };
                        getKnownMomentaries('Feeder', 'ytd', dtDay1ofYr, dtEnd, 'tt').then(function (data) {
                            fdrs.ticket.ytd = data;
                            getKnownMomentaries('Feeder', 'twelvemoe', dtDay1of12MOE, dtEnd, 'tt').then(function (data) {
                                fdrs.ticket.twelvemoe = data;
                                utils.mergeObjects(fdrs.ticket.twelvemoe, fdrs.ticket.ytd);
                                //fdrs.ticket.merged = _.merge(fdrs.ticket.ytd,  fdrs.ticket.twelvemoe);
                                //momentaries.Feeders.ticket = _.merge(fdrs.ticket.ytd,  fdrs.ticket.twelvemoe);
                                getKnownMomentaries('Feeder', 'ytd', dtDay1ofYr, dtEnd, 'user').then(function (data) {
                                    fdrs.user.ytd = data;
                                    getKnownMomentaries('Feeder', 'twelvemoe', dtDay1of12MOE, dtEnd, 'user').then(function (data) {
                                        fdrs.user.twelvemoe = data;
                                        utils.mergeObjects(fdrs.user.twelvemoe, fdrs.user.ytd);

                                        //var tmpfdr = _.merge(fdrs.user.ytd , fdrs.user.twelvemoe);
                                        //fdrs.ticket.merged = _.merge(fdrs.ticket.merged, tmpfdr);
                                        //momentaries.Feeders.user = _.merge(fdrs.user.ytd , fdrs.user.twelvemoe);
                                        getKnownMomentaries('Feeder', 'ytd', dtDay1ofYr, dtEnd, 'lit').then(function (data) {
                                            fdrs.lightning.ytd = data;
                                            getKnownMomentaries('Feeder', 'twelvemoe', dtDay1of12MOE, dtEnd, 'lit').then(function (data) {
                                                fdrs.lightning.twelvemoe = data;
                                                utils.mergeObjects(fdrs.lightning.twelvemoe, fdrs.lightning.ytd);

                                                utils.mergeObjects(fdrs.ticket.twelvemoe, fdrs.user.twelvemoe);
                                                utils.mergeObjects(fdrs.ticket.twelvemoe, fdrs.lightning.twelvemoe);
                                                momentaries.Feeders = fdrs.ticket.twelvemoe;
                                                //var lght = _.merge(fdrs.lightning.ytd , fdrs.lightning.twelvemoe);
                                                //momentaries.Feeders = _.merge(fdrs.ticket.merged, lght);
                                                //momentaries.Feeders.lightning = _.merge(fdrs.lightning.ytd , fdrs.lightning.twelvemoe);
                                                callback();
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    }
                },
                function (err, results) {
                    resolve(true);

                });
        });
    }
});
mitRouter.get('/aggregates', function (req, res) {
    // grab fpl meta data
    var cache = fplModule.getCache();

    // starting the array of objects with all subs, feeders so we don't have gaps like beginning of the yr
    cache.SubstationsObs = arrayToObjs(cache.subs);
    cache.FeedersObjs = arrayToObjs(cache.feeders);

    var momentaries = {
        MAs: {},
        Substations: cache.SubstationsObs,
        Feeders: cache.FeedersObjs,
        known: {}
    };
    var FeederTickets = {};
    var dtDay1ofYr = moment().startOf('year').toDate();
    var dtDay1of12MOE = moment().subtract(1, 'year').startOf('day').toDate();
    var dtEnd = moment().subtract(1, 'days').endOf('day').toDate();

    // Basically many queries returned in 1 object
    async.parallel({
        moms: function (callback) {
            momAggregate("Unknown")
                .then(function (data) {
                    momAggregate("Known")
                        .then(function (data) {
                             // tcktModule.getFeederTickets()
                             //     .then(function (tix) {
                             //         utils.mergeObjects(momentaries.MAs, tix.MAs);
                             //         utils.mergeObjects(momentaries.Substations, tix.Substations);
                             //         utils.mergeObjects(momentaries.Feeders, tix.Feeders);
                                     callback();
                                 //});
                            //res.json(momentaries);
                        });
                });
        },
        tix: function (callback) {

            tcktModule.getFeederTickets().then(function (tix) {
                 FeederTickets = tix;
                 callback();
            });
        }
    },
    function (err, results) {
        // weave momentaries and YTD Fdr tickets
        utils.mergeObjects(momentaries.MAs, FeederTickets.MAs);
        utils.mergeObjects(momentaries.Substations, FeederTickets.Substations);
        utils.mergeObjects(momentaries.Feeders, FeederTickets.Feeders);
        res.json(momentaries);
    });

    function momAggregate(unknown) {
        return new Promise(function (resolve, reject) {
        async.parallel({
                MAs: function (callback) {
                    var ma = {};

                    getMomentaries('MA', 'ytd', dtDay1ofYr, dtEnd, unknown)
                        .then(function (data) {
                            ma.ytd = data;
                            //if (unknown === "Unknown") ma.ytd = data; else momentaries.known.ma.ytd = data;

                            getMomentaries('MA', 'twelvemoe', dtDay1of12MOE, dtEnd, unknown)
                                .then(function (data) {
                                    ma.twelvemoe = data;
                                    if (unknown === "Unknown") {
                                        //utils.mergeObjects(ma.twelvemoe, ma.ytd);
                                        momentaries.MAs = _.merge(ma.ytd, ma.twelvemoe);
                                    }
                                    else
                                        momentaries.known.MAs = _.merge(ma.ytd, ma.twelvemoe);

                                    callback();
                                });
                        });
                },
                SUBs: function (callback) {
                    var subs = {};

                    getMomentaries('Substation', 'ytd', dtDay1ofYr, dtEnd, unknown)
                        .then(function (data) {
                            subs.ytd = data;

                            getMomentaries('Substation', 'twelvemoe', dtDay1of12MOE, dtEnd, unknown)
                                .then(function (data) {
                                    subs.twelvemoe = data;

                                    // Some subs don't have ytd numbers, so use the 12moe as the master list
                                    // subs.twelvemoe.forEach(function (rec) {
                                    //     rec.YTD = findYTD(rec._id, subs.ytd);
                                    // });

                                    utils.mergeObjects(subs.twelvemoe, subs.ytd);

                                    if (unknown === "Unknown") {
                                        utils.mergeObjects(momentaries.Substations, subs.twelvemoe);
                                        //utils.mergeObjects(momentaries.Substations, subs.ytd);
                                        //utils.mergeObjects(momentaries.Substations, subs.twelvemoe);
                                        //momentaries.Substations = _.merge(momentaries.Substations, subs.twelvemoe);
                                        //momentaries.Substations = subs.twelvemoe;
                                    }
                                    else {
                                        momentaries.known.Substations = subs.twelvemoe;
                                    }
                                    callback();
                                });
                        });
                },
                Feeders: function (callback) {
                    var fdrs = {};

                    getMomentaries('Feeder', 'ytd', dtDay1ofYr, dtEnd, unknown)
                        .then(function (data) {
                            fdrs.ytd = data;

                            getMomentaries('Feeder', 'twelvemoe', dtDay1of12MOE, dtEnd, unknown)
                                .then(function (data) {
                                    fdrs.twelvemoe = data;

                                    // Some fdrs don't have ytd numbers, so use the 12moe as the master list
                                    // fdrs.twelvemoe.forEach(function (rec) {
                                    //     rec.YTD = findYTD(rec._id, fdrs.ytd);
                                    // });
                                    utils.mergeObjects(fdrs.twelvemoe, fdrs.ytd);

                                    if (unknown === "Unknown") {
                                        utils.mergeObjects(momentaries.Feeders, fdrs.twelvemoe);
                                        //momentaries.Feeders = _.merge(momentaries.Feeders, fdrs.twelvemoe);
                                        //momentaries.Feeders = fdrs.twelvemoe;
                                    }
                                    else {
                                        momentaries.known.Feeders = fdrs.twelvemoe;
                                    }

                                    callback();
                                });
                        });
                }
            },
            function (err, results) {
                resolve(true);
                //res.json(momentaries);
            });
        });
        }
});
var getKnownMomentaries = function (type, span, begin, end, cause) {
    return new Promise(function (resolve, reject) {
        var grp = {};
        var mtch = {
            "BKR_OPEN_DTTM": {
                $gte: begin,
                $lte: end
            },
            "Status": "Known"
        };

        switch (cause) {
            case "tt":
                // parsing json because of quirk w/ mongodb driver. Using normal js object syntax i got 0 records
                mtch["Ticket.TRBL_TCKT_NUM"] = JSON.parse('{ "$exists": true }');
                break;
            case "user":
                mtch["updatedBy"] = JSON.parse('{ "$type": 2 }');
                break;
            case "lit":
                mtch["Lightning._id"] = JSON.parse('{ "$exists": true }');
                break;
        }

        switch (type) {
            case "MA":
                grp["_id"] = "$MGR_AREA_CODE";
                //grp._id = "$MGR_AREA_CODE";
                break;
            case "Substation":
                grp["_id"] = "$SUBSTN_NAME";
                //grp._id = "$SUBSTN_NAME";
                break;
            case "Feeder":
                grp["_id"] = "$FDR_NUM";
                //grp._id = "$FDR_NUM";
                break;
        }
        if (span === 'ytd') {
            grp[cause + "YTD"] = {$sum: 1};
            //grp.YTD = {$sum: 1};
        }
        else {
            grp[cause + "TwelveMonth"] = {$sum: 1};
            //grp.twelvemoe = {$sum: 1};
        }
        nextGrid.mongo.collection('NextGrid_Momentaries').aggregate(
            [{
                $match:
                mtch
                //      {
                // //     //match
                //       "BKR_OPEN_DTTM": {$gte: begin, $lte: end},
                //       "Status": "Known",
                //          "Ticket.TRBL_TCKT_NUM" : { $exists: true }
                //  }
            },
                {
                    $group: grp
                },
                {
                    $sort: {
                        _id: 1
                    }
                },]).toArray(function (err, docs) {
            if (err) {
                return reject(err);
            }
            else {
                return resolve(docs);
            }

        });
    });
};
/*
app.post('/invreport', function (req, res) { // Data saved to SQL Server; change logged in mongo
    var request = new sql.Request(exports.connDPDCSQL);
    request.input('rid', sql.Int, req.body.rid);
    request.input('comments', sql.NVarChar(sql.MAX), req.body.comments);
    request.input('tln', sql.NVarChar(20), req.body.tln);
    request.input('cause_code', sql.NVarChar(20), req.body.cause_code);
    request.execute('dbo.nextGrid_update_InvReport', function (err, recordset, returnValue) {
        if (err) {
            console.log("Error: " + err);
            return;
        }

        var obj = {
            dateTime: new Date(),
            slid: req.body.slid || '',
            rid: req.body.rid,
            comments: req.body.comments,
            tln: req.body.tln,
            cause_code: req.body.cause_code
        };
        exports.mongo.collection('NextGrid_MITlog').insert(obj, function (err, rec) {
            if (err)
                console.log('MIT log error: ' + err);

            res.json({ message: 'Investigation record updated.' });
        });
    });
}); */
var getMomentaries = function (type, span, begin, end, unknown) {
    return new Promise(function (resolve, reject) {
        var grp = {};
        
        switch (type) {
            case "MA":
                grp._id = "$MGR_AREA_CODE";
                break;
            case "Substation":
                grp._id = "$SUBSTN_NAME";
                break;
            case "Feeder":
                grp._id = "$FDR_NUM";
                break;
        }

        if (span === 'ytd') {
            grp.YTD = {$sum: 1};
        }
        else {
            grp.twelvemoe = {$sum: 1};
        }

        nextGrid.mongo.collection('NextGrid_Momentaries').aggregate(
            [{
                $match: {
                    "BKR_OPEN_DTTM": {$gte: begin, $lte: end},
                    "Status": unknown || "Unknown",
                    "_id": {
                        "$ne": null
                    }
                }
            },
                {
                    $group: grp
                },
                {
                    $sort: {
                        //YTD: -1
                        _id: 1
                    }
                },]).toArray(function (err, docs) {
            if (err)
                return reject(err);
            else
                return resolve(docs);

        });
    });
};
// var findYTD = function (fdr, ytds) {
//     for (var i = 0, len = ytds.length; i < len; i++) {
//         if (fdr === ytds[i]._id)
//             return ytds[i].YTD;
//         // else if (!isNaN(ytds[i]._id) && parseInt(ytds[i]._id) > parseInt(fdr))
//         //     break;
//         else if (ytds[i]._id > fdr)
//             break;
//     }
//     return 0;
// };
var arrayToObjs = function (arr) {
    var objs = [];

    arr.forEach(function(a) {
        var obj = {'_id': a};
        //var obj = {'_id': a.replaceAll('_', ' ')};
        objs.push(obj);
    });
    return objs;
};
module.exports = mitRouter;