var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Poster = new Schema({
    _id: Number,
    poster: String,
    seriesId: Number
});

var Poster = mongoose.model('Poster', Poster);
module.exports = Poster;