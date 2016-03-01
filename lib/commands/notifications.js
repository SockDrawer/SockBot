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
const commands = require('../commands');
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


function setLevel(command, level, levelName) {
	if (command.post.trust_level < 3) { //gotta be TL3+ to do this
		commands.postPermissionDenied(command, 3);
	} else { //oh brother.... better put a gag in this.
		browser.setNotificationLevel(command.post.topic_id, level, () => 0);
		browser.createPost(command.post.topic_id, command.post.post_number,
			levelName + 'ing this topic in 3... 2... 1...', () => 0);
		browser.createPrivateMessage([command.post.username, config.core.owner],
			'Complying with ' + levelName + ' Request by @' + command.post.username,
			command.post.url + '\n\n' + command.post.raw, () => 0);
	}
}

/**
 * Mute the current Thread
 *
 * @param {command} command the mute command
 */
exports.mute = function mute(command) {
	setLevel(command, 0, 'Mute');
};


/**
 * Watch the current thread
 *
 * @param {command} command the watch command
 */
exports.watch = function watch(command) {
	setLevel(command, 3, 'Watch');
};


/**
 * Unwatch the current thread
 *
 * @param {command} command the unwatch command
 */
exports.unmute = exports.unwatch = function unwatch(command) {
	setLevel(command, 1, 'Unwatch');
};
