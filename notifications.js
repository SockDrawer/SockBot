'use strict';
/**
 * notifications handler for SockBot2.0
 * @module notifications
 * @author Accalia
 * @license MIT
 */
const async = require('async');
const config = require('./config'),
    utils = require('./utils');
const browser = require('./browser')();
const internals = {
        notifyTypes: {
            1: 'mentioned',
            2: 'replied',
            3: 'quoted',
            4: 'edited',
            5: 'liked',
            6: 'private_message',
            7: 'invited_to_private_message',
            8: 'invitee_accepted',
            9: 'posted',
            10: 'moved_post',
            11: 'linked',
            12: 'granted_badge'
        }
    },
    privateFns = {
        onNotificationMessage: onNotificationMessage,
        handleTopicNotification: handleTopicNotification
    };

exports.prepare = function prepare(events, callback) {
    internals.events = events;
    events.onChannel('/notifications/' + config.user.id, privateFns.onNotificationMessage);
    callback();
};

exports.pollNotifications = function pollNotifications(callback) {
    browser.getNotifications((err, notifications) => {
        if (err) {
            return callback(err);
        }
        notifications.notifications.filter((n) => !n.read).forEach((n) => {
            n.type = internals.notifyTypes[n.notification_type];
            if (!n.type) {
                n.type = 'UNKNOWN';
            }
            if (n.topic_id) {
                return privateFns.handleTopicNotification(n);
            }
            const handled = internals.events.emit('notification#' + n.type,
                n, null, null);
            if (!handled) {
                utils.warn(n.type + ' notification #' + n.id + ' was not handled!');
            }
        });
        callback(null);
    });
};

function handleTopicNotification(notification) {
    async.parallel({
        topic: (cb) => browser.getTopic(notification.topic_id, cb),
        post: (cb) => browser.getPost(notification.data.original_post_id, cb)
    }, (err, result) => {
        if (err) {
            return;
        }
        utils.filterIgnored(result.topic, result.post, (ignored) => {
            if (!ignored) {
                const handled = internals.events.emit('notification#' + notification.type, notification, result.topic,
                    result.post);
                if (!handled) {
                    utils.warn(notification.type + ' notification #' + notification.id + ' was not handled!');
                }
            }
        });
    });
}

function onNotificationMessage(message) {
    if (message.unread_notifications > 0 || message.unread_private_messages > 0) {
        exports.pollNotifications(() => 0);
    }
}

/**
 * Completion Callback
 *
 * @callback
 * @name completionCallback
 * @param {string|Error} err Filter Error state
 */

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.internals = internals;
    exports.privateFns = privateFns;
}
