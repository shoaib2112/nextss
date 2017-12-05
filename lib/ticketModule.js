'use strict';
var moment = require('moment');
var async = require('async');
var _ = require('lodash');
var nextGrid = require('../nextGrid.js');
var utils = require('./utils');

var tickets = {
    MAs: {},
    Substations: {},
    Feeders: {}
};

// This is a seperate module used by the momentaries route and can be added to
// any other route
var tckt = {
    getFeederTickets: function () {
            return new Promise(function (resolve, reject) {

            var dtDay1ofYr = moment().startOf('year').toDate();
            //var dtDay1of12MOE = moment().subtract(1, 'year').startOf('day').toDate();
            var dtEnd = moment().subtract(1, 'days').endOf('day').toDate();
            //var ma = {};

            // Note - only need YTD feeder tickets for now
            async.parallel({
                    MAs: function (callback) {
                        getTcktAggr('MA', 'ytd', dtDay1ofYr, dtEnd).then(function (data) {
                            //ma.ytd = data;
                            tickets.MAs = data;
                            //getTcktAggr('MA', 'twelvemoe', dtDay1of12MOE, dtEnd).then(function (data) {
                            //    ma.twelvemoe = data;
                                //tickets.MAs = _.merge(ma.ytd, ma.twelvemoe);
                                callback();
                            //});
                        });

                    },
                    SUBs: function (callback) {
                        //var subs = {};

                        getTcktAggr('Substation', 'ytd', dtDay1ofYr, dtEnd).then(function (data) {
                            //subs.ytd = data;
                                // getTcktAggr('Substation', 'twelvemoe', dtDay1of12MOE, dtEnd)
                                //     .then(function (data) {
                                //         subs.twelvemoe = data;
                                //         utils.mergeObjects(subs.twelvemoe, subs.ytd);
                            tickets.Substations = data;
                            //tickets.Substations = subs.twelvemoe;

                            callback();
                                //});
                        });

                    },
                    Feeders: function (callback) {
                        //var fdrs = fdrtickets.Feeders;
                        //var ytd = [];
                        //var twelvemoe = [];
                        getTcktAggr('Feeder', 'ytd', dtDay1ofYr, dtEnd).then(function (data) {

                            // Change feeder num to strings
                            //ytd = formatFdrs(data);
                            tickets.Feeders = formatFdrs(data);
                            // getTcktAggr('Feeder', 'twelvemoe', dtDay1of12MOE, dtEnd).then(function (data) {
                            //     twelvemoe = formatFdrs(data);
                            //
                            //     utils.mergeObjects(twelvemoe, ytd);
                                //utils.mergeObjects(fdrs, twelvemoe);
                                //tickets.Feeders = twelvemoe;

                                callback();
                            //});
                        });
                    }
                },
                function (err, results) {
                    return resolve(tickets);

                });
        });
    }
};
var formatFdrs = function (fdrs) {
    var strFdrs = [];
    fdrs.forEach(function(f) {
        if (f._id !== null) {
            var obj = f;
            obj._id = (obj._id).toString();
            strFdrs.push(obj);
        }
    });
    return fdrs;
};
var getTcktAggr = function (type, span, begin, end, unknown) {
    return new Promise(function (resolve, reject) {
        var grp = {};
        var mtch = {
            "TCKT_CRTE_DTTM": {
                $gte: begin,
                $lte: end
            },
            "TCKT_TYPE_CODE": "FDR"
        };
        switch (type) {
            case "MA":
                grp._id = "$MGR_AREA_CODE";
                break;
            case "Substation":
                grp._id = "$SUBSTATION";
                break;
            case "Feeder":
                grp._id = ("$FDR_NUM").toString();
                break;
        }

        if (span === 'ytd')
            grp.fdrTicketYTD = {$sum: 1};
        else
            grp.fdrTickettwelvemoe = {$sum: 1};

        nextGrid.mongo.collection('NextGrid_Tickets').aggregate(
            [{ $match: mtch },
                { $group: grp },
                { $sort: {
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
module.exports = tckt;