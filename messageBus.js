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
    TL1Timer = {},
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
    },
    messageInfo = {
        poll: Date.now(),
        message: null,
        time: null,
        module: null,
        moduleTime: null
    },
    responsive = true,
    notificationTime = Date.now();

function watchdog(callback) {
        var now = Date.now();
        //trigger if no poll in 5 minutes
        if (messageInfo.poll + 5 * 60 * 1000 < now && responsive) {
            responsive = false;
            return discourse.createPrivateMessage(conf.admin.owner,
                'Help, I\'ve fallen and I can\'t Get Up',
                'MessageBus has not been polled for more than five minutes.' +
                '\n\n```\n' +
                JSON.stringify(messageInfo, undefined, 4) + '\n```\n',
                callback);
        }
        if (conf.notifications && notificationTime + 10 * 60 * 1000 < now) {
            return discourse.createPrivateMessage(conf.admin.owner,
                'Help, I\'ve fallen and I can\'t Get Up',
                'Notifications has not been polled for more than ten minutes.' +
                ' Terminating bot.',
                function () {
                    discourse.warn('Terminating bot due to failure to poll');
                    /* eslint-disable no-process-exit */
                    process.exit(0);
                    /* eslint-able no-process-exit */
                });
        }
        callback();
    }
    //trigger watchdog every minute.
async.forever(function (next) {
    watchdog(function () {
        setTimeout(next, 60 * 1000);
    });
});

// Handle a single message for all interested modules
function handleMessage(message, post, callback) {
    var interestedModules = registrations[message.channel];
    // Run modules in sequence, not in parallel
    async.eachSeries(interestedModules, function (module, innerNext) {
        //Allow module to process
        messageInfo.module = module.name;
        messageInfo.moduleTime = new Date().toISOString();
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
    messageInfo.poll = Date.now();
    messageInfo.message = null;
    messageInfo.time = null;
    messageInfo.module = null;
    messageInfo.moduleTime = null;
    responsive = true;
    discourse.getMessageBus(channels, function (err, resp, messages) {
        if (err) {
            discourse.warn('Error in message-bus: ' + err);
            return updateRegistrations(function () {
                return setTimeout(callback, 30 * 1000);
            }, true);
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
            messageInfo.time = new Date().toISOString();
            messageInfo.message = message;
            async.waterfall([
                // If message is associated with post, load post
                function (flow) {
                    if (message.data && message.data.post_number) {
                        return discourse.getPost(message.data.id, flow);
                    }
                    return flow(null, null, null);
                },
                // pass message off to handlers
                function (resp2, post, flow) {
                    handleMessage(message, post, flow);
                }
            ], function (err2) {
                if (err2) {
                    discourse.warn('Error processing message for `' +
                        message.channel + '`: ' + err2);
                }
                // error processing message should not flow over to
                // rest of message processing
                next();
            });
        });
        callback();
    });
}

// Handle notifications
function handleNotification(notification, topic, post, callback) {
    async.eachSeries(modules, function (module, complete) {
        if (typeof module.onNotify === 'function') {
            module.onNotify(notifyTypes[notification.notification_type],
                notification, topic, post, complete);
        } else {
            complete();
        }
    }, function () {
        callback();
    });
}

function convertPostNumbers(post) {
    var nbr = [];
    for (var i = 0; i < 10; i += 1) {
        nbr.unshift(post - i);
    }
    return nbr;
}

var notificationsPending = false,
    notificationsActive = false;

function pollNotifications(callback) {
    if (notificationsActive) {
        notificationsPending = true;
        return callback();
    }
    notificationsActive = true;
    notificationTime = Date.now();
    if (conf.verbose) {
        discourse.log('Polling for Notifications');
    }
    discourse.getNotifications(function (err, resp, notifications) {
        if (err) {
            discourse.warn('Error in notifications: ' + err);
            return callback();
        }
        if (!notifications || !Array.isArray(notifications)) {
            return callback(null, 'No notifications');
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
                    if (notification.topic_id) {
                        return discourse.getTopic(notification.topic_id, flow);
                    }
                    return flow(null, null, null);
                },
                function (resp2, topic, flow) {
                    if (topic) {
                        // Do not allow muted topics
                        // shouldn't be getting notifications for these anyway
                        if (topic.details.notification_level_text === 'muted') {
                            return flow('ignore', 'Topic Was Muted');
                        }
                        var ignore = conf.admin.ignore;
                        var user = topic.details.created_by.username;
                        // Do not allow topics when creator is on ignore list
                        if (ignore.indexOf(user) >= 0) {
                            return flow('ignore', 'Topic Creator Ignored');
                        }
                    }
                    return flow(null, topic);
                },
                function (topic, flow) {
                    if (notification.data.original_post_id) {
                        return discourse.getPost(
                            notification.data.original_post_id,
                            function (err2, resp2, post) {
                                flow(err2, topic, post);
                            });
                    }
                    return flow(null, topic, null);
                },
                function (topic, post, flow) {
                    if (post) {
                        // Allow TL4+ regardless of other limits
                        if (post.trust_level >= 4) {
                            return flow(null, topic, post);
                        }
                        var ignore = conf.admin.ignore,
                            now = (new Date().getTime()),
                            user = post.username;
                        // Do not allow users on the ignore list
                        if (ignore.indexOf(user) >= 0) {
                            return flow('ignore', 'Poster Ignored');
                        }
                        // Do not allow TL0 users
                        if (post.trust_level < 1) {
                            return flow('ignore', 'Poster is TL0');
                        }
                        //Rate limit TL1 users
                        if (post.trust_level === 1) {
                            if (TL1Timer[user] && now < TL1Timer[user]) {
                                return flow('ignore',
                                    'Poster is TL1 on Cooldown');
                            }
                            TL1Timer[user] = now + conf.TL1Cooldown;
                        }
                        //Disallow other bots
                        if (post.primary_group_name === 'bots' &&
                            post.username !== 'SummonBot') {
                            return flow('ignore', 'Poster is a Bot');
                        }
                    }
                    return flow(null, topic, post);
                },
                function (topic, post, flow) {
                    // Hand notification off to sock_modules for processing
                    handleNotification(notification, topic, post,
                        function (err2, handled) {
                            // If notification has a post. mark it read
                            //TODO: figure out how to handle this for badges too
                            if (post && post.post_number) {
                                var nbr = post.post_number;
                                if (notification.notification_type === 6) {
                                    nbr = convertPostNumbers(post.post_number);
                                }
                                return discourse.readPosts(post.topic_id,
                                    nbr,
                                    function () {
                                        flow(err2, handled);
                                    });
                            }
                            return flow(err2, handled);
                        });
                }
            ], function (err2, reason) {
                if (err2 === 'ignore') {
                    discourse.warn('Notification Ignored: ' + reason);
                } else if (err2) {
                    discourse.warn('Error processing notification: ' + err2);
                }
                // error processing message should not flow over to
                // rest of message processing
                next();
            });
        }, function () {
            notificationsActive = false;
            if (notificationsPending) {
                notificationsPending = false;
                setTimeout(function () {
                    pollNotifications(function () {});
                }, 0);
            }
            callback();
        });
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

//Poll all sock_modules for channels they are interested in
function updateRegistrations(callback, force) {
    var reg = {};
    // /__status is required and handled by message-bus
    reg['/__status'] = [{
        name: 'message_bus.updateChannels()',
        onMessage: updateChannels
    }];
    // If configuration sets notifications add notifications
    if (conf.notifications) {
        reg['/notification/' + conf.user.user.id] = [{
            name: 'message_bus.doNotifications()',
            onMessage: doNotifications
        }];
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
        module.registerListeners(function (err, channels2) {
            if (err) {
                return next();
            }
            // Register channels
            if (channels2 && channels2.length) {
                channels2.forEach(function (channel) {
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
            chan[channel] = ((!force) && channels[channel]) || -1;
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
        /*
        async.forever(function (next) {
            function doNext() {
                setTimeout(next, 1 * 60 * 1000);
            }
            var trigger = Date.now() - 24 * 60 * 60 * 1000;
            if (resetOn < trigger) {
                return updateRegistrations(doNext, true);
            }
            doNext();
        });
        */
    }, true);
};
