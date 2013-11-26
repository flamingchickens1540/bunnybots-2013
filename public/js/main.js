'use strict';

// Declare app level module which depends on filters, and services

var app = angular.module('bunnybots2013', ['ngRoute']);

app.config(function ($routeProvider, $locationProvider) {
  $routeProvider.

    when('/', {
      templateUrl: 'partials/master_match_view',
      controller: 'MyCtrl1'
    }).

    when('/match_view', {
      templateUrl: 'partials/public_match_view',
      controller: 'MyCtrl2'
    }).

    when('/partial2', {
      templateUrl: 'partials/partial2',
      controller: 'MyCtrl3'
    })
    
    //default - turn off for development
    //otherwise({
      //redirectTo: '/view1'
    //});
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
