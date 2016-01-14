'use strict';
/**
 * Post replies anonymously.
 *
 * Usage: Send a PM to the bot with a quote that specifies both the topic ID and the post number to reply to.
 *
 * Example:
 * ```
 * [quote="username, post:x, topic:y, full:true"]
 * Content inside the quote
 * [/quote]
 * Content outside the quote
 * ```
 * Replace `x` with the post number and `y` with the topic ID;
 * the bot will then echo the message in its entirely in the desired topic.
 *
 * The `username` and `full:true` can be omitted as desired.
 *
 * Note: Bot must have permission to post in the topic specified.
 *
 * @module anonymizer
 * @author RaceProUK
 * @license MIT
 */
const xRegExp = require('xregexp').XRegExp;
const rQuote = xRegExp('\\[quote.*post:(?<postNumber>\\d+).*topic:(?<topicId>\\d+)'),
    postSuccess = 'Anonymizied reply sent. Thank you for using Anonymizer, a SockDrawer application.',
    errorStub = 'Anonymizied reply **not** sent; ',
    parseError = errorStub + 'quote must specify both topic and post.',
    topicError = errorStub + 'you cannot anonymously reply into the same topic you issued the request in.',
    postError = errorStub + 'Discourse error while posting.';
let mBrowser, siteUrl;

const internals = {
    postSuccess: postSuccess,
    parseError: parseError,
    topicError: topicError,
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
    siteUrl = config.core.forum;
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
    const match = xRegExp.exec(post.raw, rQuote);
    //match.topicId is a string, so coerce topic.id type to match
    if (!match) {
        mBrowser.createPost(topic.id, post.post_number, parseError, () => 0);
        return;
    }
    if (topic.id.toString() === match.topicId) {
        mBrowser.createPost(topic.id, post.post_number, topicError, () => 0);
        return;
    }
    mBrowser.createPost(match.topicId, match.postNumber, post.raw, (err, aPost) => {
        if (err) {
            mBrowser.createPost(topic.id, post.post_number, postError, () => 0);
        } else {
            const postUrl = [
                    siteUrl,
                    't',
                    aPost.topic_id,
                    aPost.post_number
                ].join('/');
            const message = [
                    postSuccess,
                    'Post is here:',
                    postUrl
                ].join('\n');
            mBrowser.createPost(topic.id, post.post_number, message, () => 0);
        }
    });
};

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.internals = internals;
}
