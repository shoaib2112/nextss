var express = require('express'),
imgRouter = express.Router(),
config = require('../config.js'),
nextGrid = require('../nextGrid.js');    ;

imgRouter.get('/img/:id', function (req, res) {
    var qry = {_id: req.params.id};

});

imgRouter.post('/', function (req, res) {

});
module.exports = imgRouter;