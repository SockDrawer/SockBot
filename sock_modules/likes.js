/*jslint node: true, indent: 4 */
'use strict';
var async = require('async');
var discourse,
    conf,
    delay,
    currentBingeCap = 0,
    bingeIgnoreList = [];

/**
 * Likes module. The  autoliker
 * @module likes
 */

 /**
 * Brief description of this module for Help Docs
 */
exports.description = 'Issue Likes to all posts in a thread';

/**
 * Default Configuration settings for this sock_module
 * @type {Object}
 */
exports.configuration = {
    /**
     * Whether this module should be enabled
     * @type {Boolean}
     */
    enabled: false,
    /**
     * Whether this should... something involving following. Imprint on mother ducks?
     * @type {Boolean}
     */
    follow: false,
    /**
     * Whether this module should binge-like to catch up on things you didn't like while it was down
     * @type {Boolean}
     */
    binge: false,
    /**
     * The hour at which to binge-like
     * @type {Number}
     */
    bingeHour: 23,
    /**
     *  The minute at which to binge-like
     * @type {Number}
     */
    bingeMinute: 30,
    /**
     * Maximum amout of posts to like while binging
     * @type {Number}
     */
    bingeCap: 10000,
    /**
     * The topic to auto-like. Defaults to /t/1000
     * @type {Number}
     */
    topic: 1000,
    /**
     * How long to delay before liking in cyborg mode.
     * @type {Number}
     */
    cyborgDelay: 30 * 1000
};

 /**
 * The name of this sock_module
 */
exports.name = 'AutoLikes';

  /**
 * If defined by a sock_module it is the priority
 * of the module with respect to other modules.
 *
 * sock_modules **should not** define modules with negative permissions.
 * Default value is 50 with lower numbers being higher priority.
 */
exports.priority = 0;

/**
 * The version of this sock_module
 */
exports.version = '1.14.0';

/**
 * Replaces variables in formatting strings, kind of like printf
 * @param  {String} str - The string to format
 * @param  {Array} dict - The variables to format into the string
 * @return {String} the message after replacement
 */
function format(str, dict) {
    for (var name in dict) {
        str = str.replace(new RegExp('%' + name + '%', 'g'), dict[name]);
    }
    return str;
}

/**
 * Wrapper that standardizes parameters for innerBinge. Will binge on either one topic or many.
 * @param  {Function} callback - The callback to call when done binging
 */
function binge(callback) {
    if (typeof conf.topic === 'number') {
        innerBinge(conf.topic, callback);
    } else {
        async.each(conf.topic, function (topic, next) {
            return innerBinge(topic, next);
        }, callback);
    }
}

/**
 * Perform a binge-liking.  
 * @param  {Number} topic - The topic number to binge-like on
 * @param  {Function} callback - the callback to call when done binging
 */
function innerBinge(topic, callback) {
    var msg = 'Liking /t/%TOPIC%/%POST% by @%USER%';
    discourse.getAllPosts(topic, function (err, posts, next) {
        if (err || currentBingeCap <= 0) {
            return next(true);
        }
        var likeables = posts.filter(function (x) {
            var action = x.actions_summary.filter(function (y) {
                return y.id === 2;
            });
            return action && action[0].can_act;
        });
        likeables = likeables.slice(0, currentBingeCap);
        async.each(likeables, function (post, flow) {
            if (bingeIgnoreList.indexOf(post.username) >= 0) {
                flow();
            } else {
                discourse.log(format(msg, {
                    'TOPIC': post.topic_id,
                    'POST': post.post_number,
                    'USER': post.username
                }));
                discourse.postAction('like', post.id, function (err2, resp) {
                    setTimeout(function () {
                        flow(err2 || resp.statusCode === 429);
                    }, 100);
                });
                currentBingeCap--;
            }
        }, next);
    }, function () {
        callback();
    });
}

/**
 * Schedule new binges according to configuration
 */
function scheduleBinges() {
    async.forever(function (cb) {
        var now = new Date(),
            utc = new Date(),
            hours,
            minutes;
        utc.setUTCHours(conf.bingeHour);
        utc.setUTCMinutes(conf.bingeMinute);
        utc.setUTCSeconds(0);
        utc.setMilliseconds(0);
        now = now.getTime();
        utc = utc.getTime();
        if (now > utc) {
            // add a day if scheduling after 23:40 UTC
            utc += 24 * 60 * 60 * 1000;
        }
        minutes = Math.ceil(((utc - now) / 1000) / 60);
        hours = Math.floor(minutes / 60);
        minutes = minutes % 60;
        discourse.log('Like Binge scheduled for ' + hours + 'h' +
            minutes + 'm from now');
        setTimeout(function () {
            currentBingeCap = conf.bingeCap;
            binge(cb);
        }, utc - now);
    });
}

/**
 * Handler for when a message is received. If it is a new post creation message in the correct thread, 
 * the module will like it. 
 * @param  {Object} message - The message that was received
 * @param  {Object} post - The post information for that message
 * @param  {Function} callback - The callback to call when done
 */
exports.onMessage = function onMessage(message, post, callback) {
    if (message.data && message.data.type === 'created') {
        if (post) {
            discourse.log('Liking Post /t/' + post.topic_id +
                '/' + post.post_number + ' by @' + post.username);
        } else {
            discourse.log('Liking Post #' + message.data.id);
        }
        setTimeout(function () {
            discourse.postAction('like', message.data.id, callback);
        }, Math.floor(Math.random() * 5 * 1000) + delay);
    } else {
        callback();
    }
};

/**
 * Register listeners that do the following if we are in follow mode
 * @param  {Function} callback - the callback to call when complete
 */
exports.registerListeners = function registerListeners(callback) {
    if (conf.enabled && conf.follow) {
        if (typeof conf.topic === 'number') {
            callback(null, ['/topic/' + conf.topic]);
        } else {
            callback(null, conf.topic.map(function (v) {
                return '/topic/' + v;
            }));
        }
    } else {
        callback();
    }
};

/**
* Bootstrap the module
* @param  {string} browser - discourse.
* @param  {object} config - The configuration to use
*/
exports.begin = function begin(browser, config) {
    conf = config.modules[exports.name];
    discourse = browser;
    delay = config.cyborg ? conf.cyborgDelay : 1;
    if (conf.enabled && conf.binge) {
        bingeIgnoreList = config.admin.ignore;
        scheduleBinges();
    }
};
 