/*jslint node: true, indent: 4 */
(function () {
    'use strict';
    var async = require('async'),
        discourse,
        configuration,
        likesList = [];

    exports.description = 'Issue Likes to all posts in a thread';

    exports.configuration = {
        enabled: false,
        follow: false,
        binge: false,
        bingeHour: 23,
        bingeMinute: 30,
        topic: 1000,
    };

    exports.name = "AutoLikes";

    exports.priority = 0;

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
                start_post = start_post + posts.length;
                console.log('Processed ' + start_post + ' posts, found ' + likeables.length + ' new posts for a total of ' + likesList.length + ' likeable posts');
                setTimeout(cb, 45 * 1000);
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
                if ((err && resp.statusCode !== 403) || (resp && resp.statusCode < 300)) {
                    setTimeout(cb, 250);
                } else {
                    console.log('Send Error ' + (resp ? resp.statusCode : err));
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
            utc.setUTCHours(configuration.bingeHour);
            utc.setUTCMinutes(configuration.bingeMinute);
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