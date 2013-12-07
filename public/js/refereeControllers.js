var refs = angular.module('bunnybots2013.refereeControllers', [
	'btford.socket-io', 
	'bunnybots2013.factories',
	'ngTouch'
]);

refs.controller('RefereeCtrl', function ($scope, socket) {

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
    if((color === 'red' || color === 'blue') &&  typeof num === 'number') {
      $scope[color+'Score'] += num;

      if(type === 'fouls') {
      	//negative scoreChange = positive foul count
        $scope[color+'Fouls'] += (num < 0)? 1 : -1;
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
      var camelCased = type[0].toUpperCase() + type.slice(1)

      var dataObj = {
        color: color,
        type: camelCased, //upper case Score or Fouls
        scoreChange: num
      };

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
    $scope[data.color+'Score'] += data.scoreChange;

    if(data.type === 'fouls') {
      //a negative penalty means an extra foul, else a plus foul
      $scope[data.color+'Fouls'] += (data.scoreChange < 0)? 1 : -1;
      console.log($scope[data.color+'Fouls']);
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
