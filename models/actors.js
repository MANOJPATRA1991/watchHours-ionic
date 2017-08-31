var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Actor = new Schema({
    _id: Number,
    image: String,
    name: String,
    role: String,
    seriesId: Number
});

var Actor = mongoose.model('Actor', Actor);
module.exports = Actor;