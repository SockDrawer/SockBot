/*jslint node: true, indent: 4 */
(function () {
    'use strict';
    var async = require('async'),
        m_browser,
        configuration,
        laterReads = [];

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

    function readTopicPage(topic, callback) {
        var cutoff = (new Date().getTime()) - configuration.readWait,
            form = {
                'topic_id': topic.id,
                'topic_time': Math.floor(configuration.readTime * topic.unread.length / 3) // msecs passed on topic (We're pretty sure)
            };
        topic.unread.filter(function (p) {
            return p.posted < cutoff;
        }).map(function (p) {
            form['timings[' + p.id + ']'] = configuration.readTime; // msecs passed on post (same)
        });
        topic.unread.filter(function (p) {
            return p.posted >= cutoff;
        }).map(function (p) {
            p.topic_id = topic.id;
            laterReads.push(p);
        });

        m_browser.post_message('topics/timings', form, function () {
            setTimeout(callback, 100); // Rate limit requests so as to not overload the server.
        });
    }

    function getTopicsPage(url, callback) {
        var result;
        async.whilst(
            function () {
                return typeof result !== 'object';
            },
            function (next) {
                m_browser.get_content(url, function (err, resp, obj) {
                    if (err || resp.statusCode >= 400 || typeof obj !== 'object') {
                        setTimeout(next, 15 * 1000);
                        return;
                    }
                    result = obj;
                    setTimeout(next, 5 * 1000);
                });
            },
            function () {
                if (typeof result.topic_list !== 'object') {
                    callback(null);
                    return;
                }
                callback({
                    next: result.topic_list.more_topics_url,
                    topics: result.topic_list.topics.map(function (o) {
                        return {
                            id: o.id,
                            slug: o.slug
                        };
                    })
                });
            }
        );
    }

    function getTopicPage(topic, post, callback) {
        var result;
        async.whilst(
            function () {
                return result === undefined;
            },
            function (next) {
                m_browser.get_content('/t/' + topic + '/' + post + '.json', function (err, resp, obj) {
                    if (err || resp.statusCode >= 400 || typeof obj !== 'object') {
                        setTimeout(next, 15 * 1000);
                        return;
                    }
                    result = obj;
                    setTimeout(next, 5 * 1000);
                });
            },
            function () {
                var posts = result.post_stream.posts;
                callback({
                    start: result.last_read_post_number,
                    last: posts[posts.length - 1].post_number,
                    posts: result.highest_post_number,
                    id: result.id,
                    slug: result.slug,
                    unread: posts.filter(function (p) {
                        return !p.read;
                    }).map(function (p) {
                        return {
                            id: p.post_number,
                            posted: Date.parse(p.created_at)
                        };
                    })
                });
            }
        );
    }

    function readAllTheWaitingThings() {
        async.forever(function (next) {
            var cutoff = (new Date().getTime()) - configuration.readWait,
                readIt = laterReads.filter(function (p) {
                    return p.posted < cutoff;
                });
            laterReads = laterReads.filter(function (p) {
                return p.posted >= cutoff;
            });

            async.eachSeries(readIt,
                function (p, cb) {
                    var form = {
                        'topic_id': p.topic_id,
                        'topic_time': configuration.readTime // msecs passed on topic (We're pretty sure)
                    };
                    form['timings[' + p.id + ']'] = configuration.readTime; // msecs passed on post (same)

                    m_browser.post_message('topics/timings', form, function () {
                        setTimeout(cb, 5 * 1000); // Rate limit these to better sout the occasion
                    });
                },
                function () {
                    setTimeout(next, 60 * 60 * 1000);
                });
        });
    }

    function readAllTheOldThings() {
        async.forever(function (nextTime) {
            //var next = '/latest.json?ascending=true&order=activity&no_definitions=true';
            var next = '/latest.json';
            async.whilst(
                function () {
                    return !!next;
                },
                function (cb) {
                    getTopicsPage(next, function (topic_list) {
                        next = topic_list.next;
                        async.eachSeries(topic_list.topics,
                            function (topic, seriescb) {
                                console.log('Reading topic ' + topic.id + ' ' + topic.slug);
                                var i = 1,
                                    max = 2;
                                async.whilst(
                                    function () {
                                        return i < max;
                                    },
                                    function (whilstcb) {
                                        getTopicPage(topic.id, i,
                                            function (page) {
                                                i = page.last + 1;
                                                max = page.posts;
                                                readTopicPage(page, whilstcb);
                                            });
                                    },
                                    seriescb
                                );
                            },
                            cb);
                    });
                },
                function () {
                    setTimeout(nextTime, 24 * 60 * 60 * 1000);
                }
            );
        });
    }

    function readAllTheThings() {
        readAllTheOldThings();
        readAllTheWaitingThings();
    }

    exports.begin = function begin(browser, config) {
        m_browser = browser;
        configuration = config.modules[exports.name];

        if (configuration.enabled) {
            readAllTheThings();
        }
    };
}());