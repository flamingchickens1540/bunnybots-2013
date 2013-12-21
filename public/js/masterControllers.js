var master = angular.module('bunnybots2013.masterControllers', [
  'btford.socket-io',
  'bunnybots2013.factories'
]);


master.controller('MasterMatchViewCtrl', function ($scope, $location, socket, helper, timeFormat, audio, $rootScope) {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;


  socket.emit('match:getMatchInfo');
  socket.on('match:receiveMatchInfo', function(data) {
    $scope.redTeams = data.redAlliance.teams;
    $scope.blueTeams = data.blueAlliance.teams;
  });

  $scope.redFouls = 0;
  $scope.blueFouls = 0;

  $scope.startMatch = function() {
    if(!$scope.matchRunning) {
      socket.emit('match:tick', {timeLeft: '2:30', percentCompleted: 0});
      requestAnimationFrame($scope.bar);
    }
  };
  $scope.verifyMatch = function() {
    socket.emit('match:end');
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

  var start;
  var percentCompleted = 0, timeLeft = '2:30';
  $scope.barColorClass = "progress-bar-primary";

  $scope.bar = function bar(time) {
    start = start || time;
    
    if($scope.matchRunning && time - start < timeFormat.MATCH_LENGTH) {
      percentCompleted = 100*((time - start)/timeFormat.MATCH_LENGTH);
      
      //$apply allows for us to update the DOM as quickly as we need. Additional changes register quickly
      $scope.$apply(function() {
        
        //really an ng-style directive, but I only use it for this
        $scope.barWidth = {'width':percentCompleted+"%"};
        $scope.timeLeft = timeFormat.formatMilliseconds(timeFormat.MATCH_LENGTH - (time - start));

        if(timeLeft !== $scope.timeLeft) {
          timeLeft = $scope.timeLeft;

          //send match:tick event
          socket.emit('match:tick', {timeLeft: timeLeft, percentCompleted: percentCompleted});
          //console.log('emit match:tick event at '+ timeLeft);
        }
  
        
        switch($scope.timeLeft) {
          case '2:30':
            $scope.barColorClass = "progress-bar-primary";
            audio.startMatch.play();
          break;

          case '2:15':
            $scope.barColorClass = "progress-bar-success";
            audio.endAuto.play();
          break;

          case '0:20':
            $scope.barColorClass = "progress-bar-warning";
            audio.startEndgame.play();
          break;

          case '0:00':
            $scope.barColorClass = "progress-bar-danger";
            $scope.matchComplete = true;
            audio.endMatch.play();
          break;
        }
      });
        
      if($scope.matchRunning) {
        //can stop recursive progress bar animation call?
        requestAnimationFrame($scope.bar);
      }
      else {
        //pause?
      }
    }

    else {
      //do server stuff - pass data to next page - etc.
      //does not move to next page until pause is pressed - why?
      //$location.path('/verify');
    }


    $scope.$on('$locationChangeStart', function(event, next, current) {
        $scope.matchRunning = false;
    });
  };

  socket.on('referee:input', function(data) {
    //should only be one key value pair per signal
    $scope[data.color+'Score'] += data.scoreChange;

    if(data.type === 'fouls') {
      //a negative score means a positive penalty
      $scope[data.color+'Fouls'] -= data.scoreChange;
    }
  });
});

master.controller('MasterMatchInputCtrl', function ($scope,
 $location, socket, helper) {
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
    $location.path('/master');
  });

  socket.on('match:error-init', function(err) {
    alert(err.message);
    console.error(err.message);
  });

  $scope.serverMatchReset = function() {
    //clears the currentMach on the server
    socket.emit('master:reset-match');
  };
});

master.controller('MasterMatchVerifyCtrl', function ($scope, socket, $location) {
  socket.emit('match:getMatchInfo');
  socket.on('match:receiveMatchInfo', function(data) {

    $scope.redTeams = data.redAlliance.teams;
    $scope.blueTeams = data.blueAlliance.teams;

    $scope.redScore = data.redAlliance.score;
    $scope.blueScore = data.blueAlliance.score;

    $scope.redFouls = data.redAlliance.fouls;
    $scope.blueFouls = data.blueAlliance.fouls;
  });

  $scope.editStats = function editStats(color, type, num) {
    if((color === 'red' || color === 'blue') &&  typeof num === 'number') {
      if(type === 'score') {
        $scope[color+'Score'] += num;
      }
      else if(type === 'fouls') {
        //negative scoreChange = positive foul count
        $scope[color+'Fouls'] += num;
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
