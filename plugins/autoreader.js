'use strict';
/**
 * Auto-reader plugin
 * @module autoreader
 * @author RaceProUK
 * @license MIT
 */
const utils = require('../utils');

const defaultConfig = {
        readWait: 3 * 24 * 60 * 60 * 1000
    },
    internals = {
        config: defaultConfig,
        timer: undefined,
        readify: readify
    };

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
    internals.config = utils.mergeObjects(true, defaultConfig, plugConfig);
};

/**
 * Start the plugin after login
 */
exports.start = function () {
    internals.timer = setInterval(readify, 24 * 60 * 60 * 1000); //Daily
};

/**
 * Stop the plugin prior to exit or reload
 */
exports.stop = function () {
    clearInterval(internals.timer);
    internals.timer = undefined;
};

/**
 * Handle notifications
 *
 * @param {external.notifications.Notification} notification Notification recieved
 * @param {external.topics.Topic} topic Topic trigger post belongs to
 * @param {external.posts.CleanedPost} post Post that triggered notification
 */
exports.handler = function handler(notification, topic, post) {}; //eslint-disable-line no-unused-vars

function readify() {
    mBrowser.getTopics((topic, nextTopic) => {
        if (!topic) {
            return;
        }
        utils.log('Reading topic `' + topic.slug + '`');
        const now = new Date().getTime() - internals.config.readWait;
        const postIds = [];
        mBrowser.getPosts(topic.id, (post, nextPost) => {
            if (post && !post.read && Date.parse(post.created_at) < now) {
                postIds.push(post.id);
            }
            nextPost();
        }, () => {
            if (postIds.length > 0){
                mBrowser.readPosts(topic.id, postIds, () => 0);
            }
        });
        nextTopic();
    }, () => 0);
}

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.internals = internals;
}
