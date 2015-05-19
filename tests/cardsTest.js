var Deck = require('../sock_modules/cardDeck.js');
var assert = require('chai').assert

describe("Deck", function() {
	it("should exist", function() {
		var d = new Deck({"cards": ["Ace"]});
		assert.isObject(d);
	});
	
	it("should allow drawing cards", function() {
		var d = new Deck({"cards": ["Ace"]});
		var card = d.draw();
		assert.equal("Ace", card);
	});
	
	it("should draw different cards each time", function() {
		var d = new Deck({"cards": ["Ace", "Two"]});
		var card = d.draw();
		assert.isTrue(card === "Ace" || card === "Two");
		var card2 = d.draw();
		assert.notEqual(card, card2);
	});
	
	it("should return undefined when it runs out of cards", function() {
		var d = new Deck({"cards": ["Ace", "Two"]});
		var card = d.draw();
		var card2 = d.draw();
		var card3 = d.draw();
		assert.isUndefined(card3);
	});
	
	it("should allow shuffling", function() {
		var d = new Deck({"cards": ["Ace", "Two"]});
		d.shuffle();
	});
	
	it("should replenish the deck when shuffled", function() {
		var d = new Deck({"cards": ["Ace", "Two"]});
		var card = d.draw();
		var card2 = d.draw();
		var card3 = d.draw();
		assert.isUndefined(card3);
		d.shuffle();
		var card4 = d.draw();
		assert.isDefined(card4);
	});
})