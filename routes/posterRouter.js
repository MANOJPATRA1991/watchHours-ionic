var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var TVDB = require('node-tvdb');
var async = require('async');
var _ = require('lodash');

var Poster = require('../models/posters');

var Verify = require('./verify');

var posterRouter = express.Router();

posterRouter.use(bodyParser.json());
var BASE_IMAGE_URL = "https://thetvdb.com/banners/";

posterRouter.route('/:seriesId')
    .get(function(req, res, next){
        // /?seriesId=
        var seriesId = req.params.seriesId;
        var posters = [];
        if (seriesId) {
            // find all posters for a particular series id
            posters = Poster.find().where({seriesId: seriesId}); 
        }

        // execute the query posters.find()
        posters.find().exec(function(err, posters) {
            // if any error exist, move to the next middleware function
            if (err) next(err);
            // write result to the response as json
            res.json(posters);
        });
    });

posterRouter.route('/')
    .post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
        // the tmdb api key for my account
        var apiKey = 'TVDB_API_KEY';
        
        // create a new TVDB instance
        var tvdb = new TVDB(apiKey);

        var seriesImdbId = req.body.IMDB;

        // get series by IMDB ID
        tvdb.getSeriesByImdbId(seriesImdbId)
        .then(response => {
            // retrieve series id from the returned data
            // and search for series data from TVDB
            tvdb.getSeriesFanArts(response[0].id)
            .then(response => {
                var posters = response;
                _.each(posters, function(data) {
                    console.log(data.id);
                    var poster = new Poster({
                        _id: data.id,
                        poster: BASE_IMAGE_URL + data.fileName,
                        seriesId: data.fileName.match(/\/([0-9]{6})/g).toString().substr(1)
                    });

                    Poster.create(poster, function(err, newPoster){
                        if(err){
                            if (err) {
                                if (err.code == 11000) {
                                    console.log('Poster already exists');
                                    return res.status(409).end('Poster already exists!');
                                }
                                next(err);
                            }
                        }
                        console.log('Poster created!');
                        var id = newPoster._id;
                    });
                });
            })
            .catch(error => {next(error);})
            })
        .catch(error => {next(error);});
    });
    


module.exports = posterRouter;