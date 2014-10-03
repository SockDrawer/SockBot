/*jslint node: true, indent: 4, unparam: true  */
(function () {
    'use strict';
    var async = require('async'),
        browser = require('./browser'),
        config = require('./configuration').configuration,
        likesList = [],
        scheduleBinges,
        likeBinge,
        fillList,
        getPage;

    function likeThread(thread_id) {
        fillList(thread_id);
        scheduleBinges();
    }
    exports.likeThread = likeThread;

    scheduleBinges = function scheduleBinges() {
        async.forever(function (cb) {
            var now = new Date(),
                utc = new Date(),
                hours,
                minutes;
            utc.setUTCHours(config.likeBingeHour || 23);
            utc.setUTCMinutes(config.likeBingeMinute || 40);
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
    };

    likeBinge = function likeBinge(callback) {
        async.forever(function (cb) {
            if (likesList.length === 0) {
                setTimeout(cb, 100);
                return;
            }
            var like = likesList.shift();
            console.log('Liking Post ' + like.post_number + '(#' + like.post_id + ') By `' + like.username + '`');
            browser.postMessage('post_actions', like.form, function (err, resp, contents) {
                if (resp.statusCode < 300) {
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
    };

    fillList = function fillList(thread_id) {
        var start_post = 0;
        async.forever(function (cb) {
            if (likesList.length >= 1000) {
                // if likeslist is longer than limit wait 5 minutes and check again
                setTimeout(cb, 5 * 60 * 1000);
                return;
            }
            getPage(thread_id, start_post, function (last_post) {
                console.log('Processed ' + last_post + ' posts for likeable posts.');
                var got_results = last_post > start_post;
                start_post = last_post + 1;
                // delay a quarter second on post get, delay 5 minutes on no new posts
                setTimeout(cb, got_results ? 250 : 5 * 60 * 1000);
            });
        });
    };

    getPage = function getPage(thread_id, start_post, callback) {
        browser.getContent('t/' + thread_id + '/' + start_post + '.json', function (err, req, contents) {
            if (req.statusCode >= 300) {
                console.log('Topic ' + thread_id + ' is private or not exist');
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
                });
            likeables.forEach(function (x) {
                var data = {
                    form: {
                        'id': x.id,
                        'post_action_type_id': 2,
                        'flag_topic': false
                    },
                    post_number: x.post_number,
                    post_id: x.id,
                    username: x.username
                };
                likesList.push(data);
            });
            callback(posts[posts.length - 1].post_number);
        });
    };
}());