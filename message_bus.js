/*jslint node: true, indent: 4, unparam: true, bitwise: true  */
/**
 * @module message_bus
 * @author Accalia
 * @license MIT
 * @overview Implements a message_bus poller for Discourse
 */
(function () {
    'use strict';

    function uuid(a) {
        //I don't understand how this does what it does, but it works.
        // It's a lot slower than using node-uuid but i only need one of these so its good enough
        // Source: http://jsperf.com/node-uuid-performance/19
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    var async = require('async'),
        m_browser,
        m_config,
        client_id = uuid(),
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
        notify_time = (new Date()).getTime();

    function pollMessageBus(callback) {
        console.log("Polling Message Bus " + (new Date()));
        var posts = {};
        m_browser.post_message('message-bus/' + client_id + '/poll', channels, function (err, resp, data) {
            if (err || resp.statusCode >= 300) {
                setTimeout(callback, 15 * 1000);
                return;
            }
            async.eachSeries(data, function (message, next) {
                async.waterfall([

                    function (cb) {
                        if (message.data && message.data.post_number) {
                            //try to avoid getting same post multiple times per message pass
                            if (posts[message.data.post_number]) {
                                cb(null, posts[message.data.post_number]);
                            } else {
                                m_browser.get_post(message.data.id, function (post) {
                                    posts[message.data.post_number] = post;
                                    cb(null, post);
                                });
                            }
                        } else {
                            cb(null, undefined);
                        }
                    },
                    function (post, cb) {
                        channels[message.channel] = message.message_id;
                        if (!registrations[message.channel]) {
                            cb();
                            return;
                        }
                        async.eachSeries(registrations[message.channel], function (handler, innerNext) {
                            handler.onMessage(message, post, function (handled) {
                                if (handled) {
                                    setTimeout(function () {
                                        innerNext(true);
                                    }, 5 * 1000);
                                } else {
                                    innerNext();
                                }
                            });
                        }, function () {
                            cb();
                        });
                    },
                    function () {
                        next();
                    }
                ]);
            }, function () {
                setTimeout(callback, 5 * 1000);
            });
        });
    }

    function handleNotifications(message, post, callback) {
        //we have some notifications here!
        m_browser.get_content('/notifications', function (err, resp, notifications) {
            if (err || resp.statusCode >= 300 || !notifications || typeof notifications !== 'object' || typeof notifications.filter !== 'function') {
                setTimeout(callback, 5 * 1000);
                return;
            }
            notifications = notifications.filter(function (n) {
                n.created_at = Date.parse(n.created_at);
                return n.created_at >= notify_time;
            });
            notifications.sort(function (a, b) {
                return (b.created_at + 1) - (a.created_at + 1);
            });
            if (notifications) {
                notify_time = notifications[0].created_at + 1;
            }
            async.eachSeries(notifications, function (notify, cb) {
                async.waterfall([

                    function (cb) {
                        if (notify.data.original_post_id) {
                            m_browser.get_post(notify.data.original_post_id, function (post) {
                                cb(null, post);
                            });
                        } else {
                            cb(null, undefined);
                        }
                    },
                    function (post, cb) {
                        async.eachSeries(sock_modules,
                            function (module, complete) {
                                if (typeof module.onNotify === 'function') {
                                    module.onNotify(notify_types[notify.notification_type], notify, post, complete);
                                } else {
                                    complete();
                                }
                            }, function (handled) {
                                setTimeout(function () {
                                    if (notify.topic_id && notify.topic_id > 0) {
                                        var form = {
                                            'topic_id': notify.topic_id,
                                            'topic_time': 3232
                                        };
                                        form['timings[' + notify.post_number + ']'] = 2232;
                                        m_browser.post_message('topics/timings', form, callback);
                                    } else {
                                        callback();
                                    }
                                }, handled ? 5000 : 1000);
                            });
                    }
                ]);
            }, function () {
                callback();
            });
        });
    }

    function updateChannels(message, post, callback) {
        var channel;
        if (!message || message.channel !== '/__status') {
            callback();
            return;
        }
        for (channel in message.data) {
            if (message.data.hasOwnProperty(channel) && channels.hasOwnProperty(channel)) {
                channels[channel] = message.data[channel];
            }
        }
        callback();
    }

    function pollSubscribers(cb) {
        var reg = {},
            chan = {};
        reg['/__status'] = [{
            onMessage: updateChannels
        }];
        if (m_config.notifications) {
            reg['/notification/' + m_config.user.id] = [{
                onMessage: handleNotifications
            }];
            chan['/notification/' + m_config.user.id] = -1;
        }
        async.each(sock_modules, function (module, callback) {
            if (typeof module.registerListeners !== 'function' || typeof module.onMessage !== 'function') {
                callback();
                return;
            }
            module.registerListeners(function (regs) {
                if (regs && regs.length) {
                    regs.forEach(function (r) {
                        var a = (reg[r] || []);
                        a.push(module);
                        reg[r] = a;
                        chan[r] = -1;
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
            cb();
        });
    }


    exports.begin = function begin(browser, config, modules) {
        m_config = config;
        m_browser = browser;
        sock_modules = modules;

        pollSubscribers(function () {
            async.forever(pollMessageBus);
            async.forever(function (next) {
                pollSubscribers(function () {
                    setTimeout(next, 60 * 1000);
                });
            });
        });
    };

}());