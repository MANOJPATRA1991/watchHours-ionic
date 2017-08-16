var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Show = require('../models/shows');
var User = require('../models/users');

var Verify = require('./verify');

var subscription = express.Router();

subscription.use(bodyParser.json());

// subscribe a user to a show
subscription.route('/subscribe')
    .post(Verify.verifyOrdinaryUser, function(req, res, next){
        Show.findById(req.body.showId, function(err, show) {
            if (err) return next(err);
            var index = show.subscribers.indexOf(req.body.uid);
            if (index <= -1){
                show.subscribers.push(req.body.uid);
            }else{
                show.subscribers.splice(index, 1);
            }
            show.save(function(err) {
                if (err) return next(err);
                res.json({data: true});
            });
        });
    });

subscription.route('/watchlist')
    .post(Verify.verifyOrdinaryUser, function(req, res, next){
        Show.findById(req.body.showId, function(err, show) {
            if (err) return next(err);
            var index = show.watchList.indexOf(req.body.uid);
            if (index <= -1){
                show.watchList.push(req.body.uid);
            }else{
                show.watchList.splice(index, 1);
            }
            show.save(function(err) {
                if (err) return next(err);
                res.json({data: true});
            });
        });
    });


subscription.route('/favorites')
    .post(Verify.verifyOrdinaryUser, function(req, res, next){
        Show.findById(req.body.showId, function(err, show) {
            if (err) return next(err);
            var index = show.favorites.indexOf(req.body.uid);
            if (index <= -1){
                show.favorites.push(req.body.uid);
            }else{
                show.favorites.splice(index, 1);
            }
            show.save(function(err) {
                if (err) return next(err);
                res.json({data: true});
            });
        });
    });

module.exports = subscription;