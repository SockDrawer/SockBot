var Deck = require('../sock_modules/cardDeck.js');
var cardsModule = require('../sock_modules/cards.js');
var assert = require('chai').assert;

describe("Deck", function() {
	it("should exist", function() {
		var d = new Deck({type: "Magic", "cards": ["Ace"]});
		assert.isObject(d);
	});
	
	it("should retain type", function() {
		var d = new Deck({type: "Magic", "cards": ["Ace"]});
		assert.equal(d.type, "Magic");
	});
	
	it("should allow drawing cards", function() {
		var d = new Deck({type: "Magic", "cards": ["Ace"]});
		var card = d.draw();
		assert.equal("Ace", card);
	});
	
	it("should draw different cards each time", function() {
		var d = new Deck({type: "Magic", "cards": ["Ace", "Two"]});
		var card = d.draw();
		assert.isTrue(card === "Ace" || card === "Two");
		var card2 = d.draw();
		assert.notEqual(card, card2);
	});
	
	it("should return undefined when it runs out of cards", function() {
		var d = new Deck({type: "Magic", "cards": ["Ace", "Two"]});
		var card = d.draw();
		var card2 = d.draw();
		var card3 = d.draw();
		assert.isUndefined(card3);
	});
	
	it("should allow shuffling", function() {
		var d = new Deck({type: "Magic", "cards": ["Ace", "Two"]});
		d.shuffle();
	});
	
	it("should replenish the deck when shuffled", function() {
		var d = new Deck({type: "Magic", "cards": ["Ace", "Two"]});
		var card = d.draw();
		var card2 = d.draw();
		var card3 = d.draw();
		assert.isUndefined(card3);
		d.shuffle();
		var card4 = d.draw();
		assert.isDefined(card4);
	});
	
	it("should report cards remaining when full", function() {
		var d = new Deck({type: "Magic", "cards": ["Ace", "Two"]});
		assert.equal(2, d.remaining());
	});
	
	it("should report cards remaining when drawing", function() {
		var d = new Deck({type: "Magic", "cards": ["Ace", "Two"]});
		d.draw();
		assert.equal(1, d.remaining());
	});
	
	it("should report cards remaining when empty", function() {
		var d = new Deck({type: "Magic", "cards": ["Ace", "Two"]});
		d.draw();
		d.draw();
		assert.equal(0, d.remaining());
	});
	
	it("should report cards remaining after shuffle", function() {
		var d = new Deck({type: "Magic", "cards": ["Ace", "Two"]});
		d.draw();
		d.draw();
		d.shuffle();
		assert.equal(2, d.remaining());
	});
	
	it("should report size correctly", function() {
		var d = new Deck({type: "Magic", "cards": ["Ace", "Two"]});
		assert.equal(2, d.size());
		d.draw();
		d.draw();
		assert.equal(2, d.size());
		d.shuffle();
		assert.equal(2, d.size());
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
			
			cardsModule.drawCard({deck: deckName, num: 1}, function(err, response) {
				assert.include(response,"Your card: ");
				done();
			});
		});
	});
	
	it("should be able to draw multiple cards", function(done) {
		cardsModule.createDeck({Type: "French52"}, function(err, response) {
			assert.isTrue(responseRegex.test(response));
			var result = response.match(responseRegex);
			var deckName = result[1];
			
			cardsModule.drawCard({deck: deckName, num: 3}, function(err, response) {
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
	
	it("should report nicely when a deck is out of cards", function(done) {
		cardsModule.createDeck({Type: "French52"}, function(err, response) {
			assert.isTrue(responseRegex.test(response));
			var result = response.match(responseRegex);
			var deckName = result[1];
			
			cardsModule.drawCard({deck: deckName, num: 52}, function(err, response) {
				cardsModule.drawCard({deck: deckName, num: 3}, function(err, response) {
					assert.include(response,"No more cards!");
					done();
				});
			});
		});
	});
	
	it("should report nicely when a deck overdrafts", function(done) {
		cardsModule.createDeck({Type: "French52"}, function(err, response) {
			assert.isTrue(responseRegex.test(response));
			var result = response.match(responseRegex);
			var deckName = result[1];
			
			cardsModule.drawCard({deck: deckName, num: 55}, function(err, response) {
				assert.include(response,"No more cards!");
				done();
			});
		});
	});
	
	it("should list one deck", function(done) {
		cardsModule.createDeck({Type: "French52"}, function(err, response) {
			assert.isTrue(responseRegex.test(response));
			var result = response.match(responseRegex);
			var deckName = result[1];
			
			cardsModule.listDecks(null, function(err, response) {
				assert.include(response,deckName);
				done();
			});
		});
	});
	
	it("should list two decks", function(done) {
		cardsModule.createDeck({Type: "French52"}, function(err, response) {
			assert.isTrue(responseRegex.test(response));
			var result = response.match(responseRegex);
			var deckName1 = result[1];
			
			cardsModule.createDeck({Type: "French52"}, function(err, response) {
				var result = response.match(responseRegex);
				var deckName2 = result[1];
				cardsModule.listDecks(null, function(err, response) {
					assert.include(response,deckName1 + " (French52)");
					assert.include(response,deckName2 + " (French52)");
					done();
				});
			});
		});
	});
	
	it("should list deck sizes", function(done) {
		cardsModule.createDeck({Type: "French52"}, function(err, response) {
			assert.isTrue(responseRegex.test(response));
			var result = response.match(responseRegex);
			var deckName1 = result[1];
			
			cardsModule.createDeck({Type: "French52"}, function(err, response) {
				var result = response.match(responseRegex);
				var deckName2 = result[1];
				
				cardsModule.drawCard({deck: deckName1, num: 3}, function(err, response) {
					cardsModule.listDecks(null, function(err, response) {
						assert.include(response,deckName1 + " (French52) [49/52]");
						assert.include(response,deckName2 + " (French52) [52/52]");
						done();
					});
				});
				
			});
		});
	});
	
	it("should list deck types", function(done) {
		cardsModule.listTypes(null, function(err, response) {
			assert.isNull(err);
			done();
		});
	});
	
	it("should know French52", function(done) {
		cardsModule.listTypes(null, function(err, response) {
			assert.include(response,"French52");
			done();
		});
	});
	
	it("should know French54", function(done) {
		cardsModule.listTypes(null, function(err, response) {
			assert.include(response,"French54");
			done();
		});
	});
	
	it("should initialise", function(done) {
		var conf = {
			modules: {
				CardBox: {
					enabled: true
				}
			}
		};
		cardsModule.begin(null, conf);
		assert.equal(cardsModule.configuration.enabled,true,"CardBox not initialised correctly");
		done();
	});
	
/*end module tests */
});