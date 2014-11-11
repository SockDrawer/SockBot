/*jslint node: true, indent: 4 */
'use strict';
var xRegExp = require('xregexp').XRegExp;
var discourse,
    conf,
    rQuote = xRegExp('\\[quote.*post:(?<post_number>\\d+).*' +
        'topic:(?<topic_id>\\d+)');

exports.description = 'Anonymize replies';

exports.configuration = {
    enabled: false
};

exports.name = 'Anonymize';

exports.priority = 0;

exports.version = '1.13.0';


exports.begin = function begin(browser, config) {
    discourse = browser;
    conf = config.modules[exports.name];
};

exports.onNotify = function (type, notification, post, callback) {
    if ((!conf.enabled || !post) ||
        (!post.cleaned || type !== 'private_message')) {
        return callback();
    }
    var match = rQuote.xexec(post.raw);
    if (!match) {
        return callback();
    }
    var anon = 'Anonymizied Reply Sent. Thank you for using Anonymizer, ' +
        'a SockIndustries application.';
    discourse.log('Posting anonymously to ' + match.topic_id);
    discourse.createPost(match.topic_id, match.post_number, post.raw,
        function () {
            setTimeout(function () {
                discourse.createPost(notification.topic_id,
                    notification.post_number, anon, function () {

                    });
            }, 500);
            callback(true);
        });
};
