/*jslint node: true, indent: 4, unparam: true, bitwise: true  */
/**
 * Even though it says notifications on the tin it uses message_bus
 * @module notifications
 * @author Accalia
 * @license MIT
 * @overview Implements a message_bus poller for Discourse
 */
(function () {
    'use strict';

    /**
     * Generate a type 4 UUID.
     * I don't understand how this does what it does, but it works.
     * It's a lot slower than using node-uuid but i only need one of these so its good enough
     * Source: http://jsperf.com/node-uuid-performance/19
     */
    function uuid() {

        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    var async = require('async'),
        conf = require('./configuration').configuration,
        delay_factor = conf.cyborg ? 3 : 1,
        discourse = require('./discourse'),
        sock_modules,
        registrations = {},
        channels = {},
        notify_types = {
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
        action_types = {
            1: 'bookmark',
            2: 'like',
            3: 'off_topic',
            4: 'inappropriate',
            5: 'vote',
            8: 'spam',
            6: 'notify_user',
            7: 'notify_moderators'
        },
        notify_time = (new Date().getTime()),
        message_bus = 'message-bus/' + uuid() + '/poll';

    function delay(fn, time) {
        setTimeout(fn, delay_factor * (time || (conf.cyborg ? 0 : 333)));
    }

    function pollMessages(callback) {
        if (conf.verbose) {
            discourse.log('Polling for Messages');
        }
        discourse.postContent(message_bus, channels, function (err, resp, messages) {
            if (err || resp.statusCode >= 300) {
                return delay(callback, 30 * 1000);
            }
            if (!conf.processActed) {
                messages = messages.filter(function (message) {
                    channels[message.channel] = Math.max(channels[message.channel], message.message_id);
                    return message.data.type !== 'acted';
                });
            }
            async.eachSeries(messages,
                function (message, next) {
                    async.waterfall([

                        function (cb) {
                            if (message.data && message.data.post_number) {
                                discourse.getPost(message.data.id, function (post) {
                                    cb(null, post);
                                });
                            } else {
                                cb(null, undefined);
                            }
                        },
                        function (post, cb) {
                            async.eachSeries(registrations[message.channel], function (module, innerNext) {
                                module.onMessage(message, post, function (handled) {
                                    delay(function () {
                                        innerNext(!!handled);
                                    }, handled ? 5 * 1000 : 1000);
                                });
                            }, function () {

                                cb();
                            });
                        }
                    ], function () {
                        next();
                    });

                },
                function () {
                    delay(callback, 15 * 1000);
                });
        });
    }

    function processNotifications(callback) {
        if (conf.verbose) {
            discourse.log('Polling for Notifications');
        }

        function get_post(notification, callback) {
            if (notification.data.original_post_id) {
                discourse.getPost(notification.data.original_post_id, function (post) {
                    callback(post);
                });
            } else {
                callback();
            }
        }
        discourse.getContent('/notifications', function (err, resp, notifications) {
            if (err || resp.statusCode >= 300) {
                return delay(callback, 5 * 1000);
            }
            if (!notifications || !Array.isArray(notifications)) {
                return delay(callback);
            }
            notifications = notifications.filter(function (n) {
                n.created_at = Date.parse(n.created_at);
                return n.created_at >= notify_time && !n.read;
            });
            notifications.sort(function (a, b) {
                return (b.created_at + 1) - (a.created_at + 1);
            });
            if (notifications && notifications[0]) {
                notify_time = notifications[0].created_at + 1;
            }
            async.eachSeries(notifications, function (notification, next) {
                get_post(notification, function (post) {
                    async.eachSeries(sock_modules, function (module, complete) {
                        if (typeof module.onNotify === 'function') {
                            module.onNotify(notify_types[notification.notification_type], notification, post, complete);
                        } else {
                            complete();
                        }
                    }, function (handled) {
                        var after = function () {
                            next();
                        };
                        if (!conf.cyborg) {
                            return discourse.readPosts(notification.topic_id, notification.post_number, after);
                        }
                        after();
                    });
                });

            }, callback);
        });
    }

    function updateChannels(message, post, callback) {
        var channel;
        if (message && message.channel === '/__status') {
            // load the status so we don't get messages multiple times
            for (channel in message.data) {
                if (message.data.hasOwnProperty(channel) && channels.hasOwnProperty(channel)) {
                    channels[channel] = message.data[channel];
                }
            }
        }
        delay(callback);
    }

    function updateRegistrations(callback) {
        var reg = {},
            chan = {};
        reg['/__status'] = [{
            onMessage: updateChannels
        }];
        async.each(sock_modules, function (module, callback) {
            if (typeof module.registerListeners !== 'function' || typeof module.onMessage !== 'function') {
                return callback();
            }
            module.registerListeners(function (channels) {
                if (channels && channels.length) {
                    channels.forEach(function (channel) {
                        var arr = reg[channel] || [];
                        arr.push(module);
                        reg[channel] = arr;
                        chan[channel] = -1;
                    });
                }
                callback();
            });
        }, function () {
            var c;
            registrations = reg;
            for (c in chan) {
                if (chan.hasOwnProperty(c)) {
                    chan[c] = channels[c] || -1;
                }
            }
            channels = chan;
            callback();
        });
    }

    function begin(modules) {
        sock_modules = modules;
        updateRegistrations(function () {
            async.forever(pollMessages);
            async.forever(function (next) {
                updateRegistrations(function () {
                    delay(next, 60 * 1000);
                });
            });
            if (conf.notifications) {
                async.forever(function (next) {
                    processNotifications(function () {
                        delay(next, 15 * 1000);
                    });
                });
            }
        });
    }
    exports.begin = begin;
}());