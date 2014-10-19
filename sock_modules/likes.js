/*jslint node: true, indent: 4 */
(function () {
    'use strict';
    var async = require('async'),
        discourse,
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

    function fillList(thread_id, callback) {
        var start_post = 1,
            should_continue = true;
        async.whilst(function () {
            return should_continue;
        }, function (cb) {
            if (likesList.length >= 1000) {
                // if likeslist is longer than limit wait an hour and check again
                return setTimeout(cb, 60 * 60 * 1000);
            }
            discourse.getPosts(thread_id, start_post, 100, function (posts) {
                if (!posts) {
                    // If no new posts then it's time to stop adding posts to the list
                    should_continue = false;
                    return setImmediate(cb);
                }
                var likeables = posts.filter(function (x) {
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
                        'post_number': x.post_number,
                        'post_id': x.id,
                        'username': x.username
                    };
                    likesList.push(data);
                });
                start_post = posts[posts.length - 1].post_number + 1;
                console.log('Processed ' + start_post + ' posts, found ' + likeables.length + ' new posts for a total of ' + likeables.length + ' likeable posts');
                setTimeout(cb, 10 * 1000);
            });
        }, function () {
            callback();
        });
    }

    function likeBinge(callback) {
        async.forever(function (cb) {
            if (likesList.length === 0) {
                cb(true);
                return;
            }
            var like = likesList.shift();
            console.log('Liking Post ' + like.post_number + '(#' + like.post_id + ') By `' + like.username + '`');
            discourse.likePosts(like.post_id, function (err, resp) {
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
            utc.setUTCHours(configuration.bingeHour || 23);
            utc.setUTCMinutes(configuration.bingeMinute || 40);
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

        if (message.data && message.data.type === 'created') {
            if (post) {
                console.log('Liking Post /t/' + post.topic_id + '/' + post.post_number + ' by @' + post.username);
            } else {
                console.log('Liking Post #' + message.data.id);
            }
            discourse.likePosts(message.data.id, callback);
        } else {
            callback();
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
        discourse = browser;
        if (configuration.enabled && configuration.binge) {
            async.forever(function (next) {
                fillList(configuration.topic, function () {
                    setTimeout(next, 48 * 60 * 1000);
                });
            });
            scheduleBinges();
        }
    };
}());