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

app.get('/resources/teams', function(req, res) {
  db.Team.find({}, function(err, matches) {
    if(!err) {
      res.json(matches);
    }
    else {
      res.send('ERROR: '+ err.message);
    }
  });
});

app.get('/partials/:name', function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
});

// redirect all others to the index
app.get('*', function(req, res){
  res.render('index');
});

var numMatches = Math.floor(Math.random()*10000);
//model
var currentMatch = {
  id: NaN,
  matchRunning: false,
  redAlliance: {
    teams: [],
    score: NaN,
    fouls: NaN
  },
  blueAlliance: {
    teams: [],
    score: NaN,
    fouls: NaN
  }
};

/* SOCKET.IO EVENTS */
io.sockets.on('connection', function(socket) {
  console.log('connected to socket '+ socket.id);

  /* MATCH */

  //called from match input page for everything
  //broadcasts match:init
  //emits match:confirm-init
  socket.on('match:init', function(data) {
    // if correctly saves teams to database, then broadcast
    var saveData = {
      redAlliance: data.red,
      blueAlliance: data.blue
    };

    db.createMatch(++numMatches, saveData, function(err) {
      if(!err) {
        console.log('emitting');
        socket.broadcast.emit('match:init', {red: data.red, blue: data.blue});
        //allows master to move to match page
        socket.emit('match:confirm-init'); 

        //update model
        currentMatch.redAlliance = {
          teams: data.red,
          score: 0,
          fouls: 0
        };
        currentMatch.blueAlliance = {
          teams: data.blue,
          score: 0,
          fouls: 0
        };
        currentMatch.matchRunning = true;
      }
      else {
        console.error('error with saving initialized match and teams');
        socket.emit('match:error-init', {err: err});
      }
    });
  });

  socket.on('match:getMatchInfo', function() {
    socket.emit('match:receiveMatchInfo', {redAlliance: currentMatch.redAlliance, blueAlliance: currentMatch.blueAlliance});
  })

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
    //figure out new qualScores
    //new win/loss/tie records

    console.log(data);

    var saveData = {
      redScore: data.redAlliance.score,
      redFouls: data.redAlliance.fouls,
      blueScore: data.blueAlliance.score,
      blueFouls: data.blueAlliance.fouls
    };

    db.finishMatch(numMatches, saveData, function(err) {
      if(!err) {
        //allows master to switch back to input
        //public sees final score
        socket.broadcast.emit('match:recorded', {redScore: data.redAlliance.score, blueScore: data.blueAlliance.score});
        socket.emit('match:recorded', {redScore: data.redAlliance.score, blueScore: data.blueAlliance.score});

        //update model
        currentMatch.redAlliance = {
          teams: [],
          score: NaN,
          fouls: NaN
        };
        currentMatch.blueAlliance = {
          teams: [],
          score: NaN,
          fouls: NaN
        };
        currentMatch.matchRunning = false;
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

    currentMatch[data.color+'Alliance'].score += data.scoreChange;
    if(data.type === 'fouls') {
      //negative scoreChange = positive foul count
      currentMatch[data.color+'Alliance'].fouls += (data.scoreChange < 0)? 1 : -1;
    }
  });
});


/**
 * Start Server
 */

server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
