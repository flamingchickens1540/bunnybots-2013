'use strict';
/**
 * Module dependencies
 */

var express = require('express'),
  http = require('http'),
  path = require('path');

var db = require('./modules/db.js');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

//db.connect();

/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.json());
app.use(express.favicon());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

app.use(express.favicon());
app.use(express.urlencoded());


app.use(express.static(path.join(__dirname, 'public')));

// development only
if (app.get('env') === 'development') {
  app.use(express.errorHandler());
}

// production only
if (app.get('env') === 'production') {
  // TODO
};

/**
 * Routes
 */

// serve index and view partials
app.get('/', function(req, res) {
  res.render('index', {title:'Bunnybots'});
});

app.get('/partials/:name', function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
});

// redirect all others to the index
app.get('*', function(req, res){
  res.render('index');
});


/* SOCKET.IO EVENTS */
io.sockets.on('connection', function(socket) {
  console.log('connected to socket '+ socket.id);

  /* MATCH */

  //called from match input page for everything
  //broadcasts match:init
  //emits match:confirm-init
  socket.on('match:init', function(data) {
    // if correctly saves teams to database, then broadcast

    db.createMatch(data, function(err) {
      if(!err) {
        socket.broadcast.emit('match:init', {red: data.red, blue: data.blue});
        //allows master to move to macth page
        socket.emit('match:confirm-init'); 
      }
      else 
        console.error('error with saving initialized match and teams')
    });
    
    //else return an error
  });

  //called by master match view for public match view
  //broadcasts match:tick
  socket.on('match:tick', function(data) {
    //sends the match:tick event to all sockets except the current socket
    socket.broadcast.emit('match:tick', data /*{percentCompleted: data.percentCompleted, timeLeft: data.timeLeft }*/);
  });

  //from master --> public views
  //broadcasts match:end
  socket.on('match:end', function(data) {
    socket.broadcast.emit('match:end');
  });

  socket.on('match:reset', function() {
    socket.broadcast.emit('match:reset');
  });

  //broadcasts match:recorded
  socket.on('match:submit', function(data) {
    db.finishMatch(data, function(err) {
      if(!err) {
        //allows master to switch back to input
        //public sees final score
        socket.broadcast.emit('match:recorded', {redScore: data.redAlliance.score, blueScore: data.blueAlliance.score});
      }
      else {
        console.error('Match data not submitted and saved properly');
      }
    });
  });

  //realtime
  //from referee --> match_views, other referees
  //broadcasts referee:input
  socket.on('referee:input', function(data) {
    socket.broadcast.emit('referee:input', data);
  });

});


/**
 * Start Server
 */

server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
