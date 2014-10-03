/*jslint node: true, indent: 4, unparam: true  */
(function () {
    'use strict';
    var async = require('async'),
        browser = require('./browser'),
        config = require('./configuration').configuration,
        laterReads = [];



    function readTopicPage(topic, callback) {
        var cutoff = (new Date().getTime()) - config.readifyWait,
            form = {
                'topic_id': topic.id,
                'topic_time': Math.floor(4242 * topic.unread.length / 3) // msecs passed on topic (We're pretty sure)
            };
        topic.unread.filter(function (p) {
            return p.posted < cutoff;
        }).map(function (p) {
            form['timings[' + p.id + ']'] = 4242; // msecs passed on post (same)
        });
        topic.unread.filter(function (p) {
            return p.posted >= cutoff;
        }).map(function (p) {
            p.topic_id = topic.id;
            laterReads.push(p);
        });

        browser.postMessage('topics/timings', form, function () {
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
                browser.getContent(url, function (a, b, c) {
                    if (typeof c !== 'object') {
                        setTimeout(next, 500);
                        return;
                    }
                    result = c;
                    next();
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
                browser.getContent('/t/' + topic + '/' + post + '.json', function (a, b, c) {
                    if (typeof c !== 'object') {
                        setTimeout(next, 500);
                        return;
                    }
                    result = c;
                    next();
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
            var cutoff = (new Date().getTime()) - config.readifyWait,
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
                        'topic_time': 4995 // msecs passed on topic (We're pretty sure)
                    };
                    form['timings[' + p.id + ']'] = 4995; // msecs passed on post (same)

                    browser.postMessage('topics/timings', form, function () {
                        setTimeout(cb, 50); // Rate limit these to better sout the occasion
                    });
                },
                function () {
                    setTimeout(next, 60 * 60 * 1000);
                });
        });
    }

    function readAllTheOldThings() {
        async.forever(function (nextTime) {
            var next = '/latest.json?ascending=true&order=activity&no_definitions=true';
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
    exports.readAllTheThings = readAllTheThings;
}());