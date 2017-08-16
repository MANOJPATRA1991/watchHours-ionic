var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var TVDB = require('node-tvdb');
var async = require('async');
var _ = require('lodash');

var Show = require('../models/shows');
var Episode = require('../models/episodes');

var Verify = require('./verify');

const episodeRouter = express.Router();

episodeRouter.use(bodyParser.json());


const BASE_IMAGE_URL = "https://thetvdb.com/banners/";

episodeRouter.route('/:seriesId')
    .get((req, res, next) => {
        // /?seriesId=
        const seriesId = req.params.seriesId;
        let episodes = [];
        if (seriesId) {
            // find all episodes for a particular series id
            // exclued episodes with airedSeason equals 0
            // sort first by season, then by episode
            episodes = Episode.find().where({seriesId,
                                    airedSeason: {$gte: 0}}).sort('airedSeason airedEpisodeNumber'); 
        }

        // execute the query episodes.find()
        episodes.find()
            .populate('comments.postedBy')
            .exec((err, episodes) => {
            // if any error exist, move to the next middleware function
            if (err) next(err);
            // write result to the response as json
            res.json(episodes);
        });
    });

episodeRouter.route('/')
    .post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, (req, res, next) => {
        // the tmdb api key for my account
        const apiKey = 'TVDB_API_KEY';
        
        // create a new TVDB instance
        const tvdb = new TVDB(apiKey);

        const seriesImdbId = req.body.IMDB;

        // get series by IMDB ID
        tvdb.getSeriesByImdbId(seriesImdbId)
        .then(response => {
            // retrieve series id from the returned data
            // and search for series data from TVDB
            tvdb.getSeriesAllById(response[0].id)
            .then(response => {
                const episodes = response.episodes;
                // create new Episode objects
                _.each(episodes, episode => {
                    tvdb.getEpisodeById(episode.id)
                    .then(response => {
                        console.log(response.airedSeason, response.airedEpisodeNumber);
                        const episode = new Episode({
                            _id: response.id,
                            airedEpisodeNumber: response.airedEpisodeNumber,
                            airedSeason: response.airedSeason,
                            director: response.director,
                            episodeName: response.episodeName,
                            episodeImage: BASE_IMAGE_URL + response.filename,
                            firstAired: response.firstAired,
                            guestStars: response.guestStars,
                            overview: response.overview,
                            seriesId: response.seriesId,
                            writers: response.writers,
                            comments: []
                        });

                        Episode.create(episode, (err, newEpisode) => {
                            if(err){
                                if (err) {
                                    if (err.code == 11000) {
                                        console.log('Episode already exists');
                                        return res.status(409).end('Episode already exists!');
                                    }
                                    next(err);
                                }
                            }
                            console.log('Episode created!');
                            const id = newEpisode._id;
                        });
                    })
                    .catch(error => {next(error);});
                });
            })
            .catch(error => {next(error);})
            })
        .catch(error => {next(error);});
    });

episodeRouter.route('/')
    .put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, (req, res, next) => {
        // the tmdb api key for my account
        const apiKey = 'TVDB_API_KEY';
        
        // create a new TVDB instance
        const tvdb = new TVDB(apiKey);

        const seriesImdbId = req.body.IMDB;

        // get series by IMDB ID
        tvdb.getSeriesByImdbId(seriesImdbId)
        .then(response => {
            // retrieve series id from the returned data
            // and search for series data from TVDB
            tvdb.getSeriesAllById(response[0].id)
            .then(response => {
                const episodes = response.episodes;
                // create new Episode objects
                _.each(episodes, episode => {
                    tvdb.getEpisodeById(episode.id)
                    .then(response => {
                        Episode.findById(response.id, (err, episode) => {
                            if(err) next(err);
                            
                            episode.airedEpisodeNumber = response.airedEpisodeNumber,
                            episode.airedSeason = response.airedSeason,
                            episode.director = response.director,
                            episode.episodeName = response.episodeName,
                            episode.episodeImage = BASE_IMAGE_URL + response.filename,
                            episode.firstAired = response.firstAired,
                            episode.guestStars = response.guestStars,
                            episode.overview = response.overview,
                            episode.seriesId = response.seriesId,
                            episode.writers = response.writers

                            episode.save((err, episode) => {
                                if (err) next(err);
                                console.log('Updated Episode ' + episode._id + '!');
                            });
                        });
                    })
                    .catch(error => {next(error);});
                });
            })
            .catch(error => {next(error);})
            })
        .catch(error => {next(error);});
    });

episodeRouter.route('/:episodeId/comments')
    .get((req, res, next) => {
        Episode.findById(req.params.episodeId)
            .populate('comments.postedBy')
            .exec((err, episode) => {
                if (err) next(err);
                res.json(episode.comments);
            });
    })

    .post(Verify.verifyOrdinaryUser, (req, res, next) => {
        Episode.findById(req.params.episodeId, (err, episode) => {
            if (err) next(err);

            req.body.postedBy = req.decoded._id;

            episode.comments.push(req.body);
            episode.save((err, episode) => {
                if (err) next(err);
                console.log('Updated Comments!');
                res.json(episode);
            });
        });
    });

episodeRouter.route('/:episodeId/comments/:commentId')
    .get(Verify.verifyOrdinaryUser, (req, res, next) => {
        Episode.findById(req.params.episodeId)
            .populate('comments.postedBy')
            .exec((err, episode) => {
                if (err) next(err);
                res.json(episode.comments.id(req.params.commentId));
            });
    })

    .put(Verify.verifyOrdinaryUser, (req, res, next) => {
        // We delete the existing commment and insert the updated
        // comment as a new comment
        Episode.findById(req.params.episodeId, (err, episode) => {
            if (err) next(err);
            episode.comments.id(req.params.commentId).remove();

            req.body.postedBy = req.decoded._id;

            episode.comments.push(req.body);
            episode.save((err, episode) => {
                if (err) next(err);
                res.json(episode);
            });
        });
    })

    .delete(Verify.verifyOrdinaryUser, (req, res, next) => {
        Episode.findById(req.params.episodeId, (err, episode) => {
            if (err) next(err);
            episode.comments.id(req.params.commentId).remove();
            episode.save((err, resp) => {
                if (err) next(err);
                res.json(resp);
            });
        });
    });

module.exports = episodeRouter;