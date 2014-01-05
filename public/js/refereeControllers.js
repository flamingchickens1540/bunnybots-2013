var refs = angular.module('bunnybots2013.refereeControllers', [
	'btford.socket-io', 
	'bunnybots2013.factories',
	'ngTouch'
]);

refs.controller('RefereeCtrl', function ($scope, socket, timeFormat) {

  //default is disabled or enabled? which should I choose?

  var reset = function() {
    //enable all buttons
    $scope.redFouls = 0;
    $scope.redScore = 0;
    $scope.blueFouls = 0;
    $scope.blueScore = 0;
    //reset hole color
    $scope.timeLeft = '2:30';
    $scope.holeColor = 'None';
    $scope.eightBallOutOfPlay = false;
    $scope.redPenalties = 0;
    $scope.bluePenalties = 0;
    $scope.redTechnicals = 0;
    $scope.blueTechnicals = 0;
  };

  $scope.reset = reset;


  var editStats = function editStats(color, type, num) {
    if((color === 'red' || color === 'blue') &&  typeof num === 'number') {
      if(type === 'score') {
      	//deafults to the hole's bunny color if there is one, else the evented color
      	
      	//8-ball penalty remains with same color
      	if(($scope.holeColor === 'Red' || $scope.holeColor === 'Blue') && num === -8) {
      		color = color;
      	}
      	else { //if num === 8, holeColor is none
          //Red => red
      		color = ($scope.holeColor === 'None')? color : $scope.holeColor.toLowerCase();
      	}
      }

      //$scope.apply(function() {
        $scope[color+'Score'] += num;
      //});

      if(type === 'fouls') {
        //two types of fouls
        if(Math.abs(num) === 5) { //then it is a normal penalty
          $scope[color+'Penalties'] -= num;
        }
        else if(Math.abs(num) === 10) {
          $scope[color+'Technicals'] -= num;
        }

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

      var dataObj = {
        color: color,
        type: type, //upper case Score or Fouls
        scoreChange: num
      };

      socket.emit('referee:input', dataObj);
    }
  };

  $scope.changeHoleColor = function(newColor) {
  	var timeElapsed = timeFormat.MATCH_LENGTH - timeFormat.formatTimerOutput($scope.timeLeft);
  	//autonomous lasts 15 seconds
  	if(timeElapsed <= 25000) {
  		$scope.holeColor = newColor || 'None';
  	}
  };

  $scope.eightBallScored = function(color, wasLegal) {
  	if((color === 'red' || color === 'blue') && !$scope.eightBallOutOfPlay) {
  		$scope.eightBallOutOfPlay = true;
      //emit eight ball scored event
      socket.emit('referee:eight-ball-scored', true);

  		//due to other balls on the field
  		if(!wasLegal) {
  			$scope.emitRefereeInput(color, 'fouls', -8);
  		}
  		else {
  			//timeLeft in the match < 20 seconds - black balls legit (+8), else (-8)
	  		var scoreChangeDueToEightBall = (timeFormat.formatTimerOutput($scope.timeLeft) <= 20000)? 8 : -8;
	  		var type = 'score';
	  		if(scoreChangeDueToEightBall === 8) {
	  			//the bunny hole points go to the owner of the bunny hole
	  			//only if it is a psitive score
	  			color = $scope.holeColor || color;
	  		}
	  		else {
	  			type = 'fouls';
	  			color = color;
	  		}
	  		$scope.emitRefereeInput(color, type, scoreChangeDueToEightBall);
  		}
  	}
  };

  socket.on('match:init', reset);
  socket.on('match:reset', reset);

  socket.on('match:tick', function(data) {
    $scope.timeLeft = data.timeLeft;
  });

  socket.on('referee:eight-ball-scored', function(scored) {
    if(scored === true) {
      $scope.eightBallOutOfPlay = true;
    }
  });

  /*socket.on('referee:input', function(data) {
    //should only be one key value pair per signal
    $scope[data.color+'Score'] += data.scoreChange;

    if(data.type === 'fouls') {
      //two types of fouls
      if(Math.abs(data.scoreChange) === 5 || Math.abs(data.scoreChange) === 8) { //then it is a normal penalty
        $scope[data.color+'Penalties'] -= data.scoreChange;
      }
      else if(Math.abs(data.scoreChange) === 10) {
        $scope[data.color+'Technicals'] -= data.scoreChange;
      }

      //a negative score means a positive penalty
      $scope[data.color+'Fouls'] -= data.scoreChange;
    }
  });*/

  socket.on('match:end', function(data) {
    //show message in timeLeft
    //disable buttons
  });

  socket.on('match:recorded', function(data) {
    //timeLeft = waiting for next match
  });
});
