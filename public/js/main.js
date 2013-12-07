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
      controller: 'PublicMatchViewCtrl'
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
  //$rootScope.currentTeams = {red:[],blue:[]};
  //$rootScope.redAlliance = {};
  //$rootScope.blueAlliance = {};

  socket.on('connected', function(data) {
    console.log('LOG: socket.io connected to server.');
  });
});
app.controller('HomePageCtrl', function ($scope) {
  
  $scope.hello = 'test';
});
app.controller('PublicMatchViewCtrl', function ($scope, $rootScope, socket) {
  $scope.redFouls = 0;
  $scope.blueFouls = 0;
  $scope.barColorClass = "progress-bar-success";

  socket.on('match:reset', function() {
    $scope.redScore = 0;
    $scope.blueScore = 0;
    $scope.timeLeft = '2:30';
    $scope.barWidth = {width: '0%'};
    $scope.barColorClass = "progress-bar-success";
  });

  socket.on('match:init', function(data) {
    //assign redTeams and blueTeams
    $scope.redTeams = data.red;
    $scope.blueTeams = data.blue;
    $scope.barWidth = {width: '0%'};
    $scope.timeLeft = '2:30';
    $scope.redScore = 0;
    $scope.blueScore = 0;
    $scope.barColorClass = "progress-bar-success";
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
    $scope[data.color+'Score'] += data.scoreChange;

    if(data.type === 'fouls') {
      //a negative penalty means an extra foul, else a plus foul
      $scope[data.color+'Fouls'] += (data.scoreChange < 0)? 1 : -1;
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
