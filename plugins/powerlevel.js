'use strict';
/**
 * PowerLevel plugin
 *
 * Attempts to obtain and maintain a trust level
 *
 * @module powerlevel
 * @author Yamikuronue
 * @license MIT
 */

const internals = {
    browser: null,
    configuration: exports.defaultConfig,
    username: null,
    me: {
        trustLevel: 0,
        topicsCreated: 0,
        postsMade: 0,
        timeSpent: 0,
        likesGiven: 0,
        likeReceived: 0,
        replies: 0,
        days: 0
    }
};
exports.internals = internals;

const userActions = {
    likeGiven: 1,
    likeReceived: 2,
    bookmarked: 3,
    createTopic: 4,
    reply: 5,
    repliedTo: 6,
    mentioned: 7,
    quote: 9,
    edited: 11,
    msgSent: 12,
    msgReceived: 13,
    pending: 14
};

/**
 * Default plugin configuration
 */
exports.defaultConfig = {
    trustLevel: 2,
    requirements: {
        tl1: {
            topics: 5,
            posts: 30,
            time: 10,
            likesGiven: 0,
            likesReceived: 0,
            replies: 0,
            days: 0
        },
        tl2: {
            topics: 20,
            posts: 100,
            time: 60,
            likesGiven: 1,
            likesReceived: 1,
            replies: 3,
            days: 15
        },
        tl3: {
            topics: 10,
            posts: 0,
            postPercentage: 25,
            topicPercentage: 25,
            time: 60,
            likesGiven: 30,
            likesReceived: 20,
            replies: 3,
            days: 50
        }
    }
};

/**
 * Prepare Plugin prior to login
 *
 * @param {*} plugConfig Plugin specific configuration
 * @param {Config} config Overall Bot Configuration
 * @param {externals.events.SockEvents} events EventEmitter used for the bot
 * @param {Browser} browser Web browser for communicating with discourse
 */
exports.prepare = function prepare(plugConfig, config, events, browser) {
    if (plugConfig === null) {
        plugConfig = {};
    }
    internals.browser = browser;
    internals.configuration = config.mergeObjects(exports.defaultConfig, plugConfig);

    if (!config || !config.core || !config.core.username) {
       throw new Error('Invalid config provided!');
    } else {
        internals.username = config.core.username;
    }
};

/**
 * Start the plugin after login
 */
exports.start = function start() {
   exports.updateSelf();
};

/**
 * Update your internal representation of yourself
 * @param  {Function} callback The callback
 */
exports.updateSelf = function(callback) {
     //Fetch my stats
    internals.browser.getUser(internals.username, function(myData) {

        //Discourse doesn't follow our linting rules:
        /*eslint-disable camelCase */
        internals.me.trustLevel = myData.user.trust_level;
        myData.user.stats.forEach(stat => {

            switch (stat.action_type) {
                case userActions.createTopic:
                    internals.me.topicsCreated = stat.count;
                    internals.me.postsMade += stat.count;
                    break;
                case userActions.reply:
                    internals.me.postsMade += stat.count;
                    break;
                case userActions.repliedTo:
                    internals.me.replies = stat.count;
                    break;
                case userActions.likeReceived:
                    internals.me.likesReceived = stat.count;
                    break;
                case userActions.likeGiven:
                    internals.me.likesGiven = stat.count;
                    break;
            }
        });

        /*istanbul ignore else*/
        if (callback) {
            callback(null);
        }
        /*eslint-enable camelCase */
    });
};

/**
 * Stop the plugin prior to exit or reload
 */
exports.stop = function stop() {};
