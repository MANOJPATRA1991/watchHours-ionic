var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var TVDB = require('node-tvdb');
var async = require('async');
var _ = require('lodash');

var Show = require('../models/shows');
var Episode = require('../models/episodes');
var Verify = require('./verify');

var showRouter = express.Router();

showRouter.use(bodyParser.json());
var BASE_IMAGE_URL = "https://thetvdb.com/banners/";

var agenda = require('agenda')({ db: { address: 'mongodb://MANOJ_PATRA:MAN#1991@ds145138.mlab.com:45138/watchours' } });
var sugar = require('sugar');
var nodemailer = require('nodemailer');

agenda.define('send email show alert', function(job, done) {
  Show.findOne({ name: job.attrs.data }).populate('subscribers').exec(function(err, show) {
    var emails = show.subscribers.map(function(user) {
        return user.email;
    });
    var episodes = Episode.find().where({seriesId: show._id}).sort('airedSeason airedEpisodeNumber'); 

    var upcomingEpisode = episodes.filter(function(episode) {
      return new Date(episode.firstAired) > new Date();
    })[0];

    var transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: { user: 'SENDGRID_USER_ID', pass: 'SENDGRID_PASSWORD' }
    });

    var mailOptions = {
      from: 'Manoj Patra 👻 <patra.manoj0@gmail.com>',
      to: emails.join(','),
      subject: show.seriesName + ' is starting soon!',
      text: show.seriesName + ' starts in less than 2 hours on ' + show.network + '.\n\n' +
      'Episode ' + upcomingEpisode.airedEpisodeNumber + ' Overview\n\n' + upcomingEpisode.overview
    };

    transporter.sendMail(mailOptions, function(error, response) {
        if(error){
            next(error);
          }
        console.log('Message sent: ' + response.message);
        done();
    });
  });
});

//agenda.start();

agenda.on('start', function(job) {
  console.log("Job %s starting", job.attrs.name);
});

agenda.on('complete', function(job) {
  console.log("Job %s finished", job.attrs.name);
});

showRouter.route('/')
    .get(function(req, res, next){
        // save a reference to all the docs in Show database
        var query = Show.find();
        var show = [];
        // /?genre=
        if (req.query.genre) {
            // find by genre and sort by rating in ascending order
            show = query.where({genre: req.query.genre}).sort({rating: 1}); 
        }
        // /?alphabet= 
        else if (req.query.alphabet) {
            // find all shows starting with alphabet and sort by rating in ascending order
            show = query.where({ seriesName: new RegExp('^' + '[' + req.query.alphabet + ']', 'i') }).sort({rating: 1});
        } 
        // if no query parameters are present
        else {
            // find all and sort by rating in ascending order
            show = query.sort({rating: 1});
        }
        // execute the query show.find()
        show.find().exec(function(err, shows) {
            // if any error exist, move to the next middleware function
            if (err) next(err);
            // write result to the response as json
            res.json(shows);
        });
    })

    .post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
        // the tmdb api key for my account
        var apiKey = '5BB799C77561B167';
        var maxVal = function(arr){
            return Math.max.apply(Math,arr.map(function(o){return o.ratingsInfo.average;}))
        }
        // create a new TVDB instance
        var tvdb = new TVDB(apiKey);

        var seriesImdbId = req.body.IMDB;

        // get series by IMDB ID
        tvdb.getSeriesByImdbId(seriesImdbId)
        .then(response => {
            // retrieve series id from the returned data
            // and search for series data from TVDB
            tvdb.getSeriesAllById(response[0].id)
            .then(response => {
                console.log(response.seriesName);
                // create new Show object
                var show = new Show({
                    _id: response.id,
                    seriesName: response.seriesName,
                    airsDayOfWeek: response.airsDayOfWeek,
                    airsTime: response.airsTime,
                    firstAired: response.firstAired,
                    genre: response.genre,
                    network: response.network,
                    overview: response.overview,
                    rating: response.siteRating,
                    ratingCount: response.siteRatingCount,
                    status: response.status,
                    banner: BASE_IMAGE_URL + response.banner,
                    poster: "",
                    subscribers: [],
                    watchList: [],
                    favorites: []
                });

                tvdb.getSeriesPosters(response.id)
                .then(response => {
                    show.poster = BASE_IMAGE_URL + response[0].fileName;
                    Show.create(show, function(err, newShow){
                        if(err){
                            if (err) {
                                if (err.code == 11000) {
                                    console.log('Show already exists');
                                    return res.status(409).end('Show already exists!');
                                }
                                next(err);
                                var alertDate = Sugar.Date.create('Next ' + show.airsDayOfWeek + ' at ' + show.airsTime).rewind({ hour: 2});
                                agenda.schedule(alertDate, 'send email show alert', show.seriesName).repeatEvery('1 week');
                            }
                        }
                        console.log('Show created!');
                        var id = newShow._id;
                    });
                })
                .catch(error => {next(error);});
            })
            .catch(error => {next(error);})
        })
        .catch(error => {next(error);});
    })

showRouter.route('/:id')
    .get(function(req, res, next) {
        Show.findById(req.params.id, function(err, show) {
            if (err) next(err);
            res.json(show);
        });
    });

module.exports = showRouter;