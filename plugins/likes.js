'use strict';
/**
 * Auto-like module.
 *
 * Watches threads for new posts and likes them, includes "binge" functionality to catch up with likes on older posts
 *
 * @module likes
 * @author Accalia
 * @license MIT
 */
const async = require('async');

/**
 * Default configuration settings
 * @typedef {object}
 */
const defaultConfig = {
        /**
         * Whether like binges should be performed
         * @type {boolean}
         * @default
         */
        binge: false,
        /**
         * Maximum number of likes to hand out as part of a like binge
         * @type {number}
         * @default
         */
        bingeCap: 500,
        /**
         * Topics to hand out likes in
         * @type {number[]}
         * @default
         */
        topics: [1000],
        /**
         * Time to delay liking post as posts are streamed in
         * @type {number}
         * @default
         */
        delay: 15 * 1000,
        /**
         * Amount of time to scatter likes by
         * @type {number}
         * @default
         */
        scatter: 5 * 1000
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
         * Interval token for like binges
         * @type {*}
         */
        bingeInterval: null,
        /**
         * Count of likes handed out during latest binge
         * @type {number}
         */
        likeCount: 0,
        /**
         * EventEmitter used for internal communication
         * @type {externals.events.SockEvents}
         */
        events:null
    };
exports.defaultConfig = defaultConfig;
exports.internals = internals;

/**
 * Prepare plugin prior to login
 *
 * @param {*} plugConfig Plugin specific configuration
 * @param {Config} config Overall Bot Configuration
 * @param {externals.events.SockEvents} events EventEmitter used for the bot
 * @param {Browser} browser Web browser for communicating with discourse
 */
exports.prepare = function prepare(plugConfig, config, events, browser) {
    internals.browser = browser;
    if (typeof plugConfig !== 'object') {
        plugConfig = {};
    }
    internals.events = events;
    internals.config = config.mergeObjects(defaultConfig, plugConfig);
    internals.config.topics.forEach((topic) => events.onTopic(topic, exports.messageHandler));
};

/**
 * Start the plugin after login
 */
exports.start = function start() {
    if (internals.config.binge) {
        internals.bingeInterval = setInterval(exports.binge, 24 * 60 * 60 * 1000);
    }
};

/**
 * Stop the plugin prior to exit or reload
 */
exports.stop = function stop() {
    if (internals.bingeInterval) {
        clearInterval(internals.bingeInterval);
    }
};

/**
 * Handle topic message
 *
 * @param {external.notifications.notification} data Notification data
 * @param {external.topics.Topic} topic Topic containing post generating notification
 * @param {external.posts.CleanedPost} post Post that generated notification
 */
exports.messageHandler = function messageHandler(data, topic, post) {
    if (data.type !== 'created') {
        return;
    }
    const delay = Math.ceil(internals.config.delay + Math.random() * internals.config.scatter);
    setTimeout(() => {
        internals.events.emit('logMessage', 'Liking Post /t/' + post.topic_id + '/' +
            post.post_number + ' by @' + post.username);
        internals.browser.postAction('like', post.id, '', () => 0);
    }, delay);
};

/**
 * Perform a like binge
 */
exports.binge = function binge() {
    internals.likeCount = 0;
    internals.events.emit('logMessage', 'Beginning Like Binge');
    async.eachSeries(internals.config.topics, (topicId, next) => {
        internals.browser.getPosts(topicId, exports.handlePost, next);
    }, (err) => internals.events.emit('logMessage', 'Like Binge Completed: ' + err));
};

/**
 * Handle a post in a like binge
 *
 * @param {external.posts.CleanedPost} post Post to handle
 * @param {completionCallback} callback Completion Callback
 */
exports.handlePost = function handlePost(post, callback) {
    const likeable = post.actions_summary.some((action) => action.id === 2 && action.can_act);
    if (likeable) {
        internals.browser.postAction('like', post.id, '', (err) => {
            if (err) {
                return callback(err);
            }
            internals.likeCount += 1;
            if (internals.likeCount >= internals.config.bingeCap) {
                return callback('Like Binge Limit Reached');
            }
            setTimeout(callback, 1000);
        });
    } else {
        callback();
    }
};

/**
 * Completion callback
 *
 * @callback
 * @name completionCallback
 * @param {Error} [err=null] Error encountered before completion
 */
