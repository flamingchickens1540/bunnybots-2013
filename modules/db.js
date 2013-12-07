/**********************************************
== Schema ==
Team: tracks team matches, score, and qualScore
(unimplemented) Event: tracks where an event is and the matches that occur. Will be expanded eventually to support multiple events
Match: Tracks match numbers, times (UTC), scores, teams, and fouls

== Functions ==
connect: connects to database 

getTeam: gets an individual team, populates matches (ID, CALLBACK)
getTeams: gets multiple or all teams, populates matches - accepts ([TEAM_IDS] - optional, CALLBACK)
addTeam: creates new team (ID, NAME, CALLBACK)
removeTeam: deletes one team (ID, CALLBACK)
updateTeam: updates one team (ID, UPDATE_OBJ, CALLBACK)

getMatch: gets one match, populates redTeams and blueTeams (ID, CALLBACK)
getMatches: gets all matches, populates redTeams and blueTeams
createMatch: creates a match before the actual match (ID, TEAMS{RED:[],BLUE:[]}, CALLBACK)
finishMatch: enters scoring and foul info (MATCH_ID, MATCH_STATS{FOULS{RED,BLUE},SCORE{RED,BLUE}, TIME_OF_MATCH, CALLBACK)
updateMatch: any other necessary code (MATCH_ID, UPDATE_OBJ, CALLBACK)
removeMatch: removes one match (MATCH_ID, CALLBACK)

to add---
getEvents: for multi-event support
***********************************************/
var mongoose = require('mongoose');
var _ = require('underscore');
var ObjectId = mongoose.Schema.Types.ObjectId;

//Schemas
var teamSchema = new mongoose.Schema({
  _id: String,
  name: String,
	qualScore: Number,
  matches: [Number],
  wins: Number,
  ties: Number,
  losses: Number
});

var matchSchema = new mongoose.Schema({
	_id: Number,
  complete: Boolean,

  redAlliance: [String], //only three teams
	redScore: Number,
	redFouls: Number,

  blueAlliance: [String], //only three teams
	blueScore: Number,
	blueFouls: Number
});

//returns who won
matchSchema.methods.getWinner = function() {
  if(this.redScore > this.blueScore) {
    return 'red';
  }
  else if(this.blueScore > this.redScore) {
    return 'blue';
  }  
  else {
    return 'tie';
  }
};

matchSchema.methods.getTeamAlliance = function(teamId) {
  if(_.contains(this.redTeams, teamId)) {
    return 'red';
  }
  else if(_.contains(this.blueTeams, teamId)) {
    return 'blue';
  }
  else {
    return null;
  }
};

//Models
var Team = mongoose.model('Team', teamSchema);
var Match = mongoose.model('Match', matchSchema);

//callback takes err as argument
var dbConnect = function dbConnect(dbName, callback) {
  mongoose.connect('localhost', (dbName || 'bunnybots2013test'));
    
  if(callback && _.isFunction(callback)) {
    callback(null);
  }
  else {
    return true;
  }
};

dbConnect();


// TEAMS
var dbCreateTeam = function dbCreateTeam(id, name, callback) {
  
  console.log('db#createTeam',id, name);

  //check id type
  if(typeof id !== 'string') {
    console.error('wrong arguments => id: '+ id +', name: '+ name +', callback: '+ callback +'.');
  }
  //check id exists
  if(!id) {
    console.error('tried to create team without an id');
  }
  //check for a function callback
  if(!_.isFunction(callback)) {
    console.error('tried to create team without an id');
    callback = function(e,t){console.log(e,t);};
  }

  var team = new Team;
  //defaults
  team._id = id;
  team.name = name || 'Team '+ id;
  team.matches = [];
  team.qualScore = 0;
  team.wins = 0;
  team.ties = 0;
  team.losses = 0;

  team.save(callback);
};

var dbGetTeam = function dbGetTeam(id, callback) {

  console.log('db#getTeam', id);

  //check id type
  if(typeof id !== 'string') {
    console.error('wrong arguments => id: '+ id +', callback: '+ callback +'.');
  }
  //check id exists
  if(!id) {
    console.error('tried to create team without an id');
  }
  //check for a function callback
  if(!_.isFunction(callback)) {
    console.error('tried to create team without an id');
    callback = function(e,t){console.log(e,t);};
  }

  Team.findOne({_id: id}).exec(callback);
};

//for multiple teams
var dbGetTeams = function dbGetTeams(teamIds, callback) {
    
  console.log('db#getTeams',teamIds);
  var query = Team;

  //default is arrays (multiple teams)
  if(_.isArray(teamIds)) {
    var queryRegExp = new RegExp(teamIds.join('|'));
    query = query.find({_id:queryRegExp}); //queries for all teams in db 
  }
  //all teams
  else if(_.isFunction(teamIds)){
    callback = teamIds;
    query = query.find({});
  }
  //covers error cases
  else {
    query = query.find({});
    callback = function(err, team) {
      if(!err) 
        console.log(team);
      else 
        throw new Error('can not get team '+ id +' from database with current arguments');
    };
  }

  query.exec((callback || function(e,t){console.log(e,t);}));
};

//not rewritten
//what if it isnt there?
var dbRemoveTeam = function dbRemoveTeam(id, callback) {
  if(typeof id !== 'string') {
    console.log('DB REMOVE: id does not work');
  }

  Team.findOneAndRemove({_id: id}, function(err) {
    if(!err) {
      console.log('Team '+ id +' removed!')
    }
    else {
      console.log('Team '+ id +' not removed!')
    }

    //if there is a callback
    if(_.isFunction(callback)) {
      callback(err);
    }
    else {
      console.log('remove callback is not a function');
    }
  });
};

//not rewritten
//IMPROVE CALLBACKS
//dbUpdateTeam('1540', {name: 'Flaming Chickens'}, func())
var dbUpdateTeam = function dbUpdateTeam(id, updateObj, callback) {
  callback = _.isFunction(callback) || function(e,t) {console.log(e,t)};
  if(typeof id === 'string' && _.isObject(updateObj) && _.isFunction(callback)) {
    Team.findOneAndUpdate({_id:id}, updateObj, callback);
  }
  else {
    callback(new Error('not enough info to update team'), null);
  }
}


//MATCHES
var dbNewMatch = function dbNewMatch(id, matchCompetitors, callback) {
  console.log('db#newMatch', id, matchCompetitors);

  if(typeof id !== 'number') { //|| !_.isObject(matchCompetitors) || !_.isFunction(callback)) {
    console.error('DB#newMatch: wrong arguments');
  }

  var redTeams = matchCompetitors.redAlliance;
  var blueTeams = matchCompetitors.blueAlliance;
  var allTeams = _.uniq(redTeams.concat(blueTeams));

  console.log(allTeams,redTeams,blueTeams);

  if(redTeams.length !== 3 && blueTeams.length !== 3 && allTeams.length !== 6) {
    console.error('DB#newMatch: must have three unique teams on each alliance');
  }

  if(!_.isFunction(callback)) {
    callback = function(e,t){console.log(e,t)};
  }
  
  var match = new Match;

  match._id = id;
  match.redAlliance = redTeams;
  match.blueAlliance = blueTeams;
  match.blueScore = 0;
  match.redScore = 0;
  match.redFouls = 0;
  match.blueFouls = 0;
  match.complete = false;

  match.save(function(err, m) {
    if(!err) {
      var p = new mongoose.Promise;
      p.then(function() {
        console.log('created new match '+ m._id +' with red:'+ m.redAlliance +'and blue:'+ m.blueAlliance);
        _.each(allTeams, function(teamId) {
          console.log(teamId);
          dbUpdateTeam(teamId, {$push:{matches:m._id}});
        });
      })

      .then(function() {
        callback(null);
      });

      p.fulfill();

    }
    else {
      console.error(err, 'db#newMatch match creation failed');
      callback(err);
    }
  });
};

//not rewritten
var dbUpdateMatch = function dbUpdateMatch(match_id, updateObj, callback) {
  if(!(typeof id === 'number') && !_.isObject(updateObj)) {
    throw new Error('db#finishMatch: BAD ARGUMENTS');
  }

  callback = callback || function(e,m) {console.log(e,m)};

  Match.findOneAndUpdate({_id: match_id}, updateObj, callback);
};

var dbFinishMatch = function dbFinishMatch(id, matchStats, callback) {
  if(!(typeof id === 'number') && !_.isObject(matchStats)) {
    throw new Error('db#finishMatch: BAD ARGUMENTS');
  }

  callback = callback || function(err) {if(err){console.log(err);}};

  dbUpdateMatch(id, {
    redScore: matchStats.redScore, 
    blueScore: matchStats.blueScore, 
    redFouls: matchStats.redFouls, 
    blueFouls: matchStats.blueFouls,
    complete: true
  }, function(err, match) {
    if(!err) {

      var errCallback = function(err) {
        if(err) throw err;
      };

      var promise = new mongoose.Promise;

      promise.then(function() {
        var winner = match.getWinner();

        if(winner === 'red' || winner === 'blue') {
          var loser = (winner === 'red')? 'blue' : 'red';
          console.log('================   WIN/LOSS   ================', winner, loser);

          _.each(match[winner+'Alliance'], function(teamId) {
            dbUpdateTeam(teamId, {$inc:{qualScore: 2, wins: 1}}/*, errCallback*/);
          });
          _.each(match[loser+'Alliance'], function(teamId) {
            dbUpdateTeam(teamId, {$inc:{losses: 1}}/*, errCallback*/);
          });
        }
        else if(winner === 'tie') {
          console.log('================   TIE   ================');
          _.each(match['redAlliance'], function(teamId) {
            dbUpdateTeam(teamId, {$inc:{qualScore: 1, ties: 1}}/*, errCallback*/);
          });
          _.each(match['blueAlliance'], function(teamId) {
            dbUpdateTeam(teamId, {$inc:{qualScore: 1, ties: 1}}/*, errCallback*/);
          });
        }
        else {
          console.error('db#finishMatch: There\'s an issue here.');
        }
      })

      .then(function() {
        callback(null);
      });

      promise.fulfill();
    }
    else {
      callback(err)
    }
  });
};

//not rewritten
var dbGetMatch = function dbGetMatch(matchId, callback) {
  var query = Match;

  if(!matchId) {
    throw new Error('must have a callback');
  }

  //db.get(MATCH_ID, FUNCTION) => Match object
  if(typeof matchId === 'number' && _.isFunction(callback)) {
    query = query.findOne({_id:matchId});
  }
  //covers db.get(FUNCTION) => returns all matches
  else if(_.isFunction(matchId)) {
    callback = matchId;
    query = query.find({}); //queries for all matches in db 
  }
  //covers error cases
  else {
    callback = function(err, match) {console.log(err, match)};
    callback(new Error('can not get match '+ matchId +' from database with current arguments'), null);
  }

  query.exec(callback);
};

//not rewritten
//ERR: potentially update the ids as well
//remove from teams of match too
var dbRemoveMatch = function dbRemoveMatch(id, callback) {
  if(typeof id !== 'number') {
    console.log('DB REMOVE: id does not work');
  }
  else {
    Match.findOneAndRemove({_id:id}, callback);
  }
};


//debugging
exports.Team = Team;
exports.Match = Match;

//EXPORTS
exports.connect = dbConnect;
//TEAMS
exports.addTeam = dbCreateTeam;
exports.getTeam = dbGetTeam;
exports.getTeams = dbGetTeams;
exports.removeTeam = dbRemoveTeam;
exports.updateTeam = dbUpdateTeam;
//MATCHES
exports.createMatch = dbNewMatch;
exports.finishMatch = dbFinishMatch;
exports.getMatch = dbGetMatch;
//exports.getMatches = dbGetMatches;
exports.updateMatch = dbUpdateMatch;
exports.removeMatch = dbRemoveMatch;


//EVENTS - not implemented
//event: {type: ObjectId, ref: 'EventSchema'}, for multiple events
//For multi-event support
/*
  var Event = mongoose.Schema({
    matches: [{type: ObjectId, ref: 'MatchSchema'}],
    location: String
  });
*/
//var Event = mongoose.model('Event', EventSchema);
//exports.addEvent = function dbEventCreation() {};