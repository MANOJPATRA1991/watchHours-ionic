var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var TVDB = require('node-tvdb');
var async = require('async');
var _ = require('lodash');

var Actor = require('../models/actors');

var Verify = require('./verify');

var actorsRouter = express.Router();

actorsRouter.use(bodyParser.json());
var BASE_IMAGE_URL = "https://thetvdb.com/banners/";

actorsRouter.route('/:seriesId')
    .get(function(req, res, next){
        // /?seriesId=
        var seriesId = req.params.seriesId;
        var actors = [];
        if (seriesId) {
            // find all actors for a particular series id
            actors = Actor.find().where({seriesId: seriesId});
        }

        // execute the query actors.find()
        actors.find().exec(function(err, actors) {
            // if any error exist, move to the next middleware function
            if (err) next(err);
            // write result to the response as json
            res.json(actors);
        });
    });

actorsRouter.route('/')
    .post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
        // the tmdb api key for my account
        var apiKey = '5BB799C77561B167';

        // create a new TVDB instance
        var tvdb = new TVDB(apiKey);

        var seriesImdbId = req.body.IMDB;

        // get series by IMDB ID
        tvdb.getSeriesByImdbId(seriesImdbId)
            .then(response => {
            // retrieve series id from the returned data
            // and search for series data from TVDB
            tvdb.getActors(response[0].id)
            .then(response => {
            var actors = response;
        _.each(actors, function(data) {
            console.log(data.id);
            var actor = new Actor({
                _id: data.id,
                image: BASE_IMAGE_URL + data.image,
                name: data.name,
                role: data.role,
                seriesId: data.seriesId
            });

            Actor.create(actor, function(err, newActor){
                if(err){
                    if (err) {
                        if (err.code == 11000) {
                            console.log('Actor already exists');
                            return res.status(409).end('Actor already exists!');
                        }
                        next(err);
                    }
                }
                console.log('Actor created!');
                var id = newActor._id;
            });
        });
    })
    .catch(error => {next(error);})
})
.catch(error => {next(error);});
});



module.exports = actorsRouter;