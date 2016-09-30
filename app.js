var express       = require('express');
var path          = require('path');
var favicon       = require('serve-favicon');
var logger        = require('morgan');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var session       = require('express-session');

var MongoStore    = require('connect-mongo')(session);
var mongoose      = require('mongoose');
var passport      = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var swaggerJSDoc  = require('swagger-jsdoc');

var api_docs      = require('./routes/api-docs');
var users         = require('./routes/users');

var conf          = require('./config');
var authenticate  = require('./authenticate'); //needed for authentication do not uncomment

//mongoose
mongoose.connect(conf.db.url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var app = express();

// swagger definition
var swaggerDefinition = conf.swagger.definition;
// options for the swagger docs
var options = {
  // import swaggerDefinitions
  swaggerDefinition: swaggerDefinition,
  // path to the API docs
  apis: ['./routes/*.js']
};

// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'pug');
app.engine('html', require('ejs').renderFile);
app.engine('pug', require('pug').__express);
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  cookie: {
    //maxAge: new Date(Date.now() + 3600000)
  },
  secret: conf.db.secret ,
  resave: true,
  saveUninitialized: true,
  store:new MongoStore(conf.db)
}));
app.use(passport.initialize()); // passport config
app.use(express.static(path.join(__dirname, 'public')));

//cross origin accept
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");
  next();
});

app.use('/api-docs', api_docs);
app.use('/users', users);

// serve swagger
app.get('/swagger.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});


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
