'use strict';
var async = require('async');
var discourse,
    configuration;

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
    if (configuration.enabled && configuration.checkOwnPosts) {
        callback(null, ['/latest']);
    } else {
        callback();
    }
}

exports.onMessage = function onMessage(message, post, callback) {
    if (message.data && message.data.topic_id && message.data.message_type === 'latest') {
        discourse.getLastPosts(message.data.topic_id, function (post, flow) {
            if (post.yours) {
                discourse.log("Replacing emoji in post " + post.id);
                flow(null, true);
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