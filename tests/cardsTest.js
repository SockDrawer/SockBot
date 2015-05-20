var Deck = require('../sock_modules/cardDeck.js');
var cardsModule = require('../sock_modules/cards.js');
var assert = require('chai').assert;

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

describe("DeckModule", function() {
	var responseRegex = /^Success! Your deck is (\w+)$/;
	
	it("should be able to create a deck", function(done) {
		cardsModule.createDeck({Type: "French52"}, function(err, response) {
			assert.include(response,"Success");
			done();
		});
	});
	
	it("should reject a bad deck type", function(done) {
		cardsModule.createDeck({Type: "banana"}, function(err, response) {
			assert.notInclude(response,"Success");
			done();
		});
	});
	
	it("should be able to draw a card", function(done) {
		cardsModule.createDeck({Type: "French52"}, function(err, response) {
			assert.isTrue(responseRegex.test(response));
			var result = response.match(responseRegex);
			var deckName = result[1];
			
			cardsModule.drawCard({deck: deckName}, function(err, response) {
				assert.include(response,"Your card: ");
				done();
			});
		});
	});
	
	it("should not be able to draw a card from a nonexistant deck", function(done) {
		cardsModule.drawCard({deck: "banana"}, function(err, response) {
			assert.notInclude(response,"Your card: ");
			done();
		});
	});
})