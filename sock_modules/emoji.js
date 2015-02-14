'use strict';
//var async = require('async');
var discourse,
    configuration,
    emojiSig = '<!-- Emoji\'d by';

var emojiLookup = {
    '☺': ':smile:',
    '☹': ':frowning:'
};

exports.description = 'Automatically replace emoji with Discourse emoji codes';

exports.configuration = {
    enabled: false
};

exports.name = 'MobileEmoji';
exports.priority = undefined;
exports.version = '0.1.0';

var fullName = exports.name + ' ' + exports.version;

exports.begin = function begin(browser, config) {
    discourse = browser;
    configuration = config.modules[exports.name];
};

exports.registerListeners = function registerListeners(callback) {
    if (configuration.enabled) {
        callback(null, ['/latest']);
    } else {
        callback();
    }
};

exports.onMessage = function onMessage(message, post, callback) {
    if (message.data && message.data.topic_id
        && message.data.message_type === 'latest') {
        discourse.getLastPosts(message.data.topic_id, function (post2, flow) {
            if (post2.yours && post2.raw.indexOf(emojiSig) < 0) {
                var raw = post2.raw;

                //Synchronous implementation to be made async later
                for (var emoji in emojiLookup) {
                    raw = raw.replace(emoji, emojiLookup[emoji]);
                }
                discourse.log('Emoji in post ' + post2.id + ' replaced');

                //Sign the post so we don't process it again
                raw += '\n\n' + emojiSig + ' ' + fullName + '-->';
                discourse.editPost(post2.id, raw, fullName, function () {
                    flow(null, true);
                });

                //Asynchronous implementation that doesn't work yet
                //async.each(emojiLookup, function (item, callback) {
                //    discourse.log(item);
                //    callback();
                //}, function () {
                //    discourse.log('Emoji in post ' + post.id + ' replaced');

                //    //Sign the post so we don't process it again
                //    raw += '\n\n' + emojiSig + ' ' + fullName + '-->';
                //    discourse.editPost(post.id, raw, fullName, function () {
                //        flow(null, true);
                //    });
                //});
            } else {
                flow();
            }
        }, function () {
            callback();
        });
    } else {
        callback();
    }
};
