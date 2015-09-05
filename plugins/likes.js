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
const async = require('async'),
    later = require('later');

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
         * The hour of the day to go on a like binge in UTC (0-23)
         * @default
         * @type {number}
         */
        bingeHour: 0,
        /**
         * The minute of the hour to go on a like binge in UTC (0-59)
         * @default
         * @type {number}
         */
        bingeMinute: 0,
        /**
         * Randomise the time of day the likes binge starts (if set, overrides `bingeHour` and `bingeMinute`)
         * @default
         * @type {boolean}
         */
        bingeRandomize: true,
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
    internals.config = config.mergeObjects(true, defaultConfig, plugConfig);
    internals.config.topics.forEach((topic) => events.onTopic(topic, exports.messageHandler));
    if (internals.config.bingeRandomize) {
        internals.config.bingeHour = Math.floor(Math.random() * 24);
        internals.config.bingeMinute = Math.floor(Math.random() * 60);
    }
};

/**
 * Start the plugin after login
 */
exports.start = function start() {
    if (internals.config.binge) {
        //Daily at the specified time
        const sched = later.parse.recur()
            .on(internals.config.bingeHour).hour()
            .on(internals.config.bingeMinute).minute();
        internals.bingeInterval = later.setInterval(exports.binge, sched);
    }
};

/**
 * Stop the plugin prior to exit or reload
 */
exports.stop = function stop() {
    if (internals.bingeInterval) {
        internals.bingeInterval.clear();
    }
    internals.bingeInterval = undefined;
};

/**
 * Like the new post.
 *
 * In the event of Discourse returning an HTTP 5xx status code,
 * the like attempt will be retried up to a maximum of three attempts;
 * if after three attempts Discourse is still returning 5xx codes,
 * it is safe to assume that it is in the middle of a cooties storm,
 * and there is therefore no point in continuing to retry the like action
 * and placing unnecessary extra load on the server.
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
        let attempt = 1; //Limit to three tries
        const liker = err => {
            attempt++;
            if (attempt > 3 || !err || err.statusCode < 500) {
                return;
            }
            //Server error; wait 15 seconds and try again
            setTimeout(() => internals.browser.postAction('like', post.id, '', liker), 15000);
        };
        internals.browser.postAction('like', post.id, '', liker);
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
