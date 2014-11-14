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

// Handle a single message for all interested modules
function handleMessage(message, post, callback) {
    var interestedModules = registrations[message.channel];
    // Run modules in sequence, not in parallel
    async.eachSeries(interestedModules, function (module, innerNext) {
        //Allow module to process
        module.onMessage(message, post, function (err, handled) {
            if (err) {
                discourse.warn('Module `' + module.name +
                    '` reported error.');
            }
            // Stop processing further modules if module reports error or that
            // it handled the message completely
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
        // Update channels so we don't get the same nessages all the time
        messages.forEach(function (m) {
            channels[m.channel] = Math.max(channels[m.channel], m.message_id);
        });
        // Merge notification messages down to only the most recent
        var notifications = '/notification/' + conf.user.user.id;
        messages = messages.filter(function (m) {
            return m.channel !== notifications ||
                m.message_id === channels[notifications];
        });
        // Filter out messages that are usually irrelevant, unless configuration
        // says they are relevant
        if (!conf.processActed) {
            messages = messages.filter(function (m) {
                return !m.data || m.data.type !== 'acted';
            });
        }
        // Pause a second before retry if we have no more messages.
        // Prevents message-bus spam
        if (!messages || messages.length === 0) {
            return setTimeout(callback, 1000);
        }
        async.each(messages, function (message, next) {
            async.waterfall([
                // If message is associated with post, load post
                function (flow) {
                    if (message.data && message.data.post_number) {
                        return discourse.getPost(message.data.id, flow);
                    }
                    return flow(null, null, null);
                },
                // pass message off to handlers
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

// Handle notifications
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
            return (notifyTypes[n.notification_type] === 'private_message' ||
                n.createdAt >= notifyTime) && !n.read;
        });
        // Note when the newest unacted notification is. this is where we
        // start looking next time
        if (notifications && notifications[0]) {
            notifyTime = notifications[0].createdAt + 1;
        }
        async.each(notifications, function (notification, next) {
            async.waterfall([
                // If notification is associated with a post, load it
                function (flow) {
                    if (notification.data.original_post_id) {
                        return discourse.getPost(
                            notification.data.original_post_id, flow);
                    }
                    return flow(null, null, null);
                },
                function (resp, post, flow) {
                    // Hand notification off to sock_modules for processing
                    handleNotification(notification, post,
                        function (err, handled) {
                            // If notification has a post. mark it read
                            //TODO: figure out how to handle this for badges too
                            if (post && post.post_number) {
                                return discourse.readPosts(post.topic_id,
                                    post.post_number,
                                    function () {
                                        flow(err, handled);
                                    });
                            }
                            return flow(err, handled);
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

//Message-bus handler that handles notifications
function doNotifications(message, post, callback) {
    // check to see if message is notification with interesting things.
    // If so pull notification.json
    if (message && message.channel === '/notification/' + conf.user.user.id &&
        (message.data.unread_notifications > 0 ||
            message.data.unread_private_messages > 0)) {
        return pollNotifications(callback);
    }
    return callback();
}
doNotifications.name = 'message_bus.doNotifications()';
doNotifications.onMessage = doNotifications;

//message-bus handler that handles /__status messages
function updateChannels(message, post, callback) {
    //Apply the status to the channels
    if (message && message.channel === '/__status') {
        for (var channel in message.data) {
            channels[channel] = message.data[channel];
        }
    }
    callback();
}
updateChannels.name = 'message_bus.updateChannels()';
updateChannels.onMessage = updateChannels;

//Poll all sock_modules for channels they are interested in
function updateRegistrations(callback) {
    var reg = {};
    // /__status is required and handled by message-bus
    reg['/__status'] = [updateChannels];
    // If configuration sets notifications add notifications
    if (conf.notifications) {
        reg['/notification/' + conf.user.user.id] = [doNotifications];
    }
    // Grab all sock_modules asynchronously and merge results.
    async.each(modules, function (module, next) {
        // Ignore modules that don't look like a duck
        // registerListeners and onMessage functions required for message-bus
        if (typeof module.registerListeners !== 'function' ||
            typeof module.onMessage !== 'function') {
            return next();
        }
        // Ask module to register for channels it is interested in
        module.registerListeners(function (err, channels) {
            if (err) {
                return next();
            }
            // Register channels
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
        // Update global registrations
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
