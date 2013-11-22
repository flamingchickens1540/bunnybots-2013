'use strict';

// Declare app level module which depends on filters, and services

var app = angular.module('bunnybots2013', ['ngRoute']);

app.config(function ($routeProvider, $locationProvider) {
  $routeProvider.

    when('/view1', {
      templateUrl: 'partials/partial1',
      controller: 'MyCtrl1'
    }).

    when('/view2', {
      templateUrl: 'partials/partial2',
      controller: 'MyCtrl2'
    }).
    
    otherwise({
      redirectTo: '/view1'
    });

  $locationProvider.html5Mode(true);
});

app.controller('AppCtrl', function ($scope, $http) {

  $http({
    method: 'GET',
    url: '/api/name'
  }).
  success(function (data, status, headers, config) {
    $scope.name = data.name;
  }).
  error(function (data, status, headers, config) {
    $scope.name = 'Error!'
  });

});
app.controller('MyCtrl1', function ($scope) {
  // write Ctrl here

});
app.controller('MyCtrl2', function ($scope) {
  // write Ctrl here

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
