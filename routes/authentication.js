var express = require('express'),
authRouter = express.Router(),
config = require('../config.js'),
 _ = require('underscore'),
nextGrid = require('../nextGrid.js');    ;

authRouter.get('/users', function (req, res) {

    nextGrid.mongo.collection('users').find().sort({"lname": 1}).toArray(function(err, docs) {
        if (err){
            console.log('Error in /authentication/users' + err);
            res.json({"error": err});
        }
        else
            res.json(docs);
    });

});

authRouter.get('/groups/:slid', function (req, res) {

    var qry = {slid: String(req.params.slid).toUpperCase()};
    nextGrid.mongo.collection('users').find(qry).limit(1).toArray(function(err, docs) {
        if (err){
            console.log('Error in /authentication/groups/slid :' + err);
            res.json({"error": err});
        }
        else if (docs.length === 0)
            res.json({"error": "User not found."});
        else
            res.json(docs);
    });

});

authRouter.post('/', function (req, res) {
    var ActiveDirectory = require('activedirectory');
    
    var con = {
        url: config.activeDirectory.url,
        baseDN: 'dc=fplnt,dc=com',
        //slid: req.body.slid + '@' + config.activeDirectory.grpdomain,
        slid: req.body.slid + '@' + config.activeDirectory.domain,
        password: req.body.password
    };

    var payload = {
        authenticated: null,
        message: null
    };

    var ad = new ActiveDirectory(con);
    ad.authenticate(con.slid, con.password, function (err, auth) {
        if (err) {
            console.log('ERROR: ' + JSON.stringify(err));
            payload.authenticated = false;
            payload.message = 'Authentication failed!';
            res.json(payload);            
        }
        else if (auth) {
            //console.log(con.slid + ' Authenticated!');
            payload.authenticated = true;
            payload.message = con.slid + ' Authenticated!';
            res.json(payload);
        }
    }); 

});
module.exports = authRouter;