/*jslint node: true, indent: 4 */
/**
 * Anonymize module. Responsible for allowing anonymous users to "puppet" the bot, making it speak instead of them.
 * @module anonymize
 */
'use strict';
var xRegExp = require('xregexp').XRegExp;
var discourse,
    conf,
    rQuote = xRegExp('\\[quote.*post:(?<post_number>\\d+).*' +
        'topic:(?<topic_id>\\d+)'),
    anon = 'Anonymizied Reply Sent. Thank you for using Anonymizer, ' +
        'a SockIndustries application.';

/** Description of the module */
exports.description = 'Anonymize replies';

/** 
 * Configuration properties.
 * @property enabled - Whether to use anonymizer or not. Defaults to false.
 */
exports.configuration = {
    enabled: false
};

/** Name of the module */
exports.name = 'Anonymize';

/** Priority of the module */
exports.priority = 0;

/** Module version */
exports.version = '1.13.0';

/**
 * Bootstrap the module.
 * @param {string} browser - The browser I guess?
 * @param { object} config - The config I guess?
 */
exports.begin = function begin(browser, config) {
    discourse = browser;
    conf = config.modules[exports.name];
};

/**
 * Runs on notification. If the anonymizer is not enabled or there's no quote, 
 * it early aborts. Otherwise, it sends a post to the quote's topic containing 
 * the text.
 * @param {string} type - The type of event. Only responds if this is 'private_message'
 * @param {string} notification - The notification to respond to
 * @param {string} topic - Unused.
 * @param {string} post - The post the notification was for
 * @param {function} callback - The callback to notify when processing is complete.
 */
exports.onNotify = function (type, notification, topic, post, callback) {
    if ((!conf.enabled || !post) ||
        (!post.cleaned || type !== 'private_message')) {
        return callback();
    }
    var match = rQuote.xexec(post.raw);
    if (!match || post.topic_id.toString() === match.topic_id) {
        return callback();
    }

    match.raw = post.raw;

    exports.doAnonMsg(match, notification, callback);
};

exports.doAnonMsg = function(match, notification, callback) {
    discourse.log('Posting anonymously to ' + match.topic_id);
    discourse.createPost(match.topic_id, match.post_number, match.raw,
        function () {
            setTimeout(function () {
                discourse.createPost(notification.topic_id,
                    notification.post_number, anon, function () {

                    });
            }, 500);
            callback(true);
        });
}