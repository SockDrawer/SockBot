/*jslint node: true, indent: 4 */
(function () {
    'use strict';
    var async = require('async'),
        discourse,
        configuration;

    exports.description = 'Read All The Things!';

    exports.configuration = {
        enabled: false,
        readWait: 3 * 24 * 60 * 60 * 1000
    };

    exports.name = "Readify";

    exports.priority = undefined;

    exports.version = "0.12.0";

    function readTopic(topic_id, callback) {
        discourse.getAllPosts(topic_id, function (posts, next) {
            posts = posts.filter(function (post) {
                return !post.read && Date.parse(post.created_at) > configuration.readWait;
            });
            if (!posts) {
                return next();
            }
            discourse.readPosts(topic_id, posts.map(function (p) {
                return p.post_number;
            }), function () {
                setTimeout(next, 30 * 1000);
            });
        }, callback);
    }

    function getTopics(callback) {
        var url = 'latest.json';
        async.whilst(
            function () {
                return !!url;
            },
            function (next) {
                discourse.getContent(url, function (err, resp, topics) {
                    if (err || resp.statusCode >= 300) {
                        discourse.warn('error getting topics:' + err);
                        return setTimeout(callback, 15 * 60 * 1000);
                    }
                    url = topics.topic_list.more_topics_url;
                    async.eachSeries(topics.topic_list.topics, function (topic, innerNext) {
                        discourse.log('Reading `' + topic.slug + '`');
                        readTopic(topic.id, function () {
                            setTimeout(innerNext, 5 * 60 * 1000);
                        });
                    }, function () {
                        next();
                    });
                });
            },
            function () {
                callback();
            }
        );
    }

    exports.begin = function begin(browser, config) {
        discourse = browser;
        configuration = config.modules[exports.name];

        if (configuration.enabled) {
            async.forever(function (next) {
                getTopics(function () {
                    setTimeout(next, 24 * 60 * 60 * 1000);
                });
            });
        }
    };
}());