
var createError = require('http-errors');
var bodyParser=require('body-parser');
var bcrypt = require('bcryptjs');
var session=require('express-session');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var mongoose=require('mongoose');
var logger = require('morgan');
var MongoStore = require('connect-mongodb-session')(session);
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost/smsapp', { promiseLibrary: require('bluebird') })
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));
var db = mongoose.connection;
//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
});

app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use( express.static( "public" ) );

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

//use sessions for tracking logins


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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



app.listen(3000,function(req,res){

  console.log("server started!!!");
});

module.exports = app;
