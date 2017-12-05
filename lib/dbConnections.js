/**
 * Created by CXS0W3K on 4/19/2017.
 */
'use strict';
var sql = require('mssql'),
    MongoClient = require('mongodb').MongoClient,
    // oracledb = require('oracledb'),
    fs = require('fs'),
    config = require('../config.js');

var db = {
    mongoConnect: function () {
        var mongoOptions = null;
        return new Promise(function (resolve, reject) {
            fs.readFile(__dirname.replace('lib', '') + '/cert/Root_only_NEE.CA.pem', function (fserr, cert) {
                if (fserr) {
                    console.log('MongoDB cert error: ' + fserr);
                    throw err;
                }

                var mongoenv = config.mongoEnvironment();

                mongoOptions = {
                    server: {
                        sslValidate: true,
                        checkServerIdentity: true,
                        sslCA: cert,
                        socketOptions: {
                            connectTimeoutMS: 0,
                            socketTimeoutMS: 0
                        }
                    },
                    user: mongoenv.mongoUser,
                    pass: mongoenv.mongoPassword,
                    rejectUnauthorized: false
                };

                console.log('Connecting to\nserver: ' + mongoenv.mongoHost + '\nport: ' + mongoenv.mongoPort + '\ndb: ' + mongoenv.mongoDatabase + '\nuser: ' +  mongoenv.mongoUser + '...');
                MongoClient.connect('mongodb://' + mongoenv.mongoHost + ':' + mongoenv.mongoPort + ','
                    + mongoenv.mongoHost2 + ':' + mongoenv.mongoPort + ','
                    + mongoenv.mongoHost3 + ':' + mongoenv.mongoPort + '/'
                    + mongoenv.mongoDatabase + '?ssl=true', mongoOptions, function (err, database) {
                    if (err) {
                        console.log('MongoDB Prod connection error');
                        reject(err);
                    }

                    database.authenticate(mongoenv.mongoUser, mongoenv.mongoPassword, function (err, res) {
                        if (err) {
                            console.log("MongoDB Prod authentication error");
                            reject(err);
                        }
                        resolve(database);

                    });
                });
            });
        });
    },
    // mongoDemoConnect: function () {
    //
    //     return new Promise(function (resolve, reject) {
    //             fs.readFile(__dirname.replace('lib', '') + '/cert/Root_only_NEE.CA.pem', function (fserr, cert) {
    //                 if (fserr) {
    //                     console.log('MongoDB cert error: ' + fserr);
    //                     throw err;
    //                 }
    //                 var mongodemoOptions = {
    //                     server: {
    //                         sslValidate: true,
    //                         checkServerIdentity: true,
    //                         sslCA: cert
    //                     },
    //                     user: config.mongodemoUser,
    //                     pass: config.mongodemoPassword,
    //                     rejectUnauthorized: true
    //                 };
    //                 MongoClient.connect('mongodb://' + config.mongodemoHost + ':' + config.mongodemoPort + '/' + config.mongodemoDatabase + '?ssl=true', mongodemoOptions, function (err, database) {
    //                     if (err) {
    //                         console.log('MongoDB demo connection error');
    //                         reject(err);
    //                     }
    //
    //                     console.log('MongoDB demo connect');
    //                     // database.authenticate(config.mongodemoUser, config.mongodemoPassword, function (err, res) {
    //                     //     if (err) {
    //                     //         console.log("MongoDB demo authentication error");
    //                     //         reject(err);
    //                     //     }
    //                     resolve(database);
    //
    //                     //});
    //
    //                 });
    //             });
    //     });
    // },
    sqlConnect: function () {   // Newer versions of mssql has breaking changes
        return new Promise(function (resolve, reject) {
            var connection = new sql.Connection(config.sqlprod, function (err) {
                if (err) {
                    console.log('SQL Server connection error');
                    reject(err);
                }
                resolve(connection);
            });
        });

    },
    // dwConnect: function () {
    //     return new Promise(function (resolve, reject) {
    //         oracledb.getConnection(config.oracleDW, function (err, conn) {
    //             if (err) {
    //                 console.log('Oracle DW connection error');
    //                 reject(false);
    //             }
    //             else {
    //                 resolve(conn);
    //             }
    //         });
    //     });
    // }
};
module.exports = db;