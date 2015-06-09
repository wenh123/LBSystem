var express = require('express');
var multer  = require('multer');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var api = require('./routes/api');
var data = require('./routes/data');

var app = express();

var COOKIE_SECRET = 'secret';
var COOKIE_NAME = 'sid';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.sessionStore = new MongoStore({
      url: 'mongodb://localhost:27017/sign?maxPoolSize=1'
    })
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ dest: './uploads/'}));
app.use(cookieParser(COOKIE_SECRET));

app.use(
  session({
    name: COOKIE_NAME,
    secret: COOKIE_SECRET,
    store: app.sessionStore,
    cookie: {
        path: '/',
        httpOnly: false,
        secure: false,
        maxAge: null
    }
  })
)

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname+'/views'));

app.use('/', routes);
app.use('/api', api);
app.use('/data', data);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
