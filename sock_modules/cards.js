/*jslint node: true, indent: 4, todo: true */

'use strict';
/**
 * Cards module. Responsible for drawing cards
 * @module cards
 */

 var Deck = require('./cardDeck.js');

var parser,
    discourse,
    conf,
    configuration;
	
	
var decks = {};
var nextnum = 1;

/**
 * Brief description of this module for Help Docs
 */
exports.description = 'Allow bot to play with cards';

/**
 * Default Configuration settings for this sock_module
 */
exports.configuration = {
    enabled: false
};

/**
 * The name of this sock_module
 */
exports.name = 'CardBox';

/**
 * If defined by a sock_module it is the priority of
 * the module with respect to other modules.
 *
 * sock_modules **should not** define modules with negative permissions.
 * Default value is 50 with lower numbers being higher priority. 
 */
exports.priority = 50;

/**
 * The version of this sock_module
 */
exports.version = '1.0.0';

/**
 * Bootstrap the module
 * @param  {string} browser - discourse.
 * @param  {object} config - The configuration to use
 */
exports.begin = function begin(browser, config) {
    configuration = config.modules[exports.name];
    conf = config;
    discourse = browser;
};

exports.createDeck = function(payload, callback) {
	var decktype = payload.Type;
	if(decktype in types) {
		var data = {};
		data.name = "deck" + nextnum;
		data.cards = types[decktype];
		decks[data.name] = new Deck(data);
		nextnum++;
		callback(null, "Success! Your deck is " + data.name);
	} else {
		callback(null, "Error: no such type " + decktype);
	}
}

exports.drawCard = function(payload, callback) {
	if (payload.deck in decks) {
		var card = decks[payload.deck].draw();
		callback(null, "Your card: " + card);
	} else {
		callback(null, "Error: no such deck " + payload.deck);
	}
}

/**
 *  Each command has the following properties:
 * - handler:        The encryption function.
 * - defaults:       Default values of parameters
 * - params:         Named parameters for this function
 * - randomPickable: If true, random encryption can select this function.
 *                   NOTE: random currently does not support parameters.
 * - description:    A description of this function for the help
 *
 * @type {Object}
 */
exports.commands = {
    new: {
        handler: exports.createDeck,
        defaults: {
			Type: "French52"
		},
        params: ['Type'],
        description: 'Create new deck.'
    },
	draw: {
        handler: exports.createDeck,
        defaults: {
			num: 1
		},
        params: ['deck', 'num'],
        description: 'Create new deck.'
    }
};


//=============================DATA===================
var types = {
	"French52" : ["Ace of diamonds",
		"Two of diamonds",
		"Three of diamonds",
		"Four of diamonds",
		"Five of diamonds",
		"Six of diamonds",
		"Seven of diamonds",
		"Eight of diamonds",
		"Nine of diamonds",
		"Ten of diamonds",
		"Jack of diamonds",
		"Queen of diamonds",
		"King of diamonds",
		"Ace of hearts",
		"Two of hearts",
		"Three of hearts",
		"Four of hearts",
		"Five of hearts",
		"Six of hearts",
		"Seven of hearts",
		"Eight of hearts",
		"Nine of hearts",
		"Ten of hearts",
		"Jack of hearts",
		"Queen of hearts",
		"King of hearts",
		"Ace of spades",
		"Two of spades",
		"Three of spades",
		"Four of spades",
		"Five of spades",
		"Six of spades",
		"Seven of spades",
		"Eight of spades",
		"Nine of spades",
		"Ten of spades",
		"Jack of spades",
		"Queen of spades",
		"King of spades",
		"Ace of clubs",
		"Two of clubs",
		"Three of clubs",
		"Four of clubs",
		"Five of clubs",
		"Six of clubs",
		"Seven of clubs",
		"Eight of clubs",
		"Nine of clubs",
		"Ten of clubs",
		"Jack of clubs",
		"Queen of clubs",
		"King of clubs"
	],
	"French54" : ["Ace of diamonds",
		"Two of diamonds",
		"Three of diamonds",
		"Four of diamonds",
		"Five of diamonds",
		"Six of diamonds",
		"Seven of diamonds",
		"Eight of diamonds",
		"Nine of diamonds",
		"Ten of diamonds",
		"Jack of diamonds",
		"Queen of diamonds",
		"King of diamonds",
		"Ace of hearts",
		"Two of hearts",
		"Three of hearts",
		"Four of hearts",
		"Five of hearts",
		"Six of hearts",
		"Seven of hearts",
		"Eight of hearts",
		"Nine of hearts",
		"Ten of hearts",
		"Jack of hearts",
		"Queen of hearts",
		"King of hearts",
		"Ace of spades",
		"Two of spades",
		"Three of spades",
		"Four of spades",
		"Five of spades",
		"Six of spades",
		"Seven of spades",
		"Eight of spades",
		"Nine of spades",
		"Ten of spades",
		"Jack of spades",
		"Queen of spades",
		"King of spades",
		"Ace of clubs",
		"Two of clubs",
		"Three of clubs",
		"Four of clubs",
		"Five of clubs",
		"Six of clubs",
		"Seven of clubs",
		"Eight of clubs",
		"Nine of clubs",
		"Ten of clubs",
		"Jack of clubs",
		"Queen of clubs",
		"King of clubs",
		"Black joker",
		"Red joker"
	]
}