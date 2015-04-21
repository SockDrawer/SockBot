/**
 * @module messageBus
 * @author Accalia
 * @license MIT
 * @overview Used for dealing with long poll notifications from discourse.
 */
'use strict';

var async = require('async'),
    conf = require('./configuration').configuration,
    discourse = require('./discourse');

var modules = [],
    registrations = {},
    channels = {},
    notifyTime = (new Date()).getTime(),
    notifyTypes = {
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
    };
/** 
 * Handle a message
 * @param {string} message - The message to handle
 * @param {string} post - Some sort of post
 * @param {function} callback - The callback to call after the message has been handled
 */
function handleMessage(message, post, callback) {
    var interestedModules = registrations[message.channel];
    async.eachSeries(interestedModules, function (module, innerNext) {
        module.onMessage(message, post, function (err, handled) {
            if (err) {
                discourse.warn('Module `' + module.name +
                    '` reported error.');
            }
            innerNext(err || handled);
        });
    }, function () {
        callback();
    });
}

function pollMessages(callback) {
    if (conf.verbose) {
        discourse.log('Polling for Messages');
    }
    discourse.getMessageBus(channels, function (err, resp, messages) {
        if (err) {
            discourse.warn('Error in message-bus: ' + err);
            setTimeout(callback, 30 * 1000);
        }
        messages.forEach(function (m) {
            channels[m.channel] = Math.max(channels[m.channel], m.message_id);
        });
        var notifications = '/notification/' + conf.user.user.id;
        messages = messages.filter(function (m) {
            return m.channel !== notifications ||
                m.message_id === channels[notifications];
        });
        if (!conf.processActed) {
            messages = messages.filter(function (m) {
                return !m.data || m.data.type !== 'acted';
            });
        }
        if (!messages || messages.length === 0) {
            return setTimeout(callback, 1000);
        }
        async.each(messages, function (message, next) {
            async.waterfall([

                function (flow) {
                    if (message.data && message.data.post_number) {
                        return discourse.getPost(message.data.id, flow);
                    }
                    return flow(null, null, null);
                },
                function (resp, post, flow) {
                    handleMessage(message, post, flow);
                }
            ], function (err) {
                if (err) {
                    discourse.warn('Error processing message for `' +
                        message.channel + '`: ' + err);
                }
                // error processing message should not flow over to
                // rest of message processing
                next();
            });
        }, callback);
    });
}

function handleNotification(notification, post, callback) {
    async.eachSeries(modules, function (module, complete) {
        if (typeof module.onNotify === 'function') {
            module.onNotify(notifyTypes[notification.notification_type],
                notification, post, complete);
        } else {
            complete();
        }
    }, function () {
        callback();
    });
}

function pollNotifications(callback) {
    if (conf.verbose) {
        discourse.log('Polling for Notifications');
    }
    discourse.getNotifications(function (err, resp, notifications) {
        if (err) {
            discourse.warn('Error in notifications: ' + err);
            return callback(err);
        }
        if (!notifications || !Array.isArray(notifications)) {
            return callback('No notifications');
        }
        // Sort the notifications to prevent bubbled notifications
        // throwing things off
        notifications.sort(function (a, b) {
            return (b.created_at + 1) - (a.created_at + 1);
        });
        // Filter out notifications that are too old or already acted on
        notifications = notifications.filter(function (n) {
            n.createdAt = Date.parse(n.created_at);
            return (notifyTypes[n.notification_type] === 'private_message') ||
                (n.createdAt >= notifyTime && !n.read);
        });
        // Note when the newest unacted notification is. this is where we
        // start looking next time
        if (notifications && notifications[0]) {
            notifyTime = notifications[0].createdAt + 1;
        }
        async.each(notifications, function (notification, next) {
            async.waterfall([

                function (flow) {
                    if (notification.data.original_post_id) {
                        return discourse.getPost(
                            notification.data.original_post_id, flow);
                    }
                    return flow(null, null, null);
                },
                function (resp, post, flow) {
                    handleNotification(notification, post,
                        function (err, handled) {
                            if (post && post.post_number) {
                                return discourse.readPosts(post.topic_id,
                                    post.post_number, function () {
                                        flow(err, handled);
                                    });
                            }
                            flow(err, handled);
                        });
                }
            ], function (err) {
                if (err) {
                    discourse.warn('Error processing notification: ' + err);
                }

                // error processing message should not flow over to
                // rest of message processing
                next();
            });
        }, callback);
    });
}

function doNotifications(message, post, callback) {
    if (message && message.channel === '/notification/' + conf.user.user.id &&
        (message.data.unread_notifications > 0 ||
            message.data.unread_private_messages > 0)) {
        return pollNotifications(callback);
    }
    return callback();
}
doNotifications.name = 'message_bus.doNotifications()';
doNotifications.onMessage = doNotifications;

function updateChannels(message, post, callback) {
    if (message && message.channel === '/__status') {
        for (var channel in message.data) {
            channels[channel] = message.data[channel];
        }
    }
    callback();
}
updateChannels.name = 'message_bus.updateChannels()';
updateChannels.onMessage = updateChannels;

function updateRegistrations(callback) {
    var reg = {};
    reg['/__status'] = [updateChannels];
    if (conf.notifications) {
        reg['/notification/' + conf.user.user.id] = [doNotifications];
    }
    async.each(modules, function (module, next) {
        if (typeof module.registerListeners !== 'function' ||
            typeof module.onMessage !== 'function') {
            return next();
        }
        module.registerListeners(function (err, channels) {
            if (err) {
                return next();
            }
            if (channels && channels.length) {
                channels.forEach(function (channel) {
                    var arr = reg[channel] || [];
                    arr.push(module);
                    reg[channel] = arr;
                });
            }
            return next();
        });
    }, function () {
        registrations = reg;
        var chan = {};
        for (var channel in reg) {
            chan[channel] = channels[channel] || -1;
        }
        channels = chan;
        process.nextTick(callback);
    });
}

exports.begin = function begin(sockModules) {
    modules = sockModules;
    updateRegistrations(function () {
        async.forever(pollMessages);
        async.forever(function (next) {
            updateRegistrations(function () {
                setTimeout(next, 60 * 1000);
            });
        });
        if (conf.notifications) {
            async.forever(function (next) {
                var now = new Date().getTime(),
                    offset = 5 * 60 * 1000;
                if ((notifyTime + offset) > now) {
                    return setTimeout(next, (notifyTime + offset) - now);
                }
                pollNotifications(function () {
                    setTimeout(next, offset);
                });
            });
        }
    });
};
