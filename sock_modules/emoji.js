'use strict';
var async = require('async');
var discourse,
    configuration,
    emojiSig = "<!-- Emoji'd by";

exports.description = 'Automatically replace emoji with Discourse emoji codes';

exports.configuration = {
    enabled: false
};

exports.name = 'MobileEmoji';
exports.priority = undefined;
exports.version = '0.1.0';

exports.begin = function begin(browser, config) {
    discourse = browser;
    configuration = config.modules[exports.name];
}

exports.registerListeners = function registerListeners(callback) {
    if (configuration.enabled) {
        callback(null, ['/latest']);
    } else {
        callback();
    }
}

exports.onMessage = function onMessage(message, post, callback) {
    if (message.data && message.data.topic_id && message.data.message_type === 'latest') {
        discourse.getLastPosts(message.data.topic_id, function (post, flow) {
            if (post.yours && post.raw.indexOf(emojiSig) < 0) {
                var raw = post.raw;
                
                //Synchronous implementation to be made async later
                for (var emoji in emojiLookup) {
                    raw = raw.replace(emoji, emojiLookup[emoji]);
                }

                //Sign the post so we don't process it again
                raw += "\n\n" + emojiSig + " " + exports.name + " " + exports.version + "-->";
                discourse.editPost(post.id, raw, exports.name + " " + exports.version, function () {
                    flow(null, true);
                });

                //Asynchronous implementation that doesn't work yet
                //async.each(emojiLookup, function (item, callback) {
                //    discourse.log(item);
                //    callback();
                //}, function () {
                //    discourse.log("Emoji in post " + post.id + " replaced");
                    
                //    //Sign the post so we don't process it again
                //    raw += "\n\n" + emojiSig + " " + exports.name + " " + exports.version + "-->";
                //    discourse.editPost(post.id, raw, exports.name + " " + exports.version, function () {
                //        flow(null, true);
                //    });
                //});
            }
            else {
                flow();
            }
        }, function () {
            callback();
        });
    } else {
        callback();
    }
};

var emojiLookup = {
    "☺": ":smile:",
    "☹": ":frowning:"
};