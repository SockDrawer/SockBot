var diceModule = require('../sock_modules/dice.js');
var assert = require('chai').assert;
var sinon = require('sinon');

var request = require('request');

describe("roll", function() {
	var sandbox;
	
	beforeEach(function(){
	  sandbox = sinon.sandbox.create();
	});
	
	afterEach(function() {
		sandbox.restore();
	})
	
	
	it("should roll one die", function(done) {
		var mockRequest = sandbox.stub(request, "get").yields(null,200,"1\n");
		
		diceModule.roll(1,6,null, function(sum, results) {
			assert.equal(sum,1,"Sum was not calculated correctly");
			assert.lengthOf(results, 1,"One die should be rolled");			
			assert.equal(results[0],1, "Individual dice not reported correctly");
			done();
		});
	});
	
	it("should roll two die", function(done) {
		var mockRequest = sandbox.stub(request, "get").yields(null,200,"1\n1\n");
		
		diceModule.roll(2,6,null, function(sum, results) {
			assert.equal(sum,2,"Sum was not calculated correctly");
			assert.lengthOf(results, 2,"Two die should be rolled");			
			assert.equal(results[0],1, "Individual dice not reported correctly");
			assert.equal(results[1],1, "Individual dice not reported correctly");
			done();
		});
	});
	
	it("should roll red die", function(done) {
		var mockRequest = sandbox.stub(request, "get").yields(null,200,"12\n");
		
		diceModule.roll(1,20,null, function(sum, results) {
			assert.equal(sum,12,"Sum was not calculated correctly");
			assert.lengthOf(results, 1,"One die should be rolled");			
			assert.equal(results[0],12, "Individual dice not reported correctly");
			done();
		});
	});
	
	it("should roll blue die", function(done) {
		var mockRequest = sandbox.stub(request, "get").yields(null,200,"2\n");
		
		diceModule.roll(1,2,null, function(sum, results) {
			assert.equal(sum,2,"Sum was not calculated correctly");
			assert.lengthOf(results, 1,"One die should be rolled");			
			assert.equal(results[0],2, "Individual dice not reported correctly");
			done();
		});
	});
	
	it("should normalize negative die", function(done) {
		var mockRequest = sandbox.stub(request, "get").yields(null,200,"2\n2\n");
		
		diceModule.roll(-2,6,null, function(sum, results) {
			assert.equal(sum,4,"Sum was not calculated correctly");
			assert.lengthOf(results, 2,"Two die should be rolled");			
			assert.equal(results[0],2, "Individual dice not reported correctly");
			assert.equal(results[1],2, "Individual dice not reported correctly");
			done();
		});
	});
	
	it("should normalize negative sides", function(done) {
		var mockRequest = sandbox.stub(request, "get").yields(null,200,"2\n");
		
		diceModule.roll(1,-6,null, function(sum, results) {
			assert.equal(sum,-2,"Sum was not calculated correctly");
			assert.lengthOf(results, 1,"One die should be rolled");			
			assert.equal(results[0],-2, "Individual dice not reported correctly");
			done();
		});
	});
	
	it("should not reroll below the threshold", function(done) {
		var mockRequest = sandbox.stub(request, "get").yields(null,200,"1\n2\n3\n4\n5\n");
		
		diceModule.roll(5,6,6, function(sum, results) {
			assert.equal(sum,15,"Sum was not calculated correctly");
			assert.lengthOf(results, 5,"Five die should be rolled");			
			done();
		});
	});
	
	it("should reroll above the threshold", function(done) {
		var mockRequest = sandbox.stub(request, "get").yields(null,200,"6\n6\n6\n6\n1\n");
		
		diceModule.roll(2,6,6, function(sum, results) {
			assert.equal(sum,25,"Sum was not calculated correctly");
			assert.lengthOf(results, 5,"Five die should be rolled");			
			done();
		});
	});
});

describe("prerollDice", function() {
	var sandbox;
	
	beforeEach(function(){
	  sandbox = sinon.sandbox.create();
	});
	
	afterEach(function() {
		sandbox.restore();
	})
	
	
	it("should roll one die", function() {		
		var numDice = diceModule.prerollDice(1,6);
		assert.equal(numDice,1,"One die should be rolled");
	});
	
	it("should roll ten die", function() {		
		var numDice = diceModule.prerollDice(10,6);
		assert.equal(numDice,10,"Ten die should be rolled");
	});
});

describe("WhiteWolf Dice", function() {
	var sandbox;
	
	beforeEach(function(){
	  sandbox = sinon.sandbox.create();
	});
	
	afterEach(function() {
		sandbox.restore();
	})
	
	
	it("should roll one die vs TN 7 and fail", function(done) {		
		var mockRoll = sandbox.stub(diceModule, "roll").yields(2,[[2]]);
		var match = {
			reroll: false,
			num: 1,
			target: 7
		}
		diceModule.rollWolfDice(match, function(response) {
			assert.include(response,'Successes: 0');
			done();
		});
	});
	
	it("should roll one die vs TN 7 and succeed", function(done) {		
		var mockRoll = sandbox.stub(diceModule, "roll").yields(8,[[8]]);
		var match = {
			reroll: false,
			num: 1,
			target: 7
		}
		diceModule.rollWolfDice(match, function(response) {
			assert.include(response,'Successes: 1');
			done();
		});
	});
	
	it("should default to TN 8", function(done) {		
		var mockRoll = sandbox.stub(diceModule, "roll").yields(11,[[9,2]]);
		var match = {
			reroll: false,
			num: 2
		}
		diceModule.rollWolfDice(match, function(response) {
			assert.include(response,'Successes: 1');
			done();
		});
	});
	
	it("should default to ten dice", function(done) {		
		var mockRoll = sandbox.stub(diceModule, "roll").yields(10,[[1,1,1,1,1,1,1,1,1,1]]);
		var match = {
			reroll: false
		}
		diceModule.rollWolfDice(match, function(response) {
			assert(mockRoll.getCall(0).calledWith(10,10, undefined),"Correct arguments should be passed; instead received " + mockRoll.getCall(0).args);
			assert.include(response,'Successes: 0');
			done();
		});
	});
	
	it("should cap at 20 dice", function(done) {		
		var match = {
			num: 200
		}
		diceModule.rollWolfDice(match, function(response) {
			assert.include(response,"Error Too many dice requested");
			done();
		});
	});
	
	it("should not reroll non-tens", function(done) {		
		var mockRoll = sandbox.stub(diceModule, "roll").yields(11,[[9,2]]);
		var match = {
			reroll: true,
			num: 2
		}
		diceModule.rollWolfDice(match, function(response) {
			assert.include(response,'Successes: 1');
			assert.notInclude(response,"Rerolling");
			done();
		});
	});
	
	it("should reroll tens", function(done) {		
		var mockRoll = sandbox.stub(diceModule, "roll").yields(11,[[10,2],[2]]);
		var match = {
			reroll: true,
			num: 2
		}
		diceModule.rollWolfDice(match, function(response) {
			assert.include(response,'Successes: 1');
			assert.include(response,"Rerolling 1d10");
			done();
		});
	});
	
	it("should reroll multiple tens", function(done) {		
		var mockRoll = sandbox.stub(diceModule, "roll").yields(11,[[10,10],[2,2]]);
		var match = {
			reroll: true,
			num: 2
		}
		diceModule.rollWolfDice(match, function(response) {
			assert.include(response,'Successes: 2');
			assert.include(response,"Rerolling 2d10");
			done();
		});
	});
	
	it("should preroll", function(done) {		
		var mockRoll = sandbox.stub(diceModule, "roll").yields(11,[[10,10],[2,2]]);
		var mockPreroll = sandbox.stub(diceModule, "prerollDice").returns(1);
		var match = {
			reroll: true,
			preroll: true,
			num: 2
		}
		diceModule.rollWolfDice(match, function(response) {
			assert.include(response,'Successes: 2');
			assert.include(response,"Prerolling 1 times");
			assert(mockPreroll.called);
			done();
		});
	});
	
	it("should accept bonuses", function(done) {		
		var mockRoll = sandbox.stub(diceModule, "roll").yields(2,[[2]]);
		var match = {
			reroll: false,
			num: 1,
			target: 7,
			bonus: 2
		}
		diceModule.rollWolfDice(match, function(response) {
			assert.include(response,'Successes: 2');
			done();
		});
	});
});

describe("Fudge Dice", function() {
	var sandbox;
	
	beforeEach(function(){
	  sandbox = sinon.sandbox.create();
	});
	
	afterEach(function() {
		sandbox.restore();
	})
	
	
	it("should convert 5 and 6 to +", function(done) {		
		var mockRoll = sandbox.stub(diceModule, "roll").yields(11,[[5,6]]);
		var match = {
			num: 2
		}
		diceModule.rollFudgeDice(match, function(response) {
			assert.include(response,'Total: 2');
			assert.include(response,'++');
			assert.notInclude(response, '5');
			assert.notInclude(response, '6');
			done();
		});
	});
	
	it("should convert 1 and 2 to -", function(done) {		
		var mockRoll = sandbox.stub(diceModule, "roll").yields(3,[[1,2]]);
		var match = {
			num: 2
		}
		diceModule.rollFudgeDice(match, function(response) {
			assert.include(response,'Total: -2');
			assert.include(response,'--');
			assert.notInclude(response, '1');
			done();
		});
	});
	
	it("should convert 3 and 4 to 0", function(done) {		
		var mockRoll = sandbox.stub(diceModule, "roll").yields(7,[[3,4]]);
		var match = {
			num: 2
		}
		diceModule.rollFudgeDice(match, function(response) {
			assert.include(response,'Total: 0');
			assert.include(response,'00');
			assert.notInclude(response, '3');
			assert.notInclude(response, '4');
			done();
		});
	});
	
	it("should default to four dice", function(done) {		
		var mockRoll = sandbox.stub(diceModule, "roll").yields(4,[[1,1,1,1]]);
		var match = {
		}
		diceModule.rollFudgeDice(match, function(response) {
			assert(mockRoll.getCall(0).calledWith(4,6, undefined),"Correct arguments should be passed; instead received " + mockRoll.getCall(0).args);
			done();
		});
	});
	
	it("should cap at 20 dice", function(done) {		
		var match = {
			num: 200
		}
		diceModule.rollFudgeDice(match, function(response) {
			assert.include(response,"Error Too many dice requested");
			done();
		});
	});
});

describe("XDice", function() {
	var sandbox;
	
	beforeEach(function(){
	  sandbox = sinon.sandbox.create();
	});
	
	afterEach(function() {
		sandbox.restore();
	})
	
	it("should roll 1d20", function(done) {
		var match = {
			num: 1,
			sides: 20
		}
		var mockRoll = sandbox.stub(diceModule, "roll").yields(1,[[1]]);
		
		diceModule.rollXDice(match, function(response) {
			assert(mockRoll.getCall(0).calledWith(1,20, undefined),"Correct arguments should be passed; instead received " + mockRoll.getCall(0).args);
			assert.include(response,'Rolling 1d20: 1');
			done();
		});
	});
	
	it("should roll 2d20", function(done) {
		var match = {
			num: 2,
			sides: 20
		}
		var mockRoll = sandbox.stub(diceModule, "roll").yields(2,[[1,1]]);
		
		diceModule.rollXDice(match, function(response) {
			assert(mockRoll.getCall(0).calledWith(2,20, undefined),"Correct arguments should be passed; instead received " + mockRoll.getCall(0).args);
			assert.include(response,'Rolling 2d20: 1, 1');
			assert.include(response,'Sum: 2');
			done();
		});
	});
	
	it("should roll 2d4", function(done) {
		var match = {
			num: 2,
			sides: 4
		}
		var mockRoll = sandbox.stub(diceModule, "roll").yields(2,[[1,1]]);
		
		diceModule.rollXDice(match, function(response) {
			assert(mockRoll.getCall(0).calledWith(2,4, undefined),"Correct arguments should be passed; instead received " + mockRoll.getCall(0).args);
			assert.include(response,'Rolling 2d4: 1, 1');
			assert.include(response,'Sum: 2');
			done();
		});
	});
	
	it("should not reroll non-crits", function(done) {		
		var mockRoll = sandbox.stub(diceModule, "roll").yields(11,[[9,2]]);
		var match = {
			reroll: true,
			num: 2,
			sides:10
		}
		diceModule.rollXDice(match, function(response) {
			assert(mockRoll.getCall(0).calledWith(2,10,10),"Correct arguments should be passed; instead received " + mockRoll.getCall(0).args);
			assert.include(response,'Rolling 2d10: 9, 2');
			assert.notInclude(response,"Rerolling");
			assert.include(response,'Sum: 11');
			done();
		});
	});
	
	it("should reroll crits", function(done) {		
		var mockRoll = sandbox.stub(diceModule, "roll").yields(14,[[10,2],[2]]);
		var match = {
			reroll: true,
			num: 2,
			sides: 10
		}
		diceModule.rollXDice(match, function(response) {
			assert(mockRoll.getCall(0).calledWith(2,10,10),"Correct arguments should be passed; instead received " + mockRoll.getCall(0).args);
			assert.include(response,'Rolling 2d10: 10, 2');
			assert.include(response,"Rerolling 1 Crits:2");
			assert.include(response,'Sum: 14');
			done();
		});
	});
	
	it("should reroll multiple crits", function(done) {
		var mockRoll = sandbox.stub(diceModule, "roll").yields(24,[[10,10],[2,2]]);
		var match = {
			reroll: true,
			num: 2,
			sides: 10
		}
		diceModule.rollXDice(match, function(response) {
			assert(mockRoll.getCall(0).calledWith(2,10,10),"Correct arguments should be passed; instead received " + mockRoll.getCall(0).args);
			assert.include(response,'Rolling 2d10: 10, 10');
			assert.include(response,"Rerolling 2 Crits:2, 2");
			assert.include(response,'Sum: 24');
			done();
		});
	});
	
	it("should preroll", function(done) {		
		var mockRoll = sandbox.stub(diceModule, "roll").yields(11,[[10,10],[2,2]]);
		var mockPreroll = sandbox.stub(diceModule, "prerollDice").returns(1);
		var match = {
			reroll: true,
			preroll: true,
			num: 2,
			sides: 10
		}
		diceModule.rollXDice(match, function(response) {
			assert.include(response,"Prerolling 1 times");
			assert(mockPreroll.called);
			done();
		});
	});
	
	it("should cap at 20 dice", function(done) {		
		var match = {
			reroll: true,
			preroll: true,
			num: 200,
			sides: 10
		}
		diceModule.rollXDice(match, function(response) {
			assert.include(response,"Error Too many dice requested");
			done();
		});
	});
});

describe("handleInput", function() {
	var sandbox;
	
	beforeEach(function(){
	  sandbox = sinon.sandbox.create();
	});
	
	afterEach(function() {
		sandbox.restore();
	});
	
	it("should delegate to Parser", function(done) {		
		var mockParser = sandbox.stub(diceModule, "parser").callsArg(2);
		var payload = {
			dice: '1d20'
		}
		
		diceModule.handleInput(payload, function(response) {
			assert(mockParser.called);
			assert(mockParser.getCall(0).calledWith('1d20'),"Correct arguments should be passed; instead received " + mockParser.getCall(0).args);
			done();
		});
	});

});

describe("rollDice", function() {
	var sandbox;
	
	beforeEach(function(){
	  sandbox = sinon.sandbox.create();
	});
	
	afterEach(function() {
		sandbox.restore();
	});
	
	it("should delegate fate dice", function(done) {		
		var mockImpl = sandbox.stub(diceModule, "rollFudgeDice").yields();
		var match = {
			method: 'fate'
		}
		
		diceModule.rollDice(match, function(response) {
			assert(mockImpl.called);
			assert(mockImpl.getCall(0).calledWith(match),"Correct arguments should be passed; instead received " + mockImpl.getCall(0).args);
			done();
		});
	});
	
	it("should delegate white wolf dice", function(done) {		
		var mockImpl = sandbox.stub(diceModule, "rollWolfDice").yields();
		var match = {
			method: 'wolf'
		}
		
		diceModule.rollDice(match, function(response) {
			assert(mockImpl.called);
			assert(mockImpl.getCall(0).calledWith(match),"Correct arguments should be passed; instead received " + mockImpl.getCall(0).args);
			done();
		});
	});
	
	it("should delegate normal dice by default", function(done) {		
		var mockImpl = sandbox.stub(diceModule, "rollXDice").yields();
		var match = {
		}
		
		diceModule.rollDice(match, function(response) {
			assert(mockImpl.called);
			assert(mockImpl.getCall(0).calledWith(match),"Correct arguments should be passed; instead received " + mockImpl.getCall(0).args);
			done();
		});
	});
	
	it("should reject other methods", function(done) {		
		var match = {
			method: 'banana'
		}
		
		diceModule.rollDice(match, function(response) {
			assert.equal(response, "Not implemented");
			done();
		});
	});

});