'use strict';
/**
 * Core Utilities for Sockbot
 * @module utils
 * @license MIT
 */

const async = require('async');
const config = require('./config');

const internals = {
        cooldownTimers: {}
    },
    privateFns = {
        filterIgnoredOnPost: filterIgnoredOnPost,
        filterIgnoredOnTopic: filterIgnoredOnTopic
    };

/**
 * Generate a "good enough" Type 4 UUID.
 *
 * Not cryptographically secure, not pretty, not fast, but since we only need a couple of these it's good enough
 *
 * @returns {string} a "type 4 UUID"
 */
exports.uuid = function () {
    return '88888888-8888-4888-2888-888888888888'.replace(/[82]/g, (c) => (Math.random() * c * 2 ^ 8).toString(16));
};

/**
 * Add timestamp to message.
 *
 * @param {*} message Message to timestamp
 * @returns {string} timestamped input message
 */
function addTimestamp(message) {
    const date = new Date().toISOString().replace(/\..+$/, '');
    if (typeof message !== 'string') {
        message = JSON.stringify(message, null, '    ');
    }
    message = '[' + date.replace(/^.+T/, '') + '] ' + message;
    return message;
}

/**
 * Log a message to the console
 *
 * @param {*} message Message to log
 */
exports.log = function (message) {
    console.log(addTimestamp(message)); //eslint-disable-line no-console
};

/**
 * Log a warning to the console
 *
 * @param {*} message Warning to log
 */
exports.warn = function (message) {
    console.warn(addTimestamp(message)); //eslint-disable-line no-console
};

/**
 * Log an error to the console
 *
 * @param {*} message Error to log
 */
exports.error = function (message) {
    console.error(addTimestamp(message)); //eslint-disable-line no-console
};


/**
 * Clone object
 *
 * @param {*} original Data to clone
 * @returns {*} Cloned `original` data
 */
exports.cloneData = function cloneData(original) {
    if (original === undefined) {
        return undefined;
    }
    return JSON.parse(JSON.stringify(original));
};

/**
 * Recursively merge objects
 *
 * @param {object} base Base object to merge `mixin` into
 * @param {object} mixin Mixin object to merge into `base`
 * @param {boolean} [mergeArrays] Merge arrays instead of concatenating them
 */
function mergeInner(base, mixin, mergeArrays) {
    if (base == null || typeof base !== 'object' || Array.isArray(base)) {
        throw new Error('base must be object');
    }
    if (mixin == null || typeof mixin !== 'object' || Array.isArray(mixin)) {
        throw new Error('mixin must be object');
    }
    let name;
    for (name in mixin) {
        mergeHelper(base, mixin, name, mergeArrays);
    }
}

/*
 * Merge helper - FOR INTERNAL USE ONLY
 *
 * @param {object} base Base object to merge `mixin` into
 * @param {object} mixin Mixin object to merge into `base`
 * @param {string} name Name of property to merge
 * @param {boolean} [mergeArrays] Merge arrays instead of concatenating them
 */
function mergeHelper(base, mixin, name, mergeArrays) {
    if (Array.isArray(mixin[name])) {
        if (!mergeArrays && base[name] && Array.isArray(base[name])) {
            base[name] = base[name].concat(mixin[name]);
        } else {
            base[name] = mixin[name];
        }
    } else if (typeof mixin[name] === 'object') {
        let newBase = base[name] || {};
        if (Array.isArray(newBase)) {
            newBase = {};
        }
        mergeInner(newBase, mixin[name], mergeArrays);
        base[name] = newBase;
    } else {
        base[name] = mixin[name];
    }
}

/**
 * Merge multiple objects into one object
 *
 * Later objects override earlier objects
 *
 * @param {boolean} [mergeArrays] Merge arrays instead of concatenating them
 * @param {...object} mixin Objects to merge
 * @returns {object} object constructed by merging `mixin`s from left to right
 */
exports.mergeObjects = function mergeObjects(mergeArrays, mixin) { //eslint-disable-line no-unused-vars
    const args = Array.prototype.slice.apply(arguments),
        res = {};
    let reallyMergeArrays = false;
    if (typeof args[0] === 'boolean') {
        reallyMergeArrays = args.shift();
    }
    let obj;
    while ((obj = args.shift())) {
        mergeInner(res, exports.cloneData(obj), reallyMergeArrays);
    }
    return res;
};

/**
 * Proccess post for ignore contitions
 *
 * @param {externals.posts.CleanedPost} post Post to filter
 * @param {filterCallback} callback Completion Callback
 * @returns {null} No return value
 */
function filterIgnoredOnPost(post, callback) {
    const flow = (err, msg) => setTimeout(() => callback(err, msg), 0),
        ignoredUsers = config.core.ignoreUsers,
        now = Date.now();
    if (post.trust_level >= 4) {
        return flow(null, 'Poster is TL4+');
    }
    if (ignoredUsers.indexOf(post.username) >= 0) {
        return flow('ignore', 'Post Creator Ignored');
    }
    if (post.trust_level < 1) {
        return flow('ignore', 'Poster is TL0');
    }
    if (post.trust_level === 1) {
        if (internals.cooldownTimers[post.username] && now < internals.cooldownTimers[post.username]) {
            return flow('ignore', 'Poster is TL1 on Cooldown');
        }
        internals.cooldownTimers[post.username] = now + config.core.cooldownPeriod;
    }
    if (post.primary_group_name === 'bots') {
        return flow('ignore', 'Poster is a Bot');
    }
    return flow(null, 'POST OK');
}

/**
 * Proccess topic for ignore contitions
 *
 * @param {externals.topics.Topic} topic Topic to filter
 * @param {filterCallback} callback Completion Callback
 * @returns {null} No return value
 */
function filterIgnoredOnTopic(topic, callback) {
    const flow = (err, msg) => setTimeout(() => callback(err, msg), 0),
        ignoredUsers = config.core.ignoreUsers,
        ignoredCategory = config.core.ignoreCategories;
    if (topic.details) {
        const user = topic.details.created_by.username;
        if (topic.details.notification_level < 1) {
            return flow('ignore', 'Topic Was Muted');
        }
        if (ignoredUsers.indexOf(user) >= 0) {
            return flow('ignore', 'Topic Creator Ignored');
        }
    }
    if (ignoredCategory.indexOf(topic.category_id) >= 0) {
        return flow('ignore', 'Topic Category Ignored');
    }
    flow(null, 'TOPIC OK');
}

/**
 * Filter post/topic for ignore conditions
 *
 * @param {externals.posts.CleanedPost} post Post to filter
 * @param {externals.topics.Topic} topic Topic to filter
 * @param {completionCallback} callback Completion Callback
 */
exports.filterIgnored = function filterIgnored(post, topic, callback) {
    async.parallel([
        (cb) => {
            privateFns.filterIgnoredOnPost(post, cb);
        }, (cb) => {
            privateFns.filterIgnoredOnTopic(topic, cb);
        }
    ], (err, reason) => {
        if (err) {
            exports.warn('Post #' + post.id + ' Ignored: ' + reason.join(', '));
        }
        callback(err);
    });
};


/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.addTimestamp = addTimestamp;
    exports.mergeInner = mergeInner;
    exports.internals = internals;
    exports.privateFns = privateFns;
}
