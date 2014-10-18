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
        notify_time = (new Date().getTime()),
        message_bus = 'message-bus/' + uuid() + '/poll';

    function delay(fn, time) {
        setTimeout(fn, delay_factor * (time || (delay_factor < 1.1 ? 0 : 333)));
    }

    function pollMessages(callback) {
        if (conf.verbose) {
            console.log('Polling for Messages @' + (/[\d]{2}:[\d]{2}:[\d]{2}/.exec(new Date().toUTCString())[0]));
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

                        function getThePost(cb) {
                            if (message.data && message.data.post_number) {
                                discourse.getPost(message.data.id, function (post) {
                                    cb(null, post);
                                });
                            } else {
                                cb(null, null);
                            }
                        },
                        function dispatchMessage(post, cb) {
                            channels[message.channel] = Math.max(channels[message.channel], message.message_id);
                            async.eachSeries(registrations[message.channel], function (module, next) {
                                module.onMessage(message, post, function (handled) {
                                    delay(function () {
                                        next(!!handled);
                                    }, handled ? 5 * 1000 : 1000);
                                });
                            }, cb);
                        }
                    ], next);
                },
                delay(callback, 12 * 1000));
        });
    }

    function handleNotifications(message, post, callback) {
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
                async.waterfall([

                    function (innerNext) {
                        if (notification.data.original_post_id) {
                            discourse.getPost(notification.data.original_post_id, function (post) {
                                innerNext(null, post);
                            });
                        } else {
                            innerNext(null, undefined);
                        }
                    },
                    function (post, innerNext) {
                        async.eachSeries(sock_modules, function (module, complete) {
                            if (typeof module.onNotify === 'function') {
                                module.onNotify(notify_types[notification.notification_type], notification, post, complete);
                            } else {
                                complete();
                            }
                        }, function (handled) {
                            var after = function () {
                                delay(callback, handled ? 5 * 1000 : 1000);
                            };
                            if (!conf.cyborg) {
                                return discourse.readPosts(notification.topic_id, notification.post_number, after);
                            }
                            after();
                        });
                    }
                ]);
            });
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
        if (conf.notifications) {
            reg['/notification/' + conf.user.id] = [{
                onMessage: handleNotifications
            }];
            chan['/notification/' + conf.user.id] = -1;
        }
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
        });
    }
    exports.begin = begin;
}());