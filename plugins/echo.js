'use strict';
/**
 * Example plugin, echos your words back at you.
 * @module echo
 * @author Accalia
 * @license MIT
 */
let mBrowser;

/**
 * Prepare Plugin prior to login
 *
 * @param {*} plugConfig Plugin specific configuration
 * @param {Config} config Overall Bot Configuration
 * @param {externals.events.SockEvents} events EventEmitter used for the bot
 * @param {Browser} browser Web browser for communicating with discourse
 */
exports.prepare = function (plugConfig, config, events, browser) {
    mBrowser = browser;
    events.onNotification('mentioned', exports.handler);
    events.onNotification('replied', exports.handler);
    events.onNotification('private_message', exports.handler);
};

/**
 * Start the plugin after login
 */
exports.start = function () {};

/**
 * Stop the plugin prior to exit or reload
 */
exports.stop = function () {};

/**
 * Handle notifications
 *
 * @param {external.notifications.Notification} notification Notification recieved
 * @param {external.topics.Topic} topic Topic trigger post belongs to
 * @param {external.posts.CleanedPost} post Post that triggered notification
 */
exports.handler = function handler(notification, topic, post) {
    mBrowser.createPost(topic.id, post.id, post.cleaned, () => 0);
};
