/*jslint node: true, indent: 4 */
(function () {
    'use strict';
    var async = require('async'),
        discourse,
        configuration;

    /**
     * @callback AsyncCallback
     * @param {boolean} [stop] Set to True to stop processing notification or message. No lower priority sock_modules will be called for the message if set to `true`
     */

    /**
     * @callback RegistrationCallback
     * @param {string[]} channels Message_bus channels this modules wishes to listen to
     */

    /**
     * @var {string} description Brief description of this module for Help Docs
     */
    exports.description = 'Read All The Things!';

    /**
     * @var {object} configuration Default Configuration settings for this sock_module
     */
    exports.configuration = {
        enabled: false,
        readTime: 4242,
        readWait: 3 * 24 * 60 * 60 * 1000
    };

    /**
     * @var {string} name The name of this sock_module
     */
    exports.name = "Readify";

    /**
     * @var {number} priority If defined by a sock_module it is the priority of the module with respect to other modules.
     *
     * sock_modules **should not** define modules with negative permissions. Default value is 50 with lower numbers being higher priority.
     */
    exports.priority = undefined;

    /**
     * @var {string} version The version of this sock_module
     */
    exports.version = "1.0.0";

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
                process.nextTick(next);
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
                        console.warn('error getting topics:' + err);
                        return setTimeout(callback, 5 * 60 * 1000);
                    }
                    url = topics.topic_list.more_topics_url;
                    async.eachSeries(topics.topic_list.topics, function (topic, innerNext) {
                        console.log('Reading `' + topic.slug + '`');
                        readTopic(topic.id, function () {
                            setTimeout(innerNext, 60 * 1000);
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