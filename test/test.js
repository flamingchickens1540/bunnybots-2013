var expect = require('expect.js');


//example
describe('Array', function(){
  describe('#indexOf()', function(){
    it('should return -1 when the value is not present', function(){
      expect(-1).to.be([1,2,3].indexOf(5));
      expect(-1).to.be([1,2,3].indexOf(0));
    })
  })
})