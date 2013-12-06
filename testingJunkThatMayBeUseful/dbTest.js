var db = require('../modules/db.js');

db.Team.remove({}).exec(function(err) {
			console.log('TEST: Removed all teams');
		});

db.Match.remove({}).exec(function(err) {
	console.log('TEST: Removed all matches');
});

db.addTeam('1','a');
db.addTeam('2','b');
db.addTeam('3','c');
db.addTeam('4','d');
db.addTeam('5','e');
db.addTeam('6','f');

/*
var db = require('../modules/db.js');
var async = require('async');

//db.connect();

async.series([
	function removeAllData(continueSeries) {
		db.Team.remove({}).exec(function(err) {
			console.log('TEST: Removed all teams');
		});

		db.Match.remove({}).exec(function(err) {
			console.log('TEST: Removed all matches');
		});

		continueSeries(null);
	},

	function populateTeams(continueSeries) {
		/*POPULATE THE DATABASE W/ TEAMS*/
/*		db.addTeam('1', 'a', function(err, team) {
			if (!err) console.log('created team '+ team.id +': '+ team.name);
			else console.log('failed to create team 1');
		});
		db.addTeam('2', 'b', function(err, team) {
			if (!err) console.log('created team '+ team.id +': '+ team.name);
			else console.log('failed to create team 2');
		});
		db.addTeam('3', 'c', function(err, team) {
			if (!err) console.log('created team '+ team.id +': '+ team.name);
			else console.log('failed to create team 3');
		});
		db.addTeam('4', 'd', function(err, team) {
			if (!err) console.log('created team '+ team.id +': '+ team.name);
			else console.log('failed to create team 4');
		});
		db.addTeam('5', 'e', function(err, team) {
			if (!err) console.log('created team '+ team.id +': '+ team.name);
			else console.log('failed to create team 5');
		});
		db.addTeam('6', 'f', function(err, team) {
			if (!err) console.log('created team '+ team.id +': '+ team.name);
			else console.log('failed to create team 6');
		});
		db.addTeam('7', 'g', function(err, team) {
			if (!err) console.log('created team '+ team.id +': '+ team.name);
			else console.log('failed to create team 7');
		});
		db.addTeam('8', 'h', function(err, team) {
			if (!err) console.log('created team '+ team.id +': '+ team.name);
			else console.log('failed to create team 8');
		});
		db.addTeam('9', 'i', function(err, team) {
			if (!err) console.log('created team '+ team.id +': '+ team.name);
			else console.log('failed to create team 9');
		});

		continueSeries(null);
	},

	function testGetTeam(continueSeries) {
		db.getTeam('9', function(err, team) {
			console.log('Team 9 was returned? '+ (team.id === '9'));
		});

		continueSeries(null);
	}
], function errCallback(err, results) {

});*/
