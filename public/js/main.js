'use strict';

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

//returns an array of unique values
Array.prototype.uniq = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}

//check that it is made of 3 teams, each 4-5 letters long and strings
var validateTeams = function validateTeams(teamsArray) {
  if(angular.isArray(teamsArray)) {
    var validateAllianceCount = (teamsArray.length === 3); 
    var validateTypes, validateWordLengths;

    teamsArray.forEach(function(team) {
      if(typeof team === 'string') {
        validateTypes = true;

        // '1540' or '1540z'
        if(team.length <= 5 && team.length >= 1) {
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

var formatMilliseconds = function formatMillisceonds(time) {
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

var app = angular.module('bunnybots2013', ['ngRoute']);

app.config(function ($routeProvider, $locationProvider) {
  $routeProvider.

    when('/', {
      templateUrl: 'partials/referee',
      controller: 'MyCtrl1'
    }).

    when('/match_view', {
      templateUrl: 'partials/public_match_view',
      controller: 'MyCtrl2'
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
      controller: 'MyCtrl5'
    }).

    when('/referee', {
      templateUrl: 'partials/referee',
      controller: 'MyCtrl6'
    }).

    when('/rankings', {
      templateUrl: 'partials/team_rankings',
      controller: 'MyCtrl7'
    }).

    when('/matches', {
      templateUrl: 'partials/match_history',
      controller: 'MyCtrl8'
    }).
    
    //default - turn off for development
    otherwise({
      redirectTo: '/home'
    });
  $locationProvider.html5Mode(true);
});

app.controller('AppCtrl', function ($scope, $rootScope, $http) {

  //what is this? delete?
  $http({
    method: 'GET',
    url: '/api/name'
  }).
  success(function (data, status, headers, config) {
    $scope.test = data.name;
  }).
  error(function (data, status, headers, config) {
    $scope.test = 'Error!'
  });

  //update by master only
  $rootScope.currentTeams = {red:[],blue:[]};

});
app.controller('MyCtrl1', function ($scope) {
  $scope.hello = 'test';

});
app.controller('MyCtrl2', function ($scope) {
  $scope.hello = 'test';

});
app.controller('MasterMatchViewCtrl', function ($scope, $rootScope, $location) {

  $scope.redTeams = $rootScope.currentTeams.red;
  $scope.blueTeams = $rootScope.currentTeams.blue;

  $scope.startMatch = function() {
    if(!$scope.matchRunning) {
      requestAnimationFrame($scope.bar);
    }
  };
  /*
    reset: coded for in HTML
      ISSUE: when match is restarted, it goes back to where it was
        after match is over reset, it just doesn't work period
    pause: coded for in HTML
  */

  var MATCH_LENGTH = 150000;

  var start;
  var percentCompleted = 0;
  $scope.barColorClass = "progress-bar-success";

  $scope.bar = function bar(time) {
    start = start || time;
    
    if($scope.matchRunning && time - start < MATCH_LENGTH) {
      percentCompleted = 100*((time - start)/MATCH_LENGTH);
      
      //$apply allows for us to update the DOM as quickly as we need. Additional changes register quickly
      $scope.$apply(function() {
        //really an ng-style directive, but I only use it for this
        $scope.barWidth = {'width':percentCompleted+"%"};
        $scope.timeLeft = formatMilliseconds(MATCH_LENGTH - (time - start));

        //sounds and color changes in bar
        //for final 30 seconds
        if($scope.timeLeft === '0:30') {
          $scope.barColorClass = "progress-bar-warning";
        }

        //add
        // end of autonomous (sound, color change)
        // last 10 seconds (red)
        // sound for last 30 sec.
      });
        
      //if($scope.matchRunning) {
        //recursive progress bar animation call
        requestAnimationFrame($scope.bar);
      //}
    }

    else {
      //do server stuff - pass data to next page - etc.
      //does not move to next page until pause is pressed - why?
      $location.path('/verify');
    }
  };
});

app.controller('MasterMatchInputCtrl', function ($scope, $rootScope, $location) {
  $scope.redTeams = [];
  $scope.blueTeams = [];

  $scope.createMatch = function() {
    //returns a duplicate free array (a team can't play itself)
    var uniqValArray = $scope.redTeams.concat($scope.blueTeams).uniq();
    if(uniqValArray.length === 6 && validateTeams($scope.redTeams) && validateTeams($scope.blueTeams)) {
      //sets rootScope currentTeams

      //send socket.io event and wait for server validation.

      //this is reactive... WHY???
      $rootScope.currentTeams.red = $scope.redTeams;
      $rootScope.currentTeams.blue = $scope.blueTeams;

      $location.path('/master');
    }
    else {
      throw new Error('teams do not work, please enter valid team ids');
    }

    //send request to server
  };
});

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

app.controller('MyCtrl5', function ($scope) {
  $scope.hello = 'test';

});
app.controller('MyCtrl6', function ($scope) {
  $scope.hello = 'test';

});
app.controller('MyCtrl7', function ($scope) {
  $scope.hello = 'test';

});
app.controller('MyCtrl8', function ($scope) {
  $scope.hello = 'test';

});


//Service, directive, and filter
app.directive('appVersion', function (version) {
  return function(scope, elm, attrs) {
    elm.text(version);
  };
});

app.value('version', '0.1');

app.filter('interpolate', function (version) {
  return function (text) {
    return String(text).replace(/\%VERSION\%/mg, version);
  }
});
