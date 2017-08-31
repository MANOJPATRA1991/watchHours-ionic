var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var passportLocalMongoose = require('passport-local-mongoose');
var User = new Schema({
    email: {
        type: String,
        unique: true
    },
    username: {
        type: String,
        unique: true
    },
    password: String,

    OauthId: String,
    OauthToken: String,

    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type:String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    tempToken: {
        type: String
    }
},
{
   timestamps: true
});

//User instance method
User.methods.getName = function(){
    return (this.firstname + ' ' + this.lastname);
}

User.plugin(passportLocalMongoose);

var User = mongoose.model('User', User);
module.exports = User;