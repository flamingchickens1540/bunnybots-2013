var fact = angular.module('bunnybots2013.factories' ,[]);

//helper functions
fact.factory('helper', function() {
	var helper = {};

	//returns an array of unique values
	helper.uniq = function uniq(array){
	   var u = {}, a = [];
	   for(var i = 0, l = array.length; i < l; ++i){
	      if(u.hasOwnProperty(array[i])) {
	         continue;
	      }
	      a.push(array[i]);
	      u[array[i]] = 1;
	   }
	   return a;
	};

	//check that it is made of 3 teams, each 4-5 letters long and strings
	helper.validateTeams = function validateTeams(teamsArray) {
	  if(angular.isArray(teamsArray)) {
	    var validateAllianceCount = (teamsArray.length === 3); 
	    var validateTypes, validateWordLengths;

	    teamsArray.forEach(function(team) {
	      if(typeof team === 'string') {
	        validateTypes = true;

	        // '1540' or '1540z'
	        if(team.length <= 5 && team.length > 0) {
	          validateWordLengths = true;
	        }
	        else {
	          validateWordLengths = false;
	        }
	      }
	      else {
	        validateTypes = false;
	      }
	    });

	    return (validateAllianceCount && validateTypes && validateWordLengths);
	  }
	  else {
	    return false;
	  }
	};

	return helper;
});

fact.factory('timeFormat', function() {
	var timeFormat = {};

	timeFormat.formatMilliseconds = function formatMillisceonds(time) {
	  if(typeof time === 'string') {
	    time = parseInt(time);
	  }
	  if(typeof time !== 'number') {
	    throw new Error('time '+ time +' is not a number');
	  }
	  var seconds = Math.floor(time/1000 % 60);
	  seconds = (seconds < 10)? '0'+seconds: seconds; 
	  var minutes = Math.floor(time/(60*1000));

	  //2:30
	  return minutes +':'+ seconds;
	};

	//no checks on inputs
	timeFormat.formatTimerOutput = function formatTimerOutput(timerString) {
	  var timer = timerString.split(':');
	  // 2:30 => 120000 + 30000 => 150000
	  var minutes = parseInt(timer[0])*60*1000;
	  var seconds = parseInt(timer[1])*1000;
	  var milliseconds = minutes + seconds;

	  return milliseconds;
	};

	timeFormat.MATCH_LENGTH = 150000;

	return timeFormat;
});

fact.factory('audio', function() {
	return {
		startMatch: new Audio('/audio/start_of_match.wav'),
		endAuto: new Audio('/audio/end_of_autonomous.wav'),
		startEndgame: new Audio('/audio/start_of_endgame.wav'),
		endMatch: new Audio('/audio/end_of_match.wav')
	};
});

