/**********************************************
== Schema ==
Team: tracks team matches, score, and qualScore
(unimplemented) Event: tracks where an event is and the matches that occur. Will be expanded eventually to support multiple events
Match: Tracks match numbers, times (UTC), scores, teams, and fouls

== Functions ==
connect: connects to database 
getTeams: gets queried teams - accepts [] or number or *(undefined)
getMatches: gets all matches

to add---
getEvents: for multi-event support
**********************************************/

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var _ = require('underscore');


//Schemas
var teamSchema = mongoose.Schema({
	id: String,
  name: String,
	matches: [{type: ObjectId, ref: 'MatchSchema'}],

	qualScore: Number
});

var matchSchema = mongoose.Schema({
	id: Number,
	time: Number,

	redTeams: [{type: ObjectId, ref: 'TeamSchema'}],
	redScore: Number,
	redFouls: Number,

	blueTeams: [{type: ObjectId, ref: 'TeamSchema'}],
	blueScore: Number,
	blueFouls: Number
});



//Models
var Team = mongoose.model('Team', teamSchema);
var Match = mongoose.model('Match', matchSchema);

var dbConnect = function dbConnect(dbName) {
  if(typeof dbName == 'string') {
    mongoose.connect('localhost', dbName);
  }
  else {
    throw Error('database name must be a string');
  }
};

var dbGetTeam = function dbGetTeam(id, fields, callback) {
  var query = Team;

  //all arguments are there
  if(typeof id === 'string' && typeof fields === 'string' && _.isFunction(callback)) {
    query = query.findOne({id:id}).select(fields);
  }
  //id and fields is a callback
  else if(typeof id === 'string' && _.isFunction(fields)) {
    callback = fields;
    query = query.findOne({id:id});
  }
  //just a callback returns all teams
  else if(_.isFunction(id)) {
    callback = id;
    query = query.find({}); //queries for all teams in db 
  }
  else {
    throw Error('can not get team '+ id +' from database with current arguments');
  }

  query.exec(callback);
};

var dbTeamCreation = function dbTeamCreation(id, name) {
  if(!id) {
    throw Error('tried to create team without an id');
  }

  //check whether it exists already first
  dbGetTeam(id, function(err, team) {
    if(!team) {
      Team.create({id: id, name: (name || 'no name')}, function(err, team) {
        if(!err) {
          console.log('created team: '+team.id);
        }
        else {
          console.log('failed to create team: '+team.id);
        }
      });
    }
    else {
      console.log('team '+ id +' already exists and can not be added')
    }
  });
};

var dbRemoveTeam = function dbRemoveTeam(id) {
  Team.remove({id: id}, function(err) {
    if(!err) {
      console.log('Team '+ id +' removed!')
    }
    else {
      console.log('Team '+ id +' not removed!')
    }
  });
};

//EXPORTS
exports.connect = dbConnect;
exports.addTeam = dbTeamCreation;
exports.getTeam = dbGetTeam;
exports.removeTeam = dbRemoveTeam;

//debugging
exports.Team = Team;

/*
//all have VARIABLE.red and VARIABLE.blue
exports.addMatch = function dbMatchCreation(time, teams, score, fouls) {

  //create new match
  //update all team matches and team stats
  //update event matches
  //etc

};
*/

/*

exports.getAllMatches = function( /*why would I only want one? Maybe to view individual matches*//* ) {
/*
  Match.find().populate('redTeams blueTeams');
};


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