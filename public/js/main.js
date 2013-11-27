'use strict';

// Declare app level module which depends on filters, and services

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
      controller: 'MyCtrl3'
    }).

    when('/input', {
      templateUrl: 'partials/master_match_input',
      controller: 'MyCtrl4'
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

app.controller('AppCtrl', function ($scope, $http) {

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

});
app.controller('MyCtrl1', function ($scope) {
  $scope.hello = 'test';

});
app.controller('MyCtrl2', function ($scope) {
  $scope.hello = 'test';

});
app.controller('MyCtrl3', function ($scope) {
  $scope.hello = 'test';

});
app.controller('MyCtrl4', function ($scope) {
  $scope.hello = 'test';

});
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
