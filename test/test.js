//LETTER TO HAMZAH KHAN GHENGIS KHAN: I HAVE NO IDEA WHAT I AM DOING, AND MOST OF THESE TEST CASES RELY ON STUFF ALREADY HAVING BEEN MADE IN A FAKE DATABASE OR SOMETHING
//SO THEY WILL NOT RUN PROPERLY. ALSO, I AM NOT SURE HOW TO EXPECT AN ERROR, SO IN MOST OF THESE I JUST MADE IT EXPECT THE CALLBACK ERROR TO NOT BE FALSE...
//ALSO I HAVE NO IDEA HOW TO DEAL WITH MULTIPLE TEAMS, LIKE ARRAYS OF TEAM OBJECTS OR WHATEVER THAT IS, SO I WAS UNABLE TO WRITE TEST CASES FOR FUNCTIONS 
//THAT REFERENCED  MULTIPLE TEAMS AS IN AN ARRAY OR SOMETHING. ALSO I AM NOT SURE IF I AM DEALING WITH CALLBACKS PROPERLY, OR EVEN THINKING ABOUT THEM PROPERLY.
//SO PLEASE EXPLAIN ALL OF THIS AND TELL ME HOW I CAN FIX THESE BECAUSE THIS IS THE BEST I COULD DO WITH MY VERY LIMITED KNOWLEDGE






var expect = require('expect.js');


it('should connect to the database', function(done) {
  //checking to make sure that dbConnect is a function
  expect(dbConnect).to.be.a(Function);

  //if i call it with no database name it should default to bunnybots2013test and return true
  expect(dbConnect()).to.equal(true);

  //if I call it with a fake database name the callback should be null which is falsy right????
  expect(dbConnect("asdf").to.equal(false);

  done();
});

it('should get a team', function(done) {
  //checking to make sure that dbGetTeam is a function
  expect(dbGetTeam).to.be.a(Function);
  
  //call dbGetTeam on the fake database made in dbTest with an id of 1, and giving it a callback function that will have an error (or not) and the team object i wanted
  dbGetTeam('1', function(err, team) {

    //checking to see if the returned team object has an id value of 1 as it should
    expect(team.id).to.equal('1');

    //checking to see if the returned team object has a name value of 'a' as it should
    expect(team.name).to.equal('a');

    //check to see that err should be null, which would make it falsy... right?
    expect(err).to.equal(false);
  });

  //call dbGetTeam on the fake database made in dbTest with and id of 9001, a team id that isn't in the database
  dbGetTeam('9001',function(err,team) {
    //I'm not sure what the error would be, but i know it wouldn't be false so can i just do that????
    expect(err).to.not.equal(false);

    //team should be null, so it should be falsy right?
    expect(team).to.equal(false);
  });

  done();
  
});


it('should get teams', function(done) {
  //checking to make sure that dbGetTeams is a function
  expect(dbGetTeams).to.be.a(Function);

  //AAANND I HAVE NO IDEA WHAT TO DO!!??!? I BLOW MY FIGURATIVE HORN OF GONDOR TO CALL HAMZAH TO SAVE US
  hornofgondor.blow("HAMZAH");

});

it('should create a team', function(done) {
  //check to see if dbCreateTeam is a function
  expect(dbCreateTeam).to.be.a(Function);

  //calling dbCreateTeam with a string id of 1540, and a string name of FlamingSwag, which means that it should work fully
  dbCreateTeam('1540','FlamingSwag',function(err,team){
    //checking to see if the returned team object has an id value of '1540' as it should
    expect(team.id).to.equal('1540');

    //checking to see if the returned team object has a name value of 'FlamingSwag' as it should
    expect(team.name).to.equal('FlamingSwag');

    //check to see that err should be null, which would make it falsy... right?
    expect(err).to.equal(false);

  });

  //calling dbCreateTeam on the same id and name that I gave it above, which should give me an error right?
  dbCreateTeam('1540','FlamingSwag',function(err,team){
    //once again, i'm not sure what the error should be
    expect(err).to.not.equal(false);

    //team should be null, so it should be falsy right?
    expect(team).to.equal(false);
  });

  //calling dbCreateTeam without an id, which should return some error and a null team
  dbCreateTeam('FlamingSwag',function(err,team){
    //once again, i'm not sure what the error should be
    expect(err).to.not.equal(false);

    //team should be null, so it should be falsy right?
    expect(team).to.equal(false);
  });

  //calling dbCreateTeam on a non string id which should give me some error and a null team
  dbCreateTeam(1540,'FlamingSwag',function(err,team){
    //once again, i'm not sure what the error should be
    expect(err).to.not.equal(false);

    //team should be null, so it should be falsy right?
    expect(team).to.equal(false);
  });

  done();

});

it('should remove a team', function(done){
  //check to see if dbRemoveTeam is a function
  expect(dbRemoveTeam).to.be.a(Function);

  //try to remove a team that is there with a valid id
  dbRemoveTeam('1',function(err){
    //error should be null (falsy) because it should remove succesfully
    expect(err).to.equal(false);

  });

  //try to remove a team that is not there
  dbRemoveTeam('1213123',function(err){
    //not sure what the error should be but it shouldn't be false
    expect(err).to.not.equal(false);
  }); 

  //try to remove a team with a non-string id
  dbRemoveTeam(1,function(err){
    //not sure what the error should be but it shouldn't be false
    expect(err).to.not.equal(false);
  }); 

  done();

});

//FOR dbUpdateTeam I ONCE AGAIN HAVE NO IDEA WHAT TO DO like is it updating the points or the name or what and if so what is the callback?!?! HAMZZAHHH

//AND FOR dbNewMatch I don't know what to do because it is using not only multiple teams (which I don't know how to do), but it is using some object that has red
// and blue properties which hold teams??!!?! what? and what is the callback?!

it('should update the match',function(done){
  //check to see if dbUpdateMatch is a function
  expect(dbUpdateMatch).to.be.a(Function);

  //try to update the match with a valid matchid and updateObj
  dbUpdateMatch(1,updateObj,function(err){
    //err should be false
    expect(err).to.equal(false);
  });

  //try to update the match with an invalid matchid
  dbUpdateMatch("asdf",updateObj,function(err){
    //err should be an error with the string value'db#finishMatch: BAD ARGUMENTS'
    expect(err).to.equal(new Error('db#finishMatch: BAD ARGUMENTS'));
  });
  done();
});


//THEORETICAL MATCH: match.id=1,match.time=123,match.redScore=5,match.redFouls=5,match.blueScore=10,match.blueFouls=10   
//(I left out match.redTeams and match.blueTeams because i dont understand those)
it('should get a match',function(done){
  //check to see if dbGetMatch is a function
  expect(dbGetMatch).to.be.a(Function);

  //try to get the match returned from a valid matchid (I am going to be using a theoretical match with a matchid of 1)
  dbGetMatch(1,function(err,match){
    //err should be false
    expect(err).to.equal(false);

    //check all values of match for what they should be
    expect(match.id).to.equal(1);
    expect(match.time).to.equal(123);
    expect(match.redScore).to.equal(5);
    expect(match.redFouls).to.equal(5);
    expect(match.blueScore).to.equal(10);
    expect(match.blueScore).to.equal(10);
  });

  //try to get the match returned from an invalid matchid
  dbGetMatch(1231234,function(err,match){
    //match should be false
    expect(match).to.equal(false);

    //what the error should be
    expect(err).to.equal(new Error('can not get match '+ matchId +' from database with current arguments'));
  });

  done();

});

//ASSUMING THERE IS A MATCH IN THE DATABASE WITH AN ID OF 1
it('should remove a match',function(done){
  //check to see if dbRemoveMatch is a function
  expect(dbRemoveMatch).to.be.a(Function);

  //try to remove a match that is there, then check to see if it is in the database
  dbRemoveMatch(1,function(err){
    //err should be false
    expect(err).to.equal(false);

    //try to getMatch from the database the match we just removed
    dbGetMatch(1,function(err,match){
      //match should be false
      expect(match).to.equal(false);

      //what the error should be
      expect(err).to.equal(new Error('can not get match '+ matchId +' from database with current arguments'));
    });

  });

  //try to remove a match with an invalid id
  dbRemoveMatch("asdf",function(err){
    //there should be some error, not sure what though (can i expect a console log or something??!)
    expect(err).to.not.equal(false);
  });

  done();

});

