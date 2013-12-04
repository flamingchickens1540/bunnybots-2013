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
	id: String,
  name: String,
	qualScore: {type: Number, default: 0}
});

var matchSchema = new mongoose.Schema({
	id: Number,
	time: Number,

	redScore: Number,
	redFouls: Number,

	blueScore: Number,
	blueFouls: Number
});


//CIRCULAR REFERENCES
teamSchema.add({
  matches: [{type: ObjectId, ref: 'Match'}]
});

matchSchema.add({
  redTeams: [{type: ObjectId, ref: 'Team'}],
  blueTeams: [{type: ObjectId, ref: 'Team'}]
});

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

//UPDATE FOR ALL CASES OF ARGUMENTS
//forget fields, im getting whole objects from now on! SIMPLICITY!
var dbGetTeam = function dbGetTeam(id, callback) {
  var query = Team;

  //db.get(TEAM_ID, FUNCTION) => Team object
  if(typeof id === 'string' && _.isFunction(callback)) {
    query = query.findOne({id:id}).populate('matches');
  }
  else {
    throw new Error('db#getTeam: need one Teamid string and one callback func');
  }
  query.exec(callback);
};

//for multiple teams
var dbGetTeams = function dbGetTeams(teamIds, callback) {
  var query = Team;

  //default is arrays (multiple teams)
  if(_.isArray(teamIds)) {
    var queryRegExp = teamIds.join('|');
    query = query.find({id:queryRegExp}).populate('matches'); //queries for all teams in db 
  }
  //all teams
  else if(_.isFunction(teamIds)){
    callback = teamIds;
    query = query.find({}).populate('matches');
  }
  //covers error cases
  else {
    query = query.find({}).populate('matches');
    callback = function(err, team) {
      if(!err) 
        console.log(team);
      else 
        throw new Error('can not get team '+ id +' from database with current arguments');
    };
  }

  query.exec(callback);
};

//FIX TO USE NUMBER ID's
var dbCreateTeam = function dbCreateTeam(id, name, callback) {
  if(typeof id !== 'string') {
    console.log('wrong arguments => id: '+ id +', name: '+ name +', callback: '+ callback +'.');
  }

  if(!id) {
    console.log('tried to create team without an id');
  }

  //check whether it exists already first
  dbGetTeam(id, function(err, team) {
    if(!team) {
      Team.create({id: id, name: (name || '[NO NAME]')}, function(err, team) {
        if(!err) {
          console.log('created team: '+team.id);
        }
        else {
          console.log('failed to create team: '+team.id);
        }

        //if there is a callback
        if(_.isFunction(callback)) {
          callback(err, team); //may remove team arg for less data use
        }
        else {
          console.log('db#add callback is not a function');
        }

        
      });
    }
    else {
      console.log('team '+ id +' already exists and can not be added')
    }
  });
};

//what if it isnt there?
var dbRemoveTeam = function dbRemoveTeam(id, callback) {
  if(typeof id !== 'string') {
    console.log('DB REMOVE: id does not work');
  }

  Team.findOneAndRemove({id: id}, function(err) {
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

//IMPROVE CALLBACKS
//dbUpdateTeam('1540', {name: 'Flaming Chickens'}, func())
var dbUpdateTeam = function dbUpdateTeam(id, updateObj, callback) {
  if(typeof id === 'string' && _.isObject(updateObj) && _.isFunction(callback)) {
    Team.findOneAndUpdate({id:id}, updateObj, callback);
  }
  else {
    callback(new Error('not enough info to update team'), null);
  }
}



var dbNewMatch = function dbNewMatch(id, matchCompetitors, callback) {
  if(typeof id !== 'number') { //|| !_.isObject(matchCompetitors) || !_.isFunction(callback)) {
    throw new Error('DB#newMatch: wrong arguments');
  }

  if(matchCompetitors.red.length !== 3 || matchCompetitors.blue.length !== 3) {
    throw new Error('DB#newMatch: must have three teams on each alliance');
  }

  //all teams
  var teamIds = matchCompetitors.red.concat(matchCompetitors.blue);
  var redTeams = [];
  var blueTeams = [];
  var teamsInMatch = [];


  Team.find({id:new RegExp(teamIds.join('|'))}).exec(function(err, teams) {
    _.each(teams, function(team) {
      //if it is in the list (ERR: two of the same team)
      if(matchCompetitors.red.indexOf(team.id) !== -1) {
        redTeams.push(team._id);
      }
      else {
        blueTeams.push(team._id);
      }

      teamsInMatch.push(team);
    });
  })

  .then(function() {
    if((teams.length)!== 6) {
      throw new Error('db#newMatch: NOT ENOUGH TEAMS FOR A MATCH');
    }

    console.log(teams);

    Match.create({id: id, redTeams: redTeams, blueTeams: blueTeams}, function(err, match) {
      _.each(teams, function(team) {
        console.log(team);

        //allows for population of team's matches
        var updatedMatches = team.matches.push(match._id);
        console.log('gets to this point');
        dbUpdateTeam(team.id, {matches: updatedMatches}, callback);
      });
    });
  });
};

var dbUpdateMatch = function dbUpdateMatch(matchId, updateObj, callback) {
  if(!(typeof id === 'number') && !_.isObject(updateObj)) {
    throw new Error('db#finishMatch: BAD ARGUMENTS');
  }

  callback = callback || function(err) {};

  Match.findOneAndUpdate({id: match_id}, updateObj, callback);
};

var dbFinishMatch = function dbFinishMatch(id, matchStats, time, callback) {
  if(!(typeof id === 'number') && !_.isObject(matchStats)) {
    throw new Error('db#finishMatch: BAD ARGUMENTS');
  }

  callback = callback || function(err) {};

  dbUpdateMatch(id, {
    redScore: matchStats.score.red, 
    blueScore: matchStats.score.blue, 
    redFouls: matchStats.fouls.red, 
    blueFouls: matchStats.fouls.blue, 
    time: time
  }, callback);
};

var dbGetMatch = function dbGetMatch(matchId, callback) {
  var query = Match;

  if(!matchId) {
    throw new Error('must have a callback');
  }

  //db.get(MATCH_ID, FUNCTION) => Match object
  if(typeof matchId === 'number' && _.isFunction(callback)) {
    query = query.findOne({id:matchId}).populate('redTeams blueTeams');
  }
  //covers db.get(FUNCTION) => returns all matches
  else if(_.isFunction(matchId)) {
    callback = matchId;
    query = query.find({}).populate('redTeams blueTeams'); //queries for all matches in db 
  }
  //covers error cases
  else {
    callback = function(err, match) {console.log(err, match)};
    callback(new Error('can not get match '+ matchId +' from database with current arguments'), null);
  }

  query.exec(callback);
};

//ERR: potentially update the ids as well
//remove from teams of match too
var dbRemoveMatch = function dbRemoveMatch(id, callback) {
  if(typeof id !== 'number') {
    console.log('DB REMOVE: id does not work');
  }
  else {
    Match.findOneAndRemove({id:id}, callback);
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