/*jslint node: true, indent: 4, todo: true */

'use strict';
/**
 * Card deck. Used in the cards module
 * @module deck
 */
 
/**
* Array Remove - By John Resig (MIT Licensed)
*/
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
 
 function Deck(jsonDescription) {
	this.allcards = jsonDescription.cards;
	this.cards = this.allcards.slice(0);
	this.type = jsonDescription.type;
 }
 
 Deck.prototype.draw = function() {
	if (this.cards.length == 0) return undefined;
	
	var randomNum = Math.floor(Math.random() * this.cards.length);
	var card = this.cards[randomNum];
	this.cards.remove(this.cards.indexOf(card));
	return card;
 }
 
 Deck.prototype.size = function() {
	 return this.allcards.length;
 }
 
 Deck.prototype.remaining = function() {
	 return this.cards.length;
 }
 
 Deck.prototype.shuffle = function() {
	 this.cards = this.allcards.slice(0);
 }
 
 module.exports = Deck;