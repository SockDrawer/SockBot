/*jslint node: true, indent: 4, unparam: true, bitwise: true  */
/**
 * @module message_bus
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

    function delay(fn, time) {
        process.nextTick(function () {
            if (time) {
                setTimeout(fn, time);
            } else {
                fn();
            }
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

    /**
     * Poll the message_bus once and process messages from the poll
     */
    function pollMessageBus(callback) {
        if (m_config.verbose) {
            // Feedback to the console.
            console.log("Polling Message Bus " + (new Date()));
        }

        //Initiate the poll
        m_browser.post_message('message-bus/' + client_id + '/poll', channels, function (err, resp, data) {
            // On failure delay 30 seconds before continuing processing
            if (err || resp.statusCode >= 300) {
                delay(callback, 30 * 1000);
                return;
            }
            // Process any messages that were returned by the poll
            async.eachSeries(data, function processMessage(message, next) {
                async.waterfall([

                    function getTheMessagePost(cb) {
                        if (message.data && message.data.post_number) {
                            m_browser.get_post(message.data.id, function (post) {
                                delay(function () {
                                    cb(null, post);
                                });
                            });
                        } else {
                            delay(function () {
                                cb(null, undefined);
                            });
                        }
                    },
                    function dispatchTheMessage(post, cb) {
                        // Update the channel history
                        channels[message.channel] = message.message_id;
                        // Pass the message off to each module that wants to listen to this channel
                        async.eachSeries(registrations[message.channel], function (module, innerNext) {
                            delay(function handleMessageWithSockModule() {
                                module.onMessage(message, post, function (handled) {
                                    // If handled stop processing more handlers for message and wait 5 seconds
                                    // before continuing, otherwise continue immediately
                                    if (handled) {
                                        delay(function () {
                                            innerNext(true);
                                        }, 5 * 1000);
                                    } else {
                                        delay(innerNext);
                                    }
                                });
                            });
                        }, function () {
                            delay(cb);
                        });
                    },
                    function () {
                        delay(next);
                    }
                ]);
            }, function () {
                // Delay 1/4 seconds after poll before continuing processing
                delay(callback, 0.25 * 1000);
            });
        });
    }

    function handleNotifications(message, post, callback) {
        //we have some notifications here!
        m_browser.get_content('/notifications', function (err, resp, notifications) {
            // If error wait 5 seconds before continuing
            if (err || resp.statusCode >= 300) {
                delay(callback, 5 * 1000);
                return;
            }
            // If no notifications just continue processing
            if (!notifications || typeof notifications !== 'object' || typeof notifications.filter !== 'function') {
                delay(callback);
                return;
            }
            // Remove notifications that have happened in the past. no double processing
            notifications = notifications.filter(function (n) {
                n.created_at = Date.parse(n.created_at);
                return n.created_at >= notify_time;
            });
            // Sort notifications by creation time (so PMs don't stick to the top)
            notifications.sort(function (a, b) {
                return (b.created_at + 1) - (a.created_at + 1);
            });
            // Choose the time of the latest notification as the next cutoff
            if (notifications) {
                notify_time = notifications[0].created_at + 1;
            }
            // Process any remaining notifications
            async.eachSeries(notifications, function processNotifications(notify, cb) {
                async.waterfall([
                    // Get the post for the notification
                    function getNotificationPost(cb) {
                        if (notify.data.original_post_id) {
                            m_browser.get_post(notify.data.original_post_id, function (post) {
                                delay(function () {
                                    cb(null, post);
                                });
                            });
                        } else {
                            delay(function () {
                                cb(null, undefined);
                            });
                        }
                    },
                    // Allow sock_modules to process the notification
                    function processNotificationUsingModules(post, cb) {
                        async.eachSeries(sock_modules,
                            function moduleHandleNotification(module, complete) {
                                if (typeof module.onNotify === 'function') {
                                    delay(function () {
                                        module.onNotify(notify_types[notify.notification_type], notify, post, complete);
                                    });
                                } else {
                                    delay(complete);
                                }
                            }, function afterModules(handled) {
                                // Mark the notification read
                                delay(function () {
                                    if (notify.topic_id && notify.topic_id > 0) {
                                        var form = {
                                            'topic_id': notify.topic_id,
                                            'topic_time': 3232
                                        };
                                        form['timings[' + notify.post_number + ']'] = 3232;
                                        m_browser.post_message('topics/timings', form, callback);
                                    } else {
                                        callback();
                                    }
                                }, handled ? 5 * 1000 : 1000);
                            });
                    }
                ]);
            }, function () {
                delay(callback);
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

    //Periodically poll modules to find the channels they are interested in
    function pollSubscribers(cb) {
        var reg = {},
            chan = {};
        reg['/__status'] = [{
            onMessage: updateChannels
        }];
        //If we're configured to handle notifications add the notification listener
        if (m_config.notifications) {
            console.log('notification');
            reg['/notification/' + m_config.user.id] = [{
                onMessage: handleNotifications
            }];
            chan['/notification/' + m_config.user.id] = -1;
        }
        //Poll all modules for their channel registrations
        async.each(sock_modules, function (module, callback) {
            // Ignore the ones that don't implement the right interface
            if (typeof module.registerListeners !== 'function' || typeof module.onMessage !== 'function') {
                callback();
                return;
            }
            delay(function () {
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
            });
        }, function () {
            //Remember where we were in channels that we've already seen
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