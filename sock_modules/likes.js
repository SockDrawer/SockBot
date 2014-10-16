/*jslint node: true, indent: 4 */
(function () {
    'use strict';
    var async = require('async'),
        m_browser,
        m_config,
        configuration,
        likesList = [];

    /**
     * @var {string} description Brief description of this module for Help Docs
     */
    exports.description = 'Issue Likes to all posts in a thread';

    /**
     * @var {object} configuration Default Configuration settings for this sock_module
     */
    exports.configuration = {
        enabled: false,
        follow: false,
        binge: false,
        bingeHour: 23,
        bingeMinute: 50,
        topic: 1000,
    };

    /**
     * @var {string} name The name of this sock_module
     */
    exports.name = "AutoLikes";

    /**
     * @var {number} priority If defined by a sock_module it is the priority of the module with respect to other modules.
     *
     * sock_modules **should not** define modules with negative permissions. Default value is 50 with lower numbers being higher priority.
     */
    exports.priority = 0;

    /**
     * @var {string} version The version of this sock_module
     */
    exports.version = "1.1.0";

    function getPage(thread_id, start_post, callback) {
        m_browser.get_content('t/' + thread_id + '/' + start_post + '.json', function (err, req, contents) {
            if (err || req.statusCode >= 400) {
                console.error('Topic ' + thread_id + ' could not be loaded.');
                callback(-1);
                return;
            }
            if (req.statusCode >= 300) {
                console.log('Topic ' + thread_id + ' is private or not exist');
                callback(-1);
                return;
            }
            if (typeof contents !== 'object') {
                callback(0);
                return;
            }
            var posts = contents.post_stream.posts,
                likeables = posts.filter(function (x) {
                    var action = x.actions_summary.filter(function (y) {
                        return y.id === 2;
                    });
                    return action && action[0].can_act;
                }).filter(function (x) {
                    return likesList.filter(function (y) {
                        return x.id === y.post_id;
                    }).length === 0;
                });
            likeables.forEach(function (x) {
                var data = {
                    'form': {
                        'id': x.id,
                        'post_action_type_id': 2,
                        'flag_topic': false
                    },
                    'post_number': x.post_number,
                    'post_id': x.id,
                    'username': x.username
                };
                likesList.push(data);
            });
            callback(posts[posts.length - 1].post_number);
        });
    }

    function fillList(thread_id) {
        var start_post = 0;
        async.forever(function (cb) {
            if (likesList.length >= 1000) {
                // if likeslist is longer than limit wait an hour and check again
                setTimeout(cb, 60 * 60 * 1000);
                return;
            }
            getPage(thread_id, start_post, function (last_post) {
                if (last_post < 0) {
                    console.error(exports.name + ' encountered a fatal error. Stopping.');
                    cb(true);
                    return;
                }
                console.log('Processed ' + last_post + ' posts for likeable posts.');
                var got_results = last_post > start_post;
                start_post = last_post + 1;
                // delay a quarter second on post get, delay 5 minutes on no new posts
                setTimeout(cb, got_results ? 250 : 5 * 60 * 1000);
            });
        });
    }

    function likeBinge(callback) {
        async.forever(function (cb) {
            if (likesList.length === 0) {
                setTimeout(cb, 100);
                return;
            }
            var like = likesList.shift();
            console.log('Liking Post ' + like.post_number + '(#' + like.post_id + ') By `' + like.username + '`');
            m_browser.post_message('post_actions', like.form, function (err, resp) {
                // Ignore error 403, that means duplicate like or post deleted
                if ((err && resp.statusCode !== 403) || resp.statusCode < 300) {
                    setTimeout(cb, 100);
                } else {
                    console.log('Send Error ' + resp.statusCode);
                    likesList.unshift(like);
                    cb(true);
                }
            });

        }, function () {
            callback();
        });
    }

    function scheduleBinges() {
        async.forever(function (cb) {
            var now = new Date(),
                utc = new Date(),
                hours,
                minutes;
            utc.setUTCHours(m_config.likeBingeHour || 23);
            utc.setUTCMinutes(m_config.likeBingeMinute || 40);
            utc.setUTCSeconds(0);
            utc.setMilliseconds(0);
            now = now.getTime();
            utc = utc.getTime();
            if (now > utc) {
                utc += 24 * 60 * 60 * 1000; // add a day if scheduling after 23:40 UTC
            }
            minutes = Math.ceil(((utc - now) / 1000) / 60);
            hours = Math.floor(minutes / 60);
            minutes = minutes % 60;
            console.log('Like Binge scheduled for ' + hours + 'h' + minutes + 'm from now');
            setTimeout(function () {
                likeBinge(cb);
            }, utc - now);
        });
    }


    /**
     * Handle a message from message_bus
     * @param {SockBot.Message} message Message from message_bus
     * @param {SockBot.Post} post Post details associated with message
     * @param {AsyncCallback} callback
     */
    exports.onMessage = function onMessage(message, post, callback) {
        if (message || post) { // jslint unused params
            callback();
        } else {
            callback();
        }
    };

    /**
     * Handle a message from message_bus
     * @param {SockBot.Message} message Message from message_bus
     * @param {SockBot.Post} post Post details associated with message
     * @param {AsyncCallback} callback
     */
    exports.onMessage = function onMessage(message, post, callback) {
        if (message.data && message.data.type === 'created') {
            var likeForm = {
                'id': message.data.id,
                'post_action_type_id': 2,
                'flag_topic': false
            };
            m_browser.post_message('post_actions', likeForm, function (err, resp) {
                // Ignore error 403, that means duplicate like or post deleted
                setTimeout(callback, ((err && resp.statusCode !== 403) || resp.statusCode < 300) ? 15 * 1000 : 0.5 * 1000);
            });
        }
    };


    /**
     * Called Periodically to get channels that sock_modules wish to listen in on.
     * @param {RegistrationCallback} callback
     */
    exports.registerListeners = function registerListeners(callback) {
        if (configuration.enabled && configuration.follow) {
            callback(['/topic/' + configuration.topic]);
        } else {
            callback();
        }
    };

    exports.begin = function begin(browser, config) {
        configuration = config.modules[exports.name];
        m_browser = browser;
        m_config = config;

        if (configuration.enabled && configuration.binge) {
            fillList(config.likeBingeTopic);
            scheduleBinges();
        }
    };
}());