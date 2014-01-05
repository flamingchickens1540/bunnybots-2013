var db = require('../modules/db.js');

db.Team.remove({}).exec(function(err) {
			console.log('TEST: Removed all teams');
		});

db.Match.remove({}).exec(function(err) {
	console.log('TEST: Removed all matches');
});

db.addTeam("995", "CV Robotics");
db.addTeam("997", "Spartan Robotics");
db.addTeam("1425", "Error Code Xero");
db.addTeam("1432", "Mahr's Metal Beavers");
db.addTeam("1540j", "Flaming Chickens");
db.addTeam("1540m", "Flaming Chickens");
db.addTeam("1540h", "Flaming Chickens");
db.addTeam("1540a", "Flaming Chickens");
db.addTeam("2374", "Crusaderbots");
db.addTeam("2411" , "Rebel Alliance");
db.addTeam("2471a", "Team Mean Machine");
db.addTeam("2471b", "Team Mean Machine");
db.addTeam("2517", "Green Wrenches");
db.addTeam("2542", "Go4Bots");
db.addTeam("2635", "Lake Monsters");
db.addTeam("2733", "Pigmice");
db.addTeam("2811", "Stormbots");
db.addTeam("3131", "Gladiators");
db.addTeam("3192" ,"Tiger Bytes");
db.addTeam("3636", "General Robotics");
db.addTeam("3674", "Cloverbots");
db.addTeam("4051", "Sabin-Sharks");
db.addTeam("4457", "Flying Fedoras");
db.addTeam("4662", "Tribal Tech");

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
