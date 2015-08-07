'use strict';
/**
 * Automatically read posts older than the configured interval.
 *
 * @module autoreader
 * @author RaceProUK
 * @license MIT
 */
const utils = require('../utils');

/**
 * Default configuration settings
 * @typedef {object}
 */
const defaultConfig = {
        /**
         * How old a post must be to be auro-read
         * @default
         * @type {number}
         */
        minAge: 3 * 24 * 60 * 60 * 1000
    },
    /**
     * Internal status store
     * @typedef {object}
     */
    internals = {
        /**
         * Browser to use for communication with discourse
         * @type {Browser}
         */
        browser: null,
        /**
         * Instance configuration
         * @type {object}
         */
        config: defaultConfig,
        /**
         * Used to stop the autoreading when the plugin is stopped
         * @type {object}
         */
        timer: undefined
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
    internals.browser = browser;
    internals.config = utils.mergeObjects(true, defaultConfig, plugConfig);
};

/**
 * Start the plugin after login
 */
exports.start = function () {
    internals.timer = setInterval(exports.readify, 24 * 60 * 60 * 1000); //Daily
};

/**
 * Stop the plugin prior to exit or reload
 */
exports.stop = function () {
    clearInterval(internals.timer);
    internals.timer = undefined;
};

/**
 * Autoread posts worker method; gets the list of accessible topics, then scans each in turn,
 * reading any unread posts it finds that are older than the configured interval.
 */
exports.readify = function () {
    internals.browser.getTopics((topic, nextTopic) => {
        if (!topic) {
            return;
        }
        utils.log('Reading topic `' + topic.slug + '`');
        const now = new Date().getTime() - internals.config.minAge;
        const postIds = [];
        internals.browser.getPosts(topic.id, (post, nextPost) => {
            if (post && !post.read && Date.parse(post.created_at) < now) {
                postIds.push(post.id);
            }
            nextPost();
        }, () => {
            if (postIds.length > 0){
                internals.browser.readPosts(topic.id, postIds, () => 0);
            }
        });
        nextTopic();
    }, () => 0);
};

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.internals = internals;
}
