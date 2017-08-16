var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    comment:  {
        type: String,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

var Episode = new Schema({
    _id: Number,
    airedEpisodeNumber: Number,
    airedSeason: Number,
    director: String,
    episodeName: String,
    episodeImage: String,
    firstAired: Date,
    guestStars: [
      String
    ],
    overview: String,
    seriesId: Number,
    writers: [
      String
    ],
    comments:[commentSchema]
});

var Episode = mongoose.model('Episode', Episode);
module.exports = Episode;