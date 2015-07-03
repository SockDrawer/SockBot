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
		var mockRoll = sandbox.stub(diceModule, "roll").yields(2,[2]);
		var match = {
			reroll: false,
			num: 1,
			target: 7
		}
		diceModule.rollWolfDice(match, function(response) {
			assert.include(response,'Rolling 1d10 Target: 7: ');
			assert.include(response,'2');
			assert.include(response,'Successes: 0');
			done();
		});
	});
	
	it("should roll one die vs TN 7 and succeed", function(done) {		
		var mockRoll = sandbox.stub(diceModule, "roll").yields(8,[8]);
		var match = {
			reroll: false,
			num: 1,
			target: 7
		}
		diceModule.rollWolfDice(match, function(response) {
			assert.include(response,'Rolling 1d10 Target: 7: ');
			assert.include(response,'8');
			assert.include(response,'Successes: 1');
			done();
		});
	});
});