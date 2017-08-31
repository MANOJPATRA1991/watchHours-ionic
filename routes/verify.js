var User = require('../models/users');
var jwt = require('jsonwebtoken'); //used to create, sign, and verify tokens
var fs = require('fs');
var cert = fs.readFileSync(__dirname+'/private.key'); //get private key
var config = require('../config.js');
exports.getToken = function(user){
    // sign with RSA SHA 256
    // returns the JSONWebToken as a string
    return jwt.sign(user, cert, {
        expiresIn: 3600
        // algorithm: 'RS256'
    });
};

exports.verifyOrdinaryUser = function(req, res, next){
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks expiry
        // Callback passed the payload decoded if the signature are valid. If not, it will be passed the error.
        jwt.verify(token, cert, function (err, decoded) {
            if (err) {
                var err = new Error('You are not authenticated!');
                err.status = 401;
                return next(err);
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token
        // return an error
        var err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
};

exports.verifyAdmin = function(req, res, next){
    // to access the decoded properties of the req object use req.decoded._doc
    if(!req.decoded){
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    } else {
        var id = req.decoded._id;

        if(!req.decoded.admin){
            var err = new Error('You are not authenticated to perform this operation!');
            err.status = 403;
            return next(err);
        } else
            next();
    }
};