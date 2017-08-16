var express = require('express');
var cors = require('cors');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var TVDB = require('node-tvdb');
var async = require('async');
var mongoose = require('mongoose');
//set up passport
var passport = require('passport');
var config = require('./config');
//require authenticate.js file
var authenticate = require('./authenticate');


mongoose.connect(config.mongoUrl);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
    //we're connected
    console.log("Connected correctly to the server");
});


var index = require('./routes/index');
var users = require('./routes/users');
var showRouter = require('./routes/showRouter');
var episodeRouter = require('./routes/episodeRouter');
var actorsRouter = require('./routes/actorsRouter');
var posterRouter = require('./routes/posterRouter');
var subscription = require('./routes/subscription');
var app = express();

//Secure traffic only
app.all('*', function(req, res, next){
   if (req.get('X-Forwarded-Proto')=='https' || req.hostname == '192.168.43.161') {
        //Serve Angular App by passing control to the next middleware
        next();
    } else if(req.get('X-Forwarded-Proto')!='https' && req.get('X-Forwarded-Port')!='443'){
        //Redirect if not HTTP with original request URL
        res.redirect('https://' + req.hostname + req.url);
    }
});



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

//passport config
//middleware required to initialize passport
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, 'www')));


// define routes
app.use('/', index);
app.use('/users', users);
app.use('/shows', showRouter);
app.use('/episodes', episodeRouter);
app.use('/actors', actorsRouter)
app.use('/posters', posterRouter);
app.use('/subscription', subscription);
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;