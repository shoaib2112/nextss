var express = require('express');
var User = require("../models/user.js");
var userRouter = express.Router();
require("../lib/utils.js");

userRouter.get('/', function (req, res){
    res.json({message: 'this is the admin API'});
});

userRouter.route('/users')
    .post(function(req, res) {
        var user = new User();
        mapRequestToModel(user, req);
        user.save(function(err) {
            if (err)
                handleError(req, res, err);
            else
                res.json({message: 'User created'});
        });
    })

    .get(function(req, res) {
        User.find(function(err, users) {
            if (err)
                handleError(req, res, err);
            else
                res.json(users);
        });
    });

userRouter.route('/users/:id')
    .get(function(req, res) {
        User.findById(req.params.id, function(err, user) {
            if (err)
                handleError(req, res, err);
            else
                res.json(user);
        });
    })

    .put(function(req, res) {
        User.findById(req.params.id, function(err, user) {
            if (err) res.send(err);
            mapRequestToModel(user, req);
            user.save(function(err) {
                if (err)
                    handleError(req, res, err);
                else
                    res.json({message: 'User updated'});
            });
        });
    })

    .delete(function(req, res) {
        User.remove({_id: req.params.id}, function(err, user) {
            if (err)
                handleError(req, res, err);
            else
                res.json({message: 'User deleted'});
        });
    });

module.exports = userRouter;