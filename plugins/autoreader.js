'use strict';
/**
 * Automatically read posts older than the configured interval.
 *
 * @module autoreader
 * @author RaceProUK
 * @license MIT
 */

const later = require('later');

const binger = require('./binge-helper');
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
        minAge: 3 * 24 * 60 * 60 * 1000,
        /**
         * The hour of the day to run the autoreader in UTC (0-23)
         * @default
         * @type {number}
         */
        hour: 0,
        /**
         * The minute of the hour to run the autoreader in UTC (0-59)
         * @default
         * @type {number}
         */
        minute: 0,
        /**
         * Randomise the time of day the autoreader runs (if set, overrides `hour` and `minute`)
         * @default
         * @type {boolean}
         */
        randomize: true
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
        timer: undefined,
        /**
         * EventEmitter used for internal communication
         * @type {externals.events.SockEvents}
         */
        events: null,
        /**
         * Extended help message
         */
        extendedHelp: 'Automatically read posts throughout the forum.\n\nFor more information see the' +
            ' [full docs](https://sockbot.readthedocs.org/en/latest/Plugins/autoreader/)'
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
    if (typeof plugConfig !== 'object') {
        plugConfig = {};
    }
    internals.events = events;
    internals.config = config.mergeObjects(true, defaultConfig, plugConfig);
    if (internals.config.randomize) {
        binger.randomizeStart(internals.config);
    }
    events.registerHelp('autoreader', internals.extendedHelp, () => 0);
};

/**
 * Start the plugin after login
 */
exports.start = function () {
    //Daily at the specified time
    const sched = later.parse.recur()
        .on(internals.config.hour).hour()
        .on(internals.config.minute).minute();
    internals.timer = later.setInterval(exports.readify, sched);
};

/**
 * Stop the plugin prior to exit or reload
 */
exports.stop = function () {
    if (internals.timer) {
        internals.timer.clear();
    }
    internals.timer = undefined;
};

/**
 * Autoread posts worker method; gets the list of accessible topics, then scans each in turn,
 * reading any unread posts it finds that are older than the configured interval.
 */
exports.readify = function () {
    const minAge = new Date().getTime() - internals.config.minAge;
    const additional = Math.max(internals.config.minAge / 2, 25 * 60 * 60 * 1000);
    const readCutoff = minAge - additional;
    internals.browser.getTopics((topic, nextTopic) => {
        if (!topic) {
            return nextTopic();
        }
        const lastPost = Date.parse(topic.last_posted_at);
        if (lastPost < readCutoff) {
            return nextTopic();
        }

        internals.events.emit('logMessage', 'Reading topic `' + topic.slug + '`');
        const postNumbers = [];
        internals.browser.getPosts(topic.id, (post, nextPost) => {
            if (post && !post.read && Date.parse(post.created_at) < minAge) {
                postNumbers.push(post.post_number);
            }
            nextPost();
        }, () => {
            if (postNumbers.length > 0) {
                internals.browser.readPosts(topic.id, postNumbers, () => 0);
            }
            nextTopic();
        });
    }, () => 0);
};

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.internals = internals;
}
