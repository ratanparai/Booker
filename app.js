var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// redis
var redis = require('redis');
global.pub = redis.createClient();
var rClinet = redis.createClient();


var ExpressSession = require('express-session');
var connectRedis = require('connect-redis');
var RedisStore = connectRedis(ExpressSession);
var rClient = redis.createClient();
var sessionStore = new RedisStore({client: rClient});

var session = ExpressSession({
    store: sessionStore,
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
});


var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/Booker")



var routes = require('./routes/index');


var book = require('./routes/book');
var books = require('./routes/books');
var api = require('./routes/api');
var author = require('./routes/author');

var moment = require('moment');

var app = express();

var http = require('http');
var server = http.createServer(app);
var io = require("socket.io").listen(server);
server.listen(8056);


// for processing dashboad document
dashSub = redis.createClient();
dashSub.subscribe('dashboard');

var Dashboard = require('./models/dashboard');

dashSub.on('message', (channel, message) => {
  console.log("receiving data from dashboad channel...");
  console.log(message);
  var msg = JSON.parse(message);
  // 
  //Dashboard.findOneAndUpdate({})
  // if add 
  if (typeof msg.add !== 'undefined') {
    // add entry
    
    var newDashboard = new Dashboard({
      type : msg.add.type,
      user_id: msg.add.user_id,
      book_id : msg.add.book_id,
      update_on : new Date()
    });
    
    newDashboard.save((err) => {
      if (err) console.dir(err);
    });
    
  } else {
    // remove entry
    Dashboard.remove({type:msg.remove.type, user_id : msg.remove.user_id, book_id: msg.remove.book_id}, (err) => {
      if (err) console.dir(err);
    });
  }
  
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// session
app.use(session);
app.use(express.static(path.join(__dirname, 'public')));

var sharedsession = require("express-socket.io-session");

io.use(sharedsession(session, {
    autoSave:true
})); 

io.on('connection', function(socket){
  console.log(io.engine.clientsCount + " client connected.");
  global.socket = socket;
  
  //subscription
  var sub = redis.createClient();
  
  // search result
  sub.subscribe('session.'+socket.handshake.session.id);
  
  // subscription for user's own dashboard activty update
  if (typeof socket.handshake.session.userid !== 'undefined') {
    sub.subscribe(socket.handshake.session.userid);
  }
  
  
  if(socket.handshake.session.followers && socket.handshake.session.followers.length !== 0){
    console.log("subscribing.. to " + socket.handshake.session.followers);
    sub.subscribe(socket.handshake.session.followers);
  }
  
  socket.on("author profile register", (msg) => {
    console.log("Registering to author profile page");
    sub.subscribe("author."+msg);
  });
  
  
  
  
  sub.on("message", function(channel, message){
    //console.dir(message);
    var msg = JSON.parse(message);
    console.log("Receiving  content.");
    //console.dir(message);
    
    if(typeof msg.search !== 'undefined'){
      //console.log(msg.search);
      socket.emit("new book in search", msg.search);
    } else if (typeof msg.profile_pic_update !== 'undefined') {
        console.log("Profile picture update.");
        socket.emit('refresh profile page', msg.profile_pic_update);
    } else if(typeof msg.startReading !== 'undefined') {
        if (channle === socket.handshake.session.userid) {
          
        } else {
          socket.emit('notification', msg.startReading);
        }
        console.log(msg.startReading);
        
    } else if (typeof msg.authorProfile !== 'undefined') {
        socket.emit("author profile new book", msg.authorProfile);
    }else if (typeof msg.read !== 'undefined'){
        if (channel === socket.handshake.session.userid) {
            socket.emit('dashboard own read', msg.read);
        } else {
            msg.read.date = moment(msg.read.date).calendar();
            
            socket.emit('read notification', msg.read);
            socket.emit("dashboard network read", msg.read);
        }
        
        console.log("emiting dashboard read");
        
        
    } else if (typeof msg.review !== 'undefined'){
        
        if (channel === socket.handshake.session.userid) {
          msg.review.update_on = moment(msg.review.update_on).calendar();
          socket.emit('dashboard activity review', msg.review);
        } else {
          msg.review.update_on = moment(msg.review.update_on).calendar();
        
          socket.emit('review notification', msg.review);
          socket.emit('dashboard network review', msg.review);
        }
        console.log("emiting review...");
        
        
        
        
    } else if (typeof msg.startReadingNewBook !== 'undefined') {
        // reading new book
        // dashboard add 
        
        // check if its user's own activty or his friends 
        if (channel === socket.handshake.session.userid) {
          msg.startReadingNewBook.last_update = moment(msg.startReadingNewBook.last_update).calendar();
          socket.emit('dashboard own new book', msg.startReadingNewBook);
        } else {
          msg.startReadingNewBook.last_update = moment(msg.startReadingNewBook.last_update).calendar();
          socket.emit('dashboard reading new book', msg.startReadingNewBook);
        }

    } else {
      
      if (channel === socket.handshake.session.userid) {
        
      } else {
        console.log("Message "+ msg + " on channel " + channel+ " arived");
        socket.emit('notification', {data: msg});
      }
    }
    
    
  });
  
  socket.on('disconnect', function(){
    console.log(io.engine.clientsCount + " client after disconnecct.");
    sub.quit();
  });
  
});

// middleware for subscribing to user channels for notification
// app.use(function (req, res, next) {
//   console.log("middlware for subscribing...");
//   if(req.session.followers) {
//     console.log("start subscribing to " + req.session.followers);
//     sub.subscribe(req.session.followers);
//     console.log("subscribe to " + req.session.followers);
//   }
//   next();
// });

app.use('/', routes);

var users = require('./routes/users');
app.use('/users', users);

var search = require('./routes/search');
app.use('/search', search);

app.use('/book', book);
app.use('/author', author);

app.use('/books', books);

app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

/**
 * Error handlers for API request
 */
app.use('/api', function(err, req, res, next){
    res.status(err.status || 500);
    res.json({message : err.message});
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      loginInfo : {}
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




console.log('server running at port 3000!');

module.exports = app;
