/**********************************************
== Schema ==
Team: tracks team matches, score, and qualScore
Event: tracks where an event is and the matches that occur. Will be expanded eventually to support multiple events
Match: Tracks match numbers, times (UTC), scores, teams, and fouls
**********************************************/

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;


//Schemas
var TeamSchema = mongoose.Schema({
	number: Number,
	matches: {type: ObjectId, ref: 'MatchSchema'},

	qualScore: Number
});

var MatchSchema = mongoose.Schema({
	id: Number,
	time: Number,
	//event: {type: ObjectId, ref: 'EventSchema'}, for multiple events

	redTeams: [{type: ObjectId, ref: 'TeamSchema'}],
	redScore: Number,
	redFouls: Number,

	blueTeams: [{type: ObjectId, ref: 'TeamSchema'}],
	blueScore: Number,
	blueFouls: Number
});

var Event = mongoose.Schema({
	matches: [{type: ObjectId, ref: 'MatchSchema'}],
	location: String
});

/*
exports.connect = function dbConnect() {

};
*/