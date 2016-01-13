'use strict';

/**
 * Notification level commands
 *
 * @module status
 * @author AccaliaDeElementia
 * @license MIT
 */

const async = require('async');

const config = require('../config');
const browser = require('../browser')();

/**
 * Prepare the command parser
 *
 * Needs to be called to set the internals of the parser after reading config file.
 *
 * @param {EventEmitter} events EventEmitter that will be core comms for SockBot
 * @param {completedCallback} callback Completion callback
 */
exports.prepare = function prepare(events, callback) {
	async.parallel([
		cb => events.onCommand('mute', 'Make the bot mute the topic this command is executed on',
			exports.mute, cb),
		cb => events.onCommand('unmute', 'Make the bot unmute the topic this command is executed on',
			exports.unmute, cb),
		cb => events.onCommand('watch', 'Make the bot watch the topic this command is executed on',
			exports.watch, cb),
		cb => events.onCommand('unwatch', 'Make the bot unwatch the topic this command is executed on',
			exports.unwatch, cb)
	], callback);
};

exports.getErrorMessage = function getErrorMessage(command) {
	return 'I\'m sorry ' + command.post.username + ', but I cannot comply.\n\n' +
		'You are not authorized to use this command.\n\n' +
		'Please ask someone of Trust Level 3 or higher, or my owner, @' + config.core.owner +
		', for assistance in this matter';
};

/**
 * Mute the current Thread
 *
 * @param {command} command the mute command
 */
exports.mute = function mute(command) {
	if (command.post.trust_level < 3) { //gotta be TL3+ to do this
		browser.createPost(command.post.topic_id, command.post.post_number, exports.getErrorMessage(command), () => 0);
	} else { //oh brother.... better put a gag in this.
		browser.setNotificationLevel(command.post.topic_id, 0, () => 0);
		browser.createPost(command.post.topic_id, command.post.post_number,
			'Muting this topic in 3... 2... 1...', ()=>0);
		browser.createPrivateMessage([command.post.username, config.core.owner],
			'Complying with Mute Request by @' + command.post.username,
			command.post.url + '\n\n' + command.post.raw, () => 0);
	}
};

/**
 * Watch the current thread
 *
 * @param {command} command the watch command
 */
exports.watch = function watch(command) {
	if (command.post.trust_level < 3) { //gotta be TL3+ to do this
		browser.createPost(command.post.topic_id, command.post.post_number, exports.getErrorMessage(command), () => 0);
	} else { //oh brother.... better put a gag in this.
		browser.setNotificationLevel(command.post.topic_id, 3, () => 0);
		browser.createPost(command.post.topic_id, command.post.post_number,
			'Watching this topic in 3... 2... 1...', ()=>0);
		browser.createPrivateMessage([command.post.username, config.core.owner],
			'Complying with Watch Request by @' + command.post.username,
			command.post.url + '\n\n' + command.post.raw, () => 0);
	}
};


/**
 * Unwatch the current thread
 *
 * @param {command} command the unwatch command
 */
exports.unmute = exports.unwatch = function unwatch(command) {
	if (command.post.trust_level < 3) { //gotta be TL3+ to do this
		browser.createPost(command.post.topic_id, command.post.post_number, exports.getErrorMessage(command), () => 0);
	} else { //oh brother.... better put a gag in this.
		browser.setNotificationLevel(command.post.topic_id, 1, () => 0);
		browser.createPost(command.post.topic_id, command.post.post_number,
			'Unwatching this topic in 3... 2... 1...', ()=>0);
		browser.createPrivateMessage([command.post.username, config.core.owner],
			'Complying with Unwatch Request by @' + command.post.username,
			command.post.url + '\n\n' + command.post.raw, () => 0);
	}
};
