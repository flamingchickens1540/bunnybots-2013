"use strict";

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

var app = angular.module('bunnybots2013', [
  'bunnybots2013.masterControllers',
  'bunnybots2013.refereeControllers',
  'bunnybots2013.factories',
  'ngRoute',
  'btford.socket-io'
 ]);


app.config(function ($routeProvider, $locationProvider) {
  $routeProvider.

    when('/', {
      templateUrl: 'partials/home',
      controller: 'AppCtrl'
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

    when('/master_add_team', {
      templateUrl: 'partials/master_add_team',
      controller: 'MasterAddTeamCtrl'
    }).
    
    //default - turn off for development
    otherwise({
      redirectTo: '/' //or a 404 page?
    });
  $locationProvider.html5Mode(true);
});

app.controller('AppCtrl', function ($scope, socket) {
  //update by master only

  socket.on('connected', function(data) {
    console.log('LOG: socket.io connected to server.');
  });
});
app.controller('HomePageCtrl', function ($scope) {
  $scope.hello = 'test';
});
app.controller('PublicMatchViewCtrl', function ($scope, socket, audio) {
  $scope.redFouls = 0;
  $scope.blueFouls = 0;
  $scope.barColorClass = "progress-bar-primary";

  socket.on('match:reset', function() {
    $scope.redScore = 0;
    $scope.blueScore = 0;
    $scope.timeLeft = '2:30';
    $scope.barWidth = {width: '0%'};
    $scope.barColorClass = "progress-bar-primary";
  });

  socket.on('match:init', function(data) {
    //assign redTeams and blueTeams
    $scope.redTeams = data.red;
    $scope.blueTeams = data.blue;
    $scope.barWidth = {width: '0%'};
    $scope.timeLeft = '2:30';
    $scope.redScore = 0;
    $scope.blueScore = 0;
    $scope.barColorClass = "progress-bar-primary";
  });

  //may need to update for lag and latency
  socket.on('match:tick', function(data) {
    //causes angular to reevaluate after each tick
    $scope.$apply(function() {
      $scope.timeLeft = data.timeLeft;
      //really an ng-style directive, but I only use it for this
      $scope.barWidth = {'width':data.percentCompleted+"%"};

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
  });

  socket.on('referee:input', function(data) {
    //should only be one key value pair per signal
    $scope[data.color+'Score'] += data.scoreChange;

    if(data.type === 'fouls') {
      //a negative score means a positive penalty
      $scope[data.color+'Fouls'] -= data.scoreChange;
    }
  });

  socket.on('match:end', function() {
    $scope.timeLeft = 'Verifying';
  });

  socket.on('match:recorded', function(data) {
    $scope.timeLeft = 'Complete';
    $scope.redScore = data.redScore;
    $scope.blueScore = data.blueScore;
  });
});
app.controller('TeamRankingsCtrl', function ($scope, $http, socket) {
  $scope.teams = [];
  
    var isSorted = function(teams) {
      var now = teams[i];
      var next = teams[i+1];
      var sort = true;

      for (var i = 0; i < teams.length; i++) {
        now = teams[i];
        next = teams[i+1];

        if(next) {
          if(now.wins < next.wins) {
            sort = false;
          }
          else if(now.wins === next.wins) {
            if(now.ties < next.ties) {
              sort = false;
            }
            else if(now.ties === next.ties) {
              if(now.losses > next.losses) {
                sort = false;
              }
            }
            else {
              //keep how it is
            }
          }
          else {
            //keep how it is
          }
        }

        return sort;
      }
    };

    //BUBBLE SORT IS BAD!!!
  $scope.rank = function(t) {
    var now = null;
    var next = null;
    var temp = null;

    var sorted = false;
    while(!sorted) {
      for (var i = 0; i < t.length; i++) {
        now = t[i];
        next = t[i+1];

        if(next) {
          if(now.wins < next.wins) {
            temp = now;
            t[i] = next;
            t[i+1] = now;
          }
          else if(now.wins === next.wins) {
            if(now.ties < next.ties) {
              temp = now;
              t[i] = next;
              t[i+1] = now;
            }
            else if(now.ties === next.ties) {
              if(now.losses > next.losses) {
                temp = now;
                t[i] = next;
                t[i+1] = now;
              }
            }
            else {
              //keep how it is
            }
          }
          else {
            //keep how it is
          }
        }
      }

      sorted = isSorted(t);
    }

    return t;
  };

  $http({
    method: 'GET',
    url: '/resources/teams'
  })

  .success(function(data, status) {
    if(status === 200) {
      $scope.teams = $scope.rank(data);
    }
    else {
      console.error('NO DATA, BAD URL');
    }
  });

  socket.on('match:recorded', function(data) {
    location.reload();
  });
});
app.controller('MasterAddTeamCtrl', function ($scope, socket) {
  $scope.team = {};

  $scope.createTeam = function() {
    socket.emit('team:create', {id: $scope.team._id, name: $scope.team.name});
  };  

  socket.on('team:created', function(teamCreateSuccess) {
    if(teamCreateSuccess === true) {
      alert('Team '+ $scope.team._id +' successfully created!');
      $scope.team._id = "";
      $scope.team.name = "";
    }
    else {
      alert('Team '+ $scope.team._id +' not created!');
    }
  });
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
/*
var conditions = {}, update = { wins: Math.floor(Math.random()*5), ties: Math.floor(Math.random()*5), losses: Math.floor(Math.random()*5)}, options = { multi: true };

Model.update(conditions, update, options, callback);

function callback (err, numAffected) {
  // numAffected is the number of updated documents
})*/
