'use strict';
/**
 * Anonymizer plugin
 * @module anonymizer
 * @author RaceProUK
 * @license MIT
 */
const xRegExp = require('xregexp').XRegExp;
const rQuote = xRegExp('\\[quote.*post:(?<postNumber>\\d+).*topic:(?<topicId>\\d+)'),
    postSuccess = 'Anonymizied reply sent. Thank you for using Anonymizer, a SockDrawer application.',
    parseError = 'Anonymizied reply **not** sent; quote must specify both topic and post.',
    postError = 'Anonymizied reply **not** sent; Discourse error while posting.';
let mBrowser;

const internals = {
    postSuccess: postSuccess,
    parseError: parseError,
    postError: postError
};

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
    const match = rQuote.xexec(post.raw);
    //match.topicId is a string, so coerce topic.id type to match
    if (!match || topic.id.toString() === match.topicId) {
        mBrowser.createPost(topic.id, post.id, parseError, () => 0);
        return;
    }
    mBrowser.createPost(match.topicId, match.postNumber, post.raw, (err) => {
        if (err) {
            mBrowser.createPost(topic.id, post.id, postError, () => 0);
        } else {
            mBrowser.createPost(topic.id, post.id, postSuccess, () => 0);
        }
    });
};

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.internals = internals;
}
