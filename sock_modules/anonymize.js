/*jslint node: true, indent: 4 */
(function () {
    'use strict';
    var xRegExp = require('xregexp').XRegExp,
        discourse,
        conf,
        r_quote = xRegExp('\\[quote.*post:(?<post_number>\\d+).*topic:(?<topic_id>\\d+)');

    exports.description = 'Anonymize replies';

    exports.configuration = {
        enabled: false
    };

    exports.name = "Anonymize";

    exports.priority = 0;

    exports.version = "1.12.0";


    exports.begin = function begin(browser, config) {
        discourse = browser;
        conf = config.modules[exports.name];
    };

    exports.onNotify = function (type, notification, post, callback) {
        if (!conf.enabled || !post || !post.cleaned || type !== 'private_message') {
            return callback();
        }
        var match = r_quote.xexec(post.raw);
        if (!match){
            return callback();
        }
        discourse.postReply(match.topic_id, match.post_number, post.raw, function(){
            callback(true);
        });
    };

}());
