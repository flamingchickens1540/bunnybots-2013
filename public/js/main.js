"use strict";

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

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
}

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

helper.formatMilliseconds = function formatMillisceonds(time) {
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

var app = angular.module('bunnybots2013', ['ngRoute', 'btford.socket-io']);


app.config(function ($routeProvider, $locationProvider) {
  $routeProvider.

    when('/', {
      templateUrl: 'partials/referee',
      controller: 'HomePageCtrl'
    }).

    when('/match_view', {
      templateUrl: 'partials/public_match_view',
      controller: 'PublicMatchViewCtrl'
    }).

    when('/master', {
      templateUrl: 'partials/master_match_view',
      controller: 'MasterMatchViewCtrl'
    }).

    when('/input', {
      templateUrl: 'partials/master_match_input',
      controller: 'MasterMatchInputCtrl'
    }).

    when('/verify', {
      templateUrl: 'partials/master_match_verify',
      controller: 'MasterMatchVerifyCtrl'
    }).

    when('/referee', {
      templateUrl: 'partials/referee',
      controller: 'RefereeCtrl'
    }).

    when('/rankings', {
      templateUrl: 'partials/team_rankings',
      controller: 'TeamRankingsCtrl'
    }).

    when('/matches', {
      templateUrl: 'partials/match_history',
      controller: 'MatchHistoryCtrl'
    }).
    
    //default - turn off for development
    otherwise({
      redirectTo: '/home' //or a 404 page?
    });
  $locationProvider.html5Mode(true);
});

app.controller('AppCtrl', function ($scope, $rootScope, socket) {
  //update by master only

  //try not to use rootScope
  $rootScope.currentTeams = {red:[],blue:[]};
  $rootScope.redAlliance = {};
  $rootScope.blueAlliance = {};

  socket.on('connected', function(data) {
    console.log('LOG: socket.io connected to server.');
  });
});
app.controller('HomePageCtrl', function ($scope) {
  
  $scope.hello = 'test';
});

app.controller('PublicMatchViewCtrl', function ($scope, $rootScope, socket) {
  $scope.redTeams = $rootScope.currentTeams.red;
  $scope.blueTeams = $rootScope.currentTeams.blue;

  $scope.redFouls = 0;
  $scope.blueFouls = 0;

  socket.on('match:reset', function() {
    $scope.redScore = 0;
    $scope.blueScore = 0;
    $scope.timeLeft = '2:30';
    $scope.barWidth = {width: '0%'};
  });

  socket.on('match:init', function(data) {
    //assign redTeams and blueTeams
    $scope.redTeams = data.red;
    $scope.blueTeams = data.blue;
    $scope.barWidth = {width: '0%'};
    $scope.timeLeft = '2:30';
    $scope.redScore = 0;
    $scope.blueScore = 0;
    //reset timer
  });

  //may need to update for lag and latency
  socket.on('match:tick', function(data) {
    $scope.$apply(function() {
        

      //really an ng-style directive, but I only use it for this
      $scope.barWidth = {'width':data.percentCompleted+"%"};
      $scope.timeLeft = data.timeLeft;

      //sounds and color changes in bar
      //for final 30 seconds
      if($scope.timeLeft === '0:30') {
        $scope.barColorClass = "progress-bar-warning";
      }

      //add
      // end of autonomous (sound, color change)
      // last 10 seconds (red)
      // sound for last 30 sec.

      //fixes issue of bar not completing
      if($scope.timeLeft === '0:00') {
        $scope.barWidth = {width: '100%'};
      }
    });
  });

  socket.on('referee:input', function(data) {

    //should only be one key value pair per signal
    var thingToChange = Object.keys(data);
    $scope[thingToChange] += data[thingToChange];

    if(thingToChange === 'redFouls') {
      $scope.redScore += 3*data.redFouls;
    }

    else if(thingToChange === 'blueFouls') {
      $scope.blueScore += 3*data.blueFouls;
    }
  });

  socket.on('match:end', function() {
    $scope.timeLeft = 'Verifying...'
  });

  socket.on('match:recorded', function(data) {
    $scope.timeLeft = 'Complete';
    $scope.redScore = data.redScore;
    $scope.blueScore = data.blueScore;
  });
});

app.controller('MasterMatchViewCtrl', function ($scope, $rootScope, $location, socket) {

  $scope.redTeams = $rootScope.currentTeams.red;
  $scope.blueTeams = $rootScope.currentTeams.blue;

  $scope.redFouls = 0;
  $scope.blueFouls = 0;

  $scope.startMatch = function() {
    if(!$scope.matchRunning) {
      requestAnimationFrame($scope.bar);
    }
  };
  $scope.verifyMatch = function() {
    socket.emit('match:end');

    $rootScope.redAlliance = {score: $scope.redScore, fouls: $scope.redFouls};
    $rootScope.blueAlliance = {score: $scope.blueScore, fouls: $scope.blueFouls};

    $location.path('/verify');
  };
  $scope.resetMatch = function() {
    socket.emit('match:reset');
  };
  /*
    reset: coded for in HTML
      ISSUE: when match is restarted, it goes back to where it was
        after match is over reset, it just doesn't work period
    pause: coded for in HTML
  */

  var MATCH_LENGTH = 150000;

  var start;
  var percentCompleted = 0, timeLeft = '2:30';
  $scope.barColorClass = "progress-bar-success";

  $scope.bar = function bar(time) {
    start = start || time;
    
    if($scope.matchRunning && time - start < MATCH_LENGTH) {
      percentCompleted = 100*((time - start)/MATCH_LENGTH);
      
      //$apply allows for us to update the DOM as quickly as we need. Additional changes register quickly
      $scope.$apply(function() {
        

        //really an ng-style directive, but I only use it for this
        $scope.barWidth = {'width':percentCompleted+"%"};
        $scope.timeLeft = helper.formatMilliseconds(MATCH_LENGTH - (time - start));

        if(timeLeft !== $scope.timeLeft) {
          timeLeft = $scope.timeLeft;

          //send match:tick event
          socket.emit('match:tick', {timeLeft: timeLeft, percentCompleted: percentCompleted});
          //console.log('emit match:tick event at '+ timeLeft);
        }

        //sounds and color changes in bar
        //for final 30 seconds
        if($scope.timeLeft === '0:30') {
          $scope.barColorClass = "progress-bar-warning";
        }

        //add
        // end of autonomous (sound, color change)
        // last 10 seconds (red)
        // sound for last 30 sec.


        if($scope.timeLeft === '0:00') {
          //end match starts the verify button
          $scope.matchComplete = true;
        }
      });
        
      //if($scope.matchRunning) {
        //recursive progress bar animation call
        requestAnimationFrame($scope.bar);
      //}
    }

    else {
      //do server stuff - pass data to next page - etc.
      //does not move to next page until pause is pressed - why?
      //$location.path('/verify');
    }
  };

  socket.on('referee:input', function(data) {
    //should only be one key value pair per signal
    //first element in array returned is my value
    var thingToChange = Object.keys(data)[0];

    $scope[thingToChange] += data[thingToChange];

    if(thingToChange === 'redFouls') {
      $scope.blueScore += 3*data.redFouls;
    }

    else if(thingToChange === 'blueFouls') {
      $scope.redScore += 3*data.blueFouls;
    }
  });
});

app.controller('MasterMatchInputCtrl', function ($scope, $rootScope, $location, socket) {
  $scope.redTeams = [];
  $scope.blueTeams = [];

  $scope.createMatch = function() {
    //returns a duplicate free array (a team can't play itself)
    var uniqValArray = helper.uniq($scope.redTeams.concat($scope.blueTeams));
    if(uniqValArray.length === 6 && helper.validateTeams($scope.redTeams) && helper.validateTeams($scope.blueTeams)) {

      //send socket.io event and wait for server validation.
      socket.emit('match:init', {red: $scope.redTeams, blue: $scope.blueTeams});
    }
    else {
      console.error('teams do not work, please enter valid team ids');
    }
  };

  socket.on('match:confirm-init', function(data) {
    //reactive equaling
    $rootScope.currentTeams.red = $scope.redTeams;
    $rootScope.currentTeams.blue = $scope.blueTeams;
    $location.path('/master');
  });

  socket.on('error-init', function(err) {
    alert(err.message);
    console.error(err.message);
  });
});

app.controller('MasterMatchVerifyCtrl', function ($scope, $rootScope, socket, $location) {
  //allow for easy editing of flawed scores
  $scope.redTeams = $rootScope.currentTeams.red;
  $scope.blueTeams = $rootScope.currentTeams.blue;

  $scope.redScore = $rootScope.redAlliance.score || 0;
  $scope.redFouls = $rootScope.redAlliance.fouls || 0;

  $scope.blueScore = $rootScope.blueAlliance.score || 0;
  $scope.blueFouls = $rootScope.blueAlliance.fouls || 0;

  $scope.editStats = function editStats(color, type, num) {
    if((color === 'red' || color === 'blue') && (type === 'fouls' || type === 'score') && typeof num === 'number') {
      var formattedType = type[0].toUpperCase() + type.slice(1)
      $scope[color+formattedType] += num;

      if(type === 'fouls') {
        var otherColor = (color === 'red')? 'blue': 'red';
        $scope[otherColor+'Score'] += 3*num;
      }

      return true;
    }
    else {
      throw new Error("can't edit the score");
      return false;
    }
  };

  // NO err-checking!
  $scope.submitMatch = function() {
    //send matchResults to server
    //then, show final score page for user

    socket.emit('match:submit', {
      redAlliance: {
        teams: $scope.redTeams,
        score: $scope.redScore,
        fouls: $scope.redFouls
        },
      blueAlliance: {
        teams: $scope.blueTeams,
        score: $scope.blueScore,
        fouls: $scope.blueFouls
      }
    });
  };

  socket.on('match:recorded', function() {
    $location.path('/input');
  });
});

app.controller('RefereeCtrl', function ($scope, socket) {

  //default is disabled or enabled? which should I choose?

  var reset = function() {
    //enable all buttons
    $scope.redFouls = 0;
    $scope.redScore = 0;
    $scope.blueFouls = 0;
    $scope.blueScore = 0;
    //reset hole color
    $scope.timeLeft = '2:30';
  };


  var editStats = function editStats(color, type, num) {
    if((color === 'red' || color === 'blue') && (type === 'fouls' || type === 'score') && typeof num === 'number') {
      var formattedType = type[0].toUpperCase() + type.slice(1);
      $scope[color+formattedType] += num;

      if(type === 'fouls') {
        var otherColor = (color === 'red')? 'blue': 'red';
        $scope[otherColor+'Score'] += 3*num;
      }

      return true;
    }
    else {
      throw new Error("can't edit the score");
      return false;
    }
  };

  $scope.emitRefereeInput = function(color, type, num) {
    var editedStats = editStats(color, type, num);
    if(editedStats) {
      var camelCased = color + type[0].toUpperCase() + type.slice(1)

      var dataObj = {};
      dataObj[camelCased] = num;

      socket.emit('referee:input', dataObj);
    }
  };

  $scope.changeHoleColor = function(newColor) {

  };

  socket.on('match:init', reset);
  socket.on('match:reset', reset);

  socket.on('match:tick', function(data) {
    $scope.timeLeft = data.timeLeft;
  });

  socket.on('referee:input', function(data) {

    //should only be one key value pair per signal
    var thingToChange = Object.keys(data);
    $scope[thingToChange] += data[thingToChange];

    if(thingToChange === 'redFouls') {
      $scope.redScore += 3*data.redFouls;
    }

    else if(thingToChange === 'blueFouls') {
      $scope.blueScore += 3*data.blueFouls;
    }
  });

  socket.on('match:end', function(data) {
    //show message in timeLeft
    //disable buttons
  });

  socket.on('match:recorded', function(data) {
    //timeLeft = waiting for next match
  });


});
app.controller('TeamRankingsCtrl', function ($scope) {
  $scope.hello = 'test';

});
app.controller('MatchHistoryCtrl', function ($scope) {
  $scope.hello = 'test';

});


//FOR THE TIMER
// DOES NOT WORK. SCREW THIS FOR NOW. learn later.
/*app.directive('progBar', function() {
  return {
    template: '<div class="progress-bar progress-bar-success" barWidthe:"width\: 10%;"></div>',
    restrict: 'EA',
    scope: {
      countDown: '@'
      startMatch: '&',
      pauseMatch: '&',
      resetMatch: '&'
    },
    //require: '^ngModel', //requires an ng-model to work
    replace: true,
    controller: function($scope) {},
    link: function(scope, elements, attrs) {}
  };
});*/
