'use strict';
/**
 * notifications handler for SockBot2.0
 * @module notifications
 * @author Accalia
 * @license MIT
 */
const config = require('./config');
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
        onNotificationMessage: onNotificationMessage
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
    });
    callback();
};

function onNotificationMessage(message) {
    if (message.unread_notifications > 0 || message.unread_private_messages > 0) {
        exports.pollNotifications(() => 0);
    }
}
