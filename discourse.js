/*jslint node: true, indent: 4, unparam: true, regexp: true  */
/**
 * @module browser
 * @class brower
 * @author Accalia
 * @license MIT
 * @overview Used for communicating to discourse and the web.
 */
(function () {
    'use strict';
    var version = 'SockBot 0.13.0 "Devious Daine"',
        request = require('request'),
        async = require('async'),
        xRegExp = require('xregexp').XRegExp,
        conf = require('./configuration').configuration,
        csrf,
        jar = request.jar(),
        browser = request.defaults({
            jar: jar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': version + ' @' + conf.username
            }
        }),
        tag = '\n\n<!-- Posted by ' + version + ' on %DATE%-->',
        r_quote = xRegExp('\\[quote(?:(?!\\[/quote\\]).)*\\[/quote\\]', 'sgi'),
        r_close_quote = xRegExp('\\[/quote\\]', 'sgi'),
        discofailures = 0;

    function log(message) {
        if (conf.datestamp) {
            message = new Date().toUTCString().replace('T', ' ').replace(/\..+$/, '') + message;
        } else if (conf.timestamp) {
            message = new Date().toUTCString().replace(/^.+T/, '').replace(/\..+$/, '') + message;
        }
        console.log(message);
    }
    exports.log = log;

    function warn(message) {
        if (conf.datestamp) {
            message = new Date().toUTCString().replace('T', ' ').replace(/\..+$/, '') + message;
        } else if (conf.timestamp) {
            message = new Date().toUTCString().replace(/^.+T/, '').replace(/\..+$/, '') + message;
        }
        console.warn(message);
    }
    exports.warn = warn;

    function error(message) {
        if (conf.datestamp) {
            message = new Date().toUTCString().replace('T', ' ').replace(/\..+$/, '') + message;
        } else if (conf.timestamp) {
            message = new Date().toUTCString().replace(/^.+T/, '').replace(/\..+$/, '') + message;
        }
        console.error(message);
    }
    exports.error = error;
    /**
     * @callback BrowserCallback
     * @param {object} err error object if `request` indicated error
     *  @param {object} resp response object, contains the response object from `request`
     *  @param {onject} body body of response. If body was valid JSON this has been deserialized
     */

    /**
     * @param {BrowserCallback} callback Function to continue execution with after validation
     */
    function discotime(callback) {
        return function (err, resp, body) {
            var until,
                now;
            if (resp && resp.request.href.indexOf('what.thedailywtf.com') < 0) {
                return callback(err, resp, body);
            }
            if (resp && (resp.statusCode === 429 || resp.statusCode === 503)) {
                discofailures += 1;
                until = (new Date()).getTime() + discofailures * 60 * 1000;
                warn(resp.statusCode + ': Too many requests. Muting for ' + (discofailures * 60) + ' seconds.');
                //Doing a busy wait on purpose. Using SetTimeout would allow other threads to process while the wait is
                //happening. we got the 429 for a reason. don't mess it up
                do {
                    now = (new Date()).getTime();
                } while (now < until);
            } else if (err && !resp) {
                error('Severe error:' + err);
                process.exit(1);
            } else {
                discofailures = 0;
            }
            until = (new Date()).getTime() + 250;
            //Doing a busy wait on purpose. Using SetTimeout would allow other threads to process while the wait is
            //happening. we don't want to get a 429 for any reason. don't mess it up
            do {
                now = (new Date()).getTime();
            } while (now < until);
            setImmediate(function () {
                var obj;
                try {
                    obj = JSON.parse(body);
                } catch (e) {
                    obj = body;
                }
                callback(err, resp, obj);
            });
        };
    }


    /**
     * Issue a GET request to the defined url and call the provided callback with the results.
     *
     * If `url` does not begin with http(s):// the URL of the configured discourse instance is used.
     *
     * @param {string} url Url to get content from
     * @param {BrowserCallback} callback
     */
    function getContent(url, callback) {
        if (!/^https?:\/\//i.test(url)) {
            url = 'http://what.thedailywtf.com/' + url;
        }
        browser.get(url, discotime(callback));
    }
    exports.getContent = getContent;


    function getCSRF(callback) {
        if (csrf) {
            callback(null, csrf);
        } else {
            getContent('session/csrf.json', function (err, resp, obj) {
                csrf = obj.csrf;
                callback(null, csrf);
            });
        }
    }

    function postContent(url, form, callback) {
        if (!/^https?:\/\//i.test(url)) {
            url = 'http://what.thedailywtf.com/' + url;
        }
        async.waterfall([
            getCSRF,
            function (csrf, next) {
                browser.post(url, {
                    headers: {
                        'X-CSRF-Token': csrf
                    },
                    form: form
                }, discotime(next));
            }
        ], callback);
    }
    exports.postContent = postContent;

    function begin(callback) {
        postContent('session', {
            login: conf.username,
            password: conf.password
        }, function (a, b, c) {
            if (!a) {
                conf.user = c.user;
            } else {
                log(a);
            }
            callback(a, b, c);
        });
    }
    exports.begin = begin;

    function postTopic(category, title, content, callback) {
        var form = {
            raw: content + tag.replace('%DATE%', new Date()),
            is_warning: false,
            category: category,
            archetype: 'regular',
            title: title,
            auto_close_time: ''
        };
        postContent('posts', form, callback);
    }
    exports.postTopic = postTopic;

    function postReply(topic, reply_to, content, callback) {
        var form = {
            raw: content + tag.replace('%DATE%', new Date()),
            topic_id: topic,
            is_warning: false,
            reply_to_post_number: reply_to,
            category: '',
            archetype: 'regular',
            auto_close_time: ''
        };
        postContent('posts', form, callback);
    }
    exports.postReply = postReply;

    function getPost(post_id, callback) {
        getContent('posts/' + post_id + '.json', function (err, resp, post) {
            if (err || resp.statusCode >= 300) {
                post = undefined;
            } else {
                post.cleaned = xRegExp.replace(xRegExp.replace(post.raw, r_quote, ''), r_close_quote, '');
            }
            callback(post);
        });
    }
    exports.getPost = getPost;

    function getPosts(topic_id, start_post, number, callback) {
        var base = 't/' + topic_id + '/posts.json';
        getContent(base + '?post_ids=0', function (err, resp, topic) {
            var posts = topic.post_stream.stream,
                part = [],
                i;
            for (i = start_post - 1; i < start_post + number && posts[i]; i += 1) {
                part.push(posts[i]);
            }
            getContent(base + '?post_ids[]=' + part.join('&post_ids[]='), function (err, resp, posts) {
                callback(posts.post_stream.posts);
            });
        });
    }
    exports.getPosts = getPosts;

    function getAllPosts(topic_id, each_chunk, complete) {
        var base = 't/' + topic_id + '/posts.json';
        getContent(base + '?post_ids=0', function (err, resp, topic) {
            var posts = topic.post_stream.stream;
            async.whilst(
                function () {
                    return posts.length > 0;
                },
                function (next) {
                    var part = [];
                    while (part.length < 200 && posts.length > 0) {
                        part.push(posts.shift());
                    }
                    getContent(base + '?post_ids[]=' + part.join('&post_ids[]='), function (err, resp, posts) {
                        each_chunk(posts.post_stream.posts, function () {
                            setTimeout(next, 500);
                        });
                    });
                },
                complete
            );
        });
    }
    exports.getAllPosts = getAllPosts;

    function readPosts(topic_id, posts, callback) {
        if (typeof posts === 'number') {
            posts = [posts];
        }
        if (!Array.isArray(posts)) {
            return callback(true);
        }
        var form = {
            'topic_id': topic_id,
            'topic_time': 4242 * Math.ceil(posts.length / 3)
        };
        posts.forEach(function (post) {
            form['timings[' + post + ']'] = 4242;
        });
        postContent('topics/timings', form, callback);
    }
    exports.readPosts = readPosts;


    function likePosts(post_ids, callback) {
        if (typeof post_ids === 'number') {
            post_ids = [post_ids];
        }
        if (!Array.isArray(post_ids)) {
            return callback(true);
        }
        var results = [];
        async.eachSeries(post_ids, function (post_id, next) {
            var likeForm = {
                'id': post_id,
                'post_action_type_id': 2,
                'flag_topic': false
            };
            postContent('post_actions', likeForm, function (err) {
                results = Array.prototype.slice.call(arguments);
                // Ignore all errors, just move on if error
                setTimeout(function () {
                    next.apply(err);
                }, 0.5 * 1000);
            });
        }, function () {
            callback.apply(null, results);
        });
    }
    exports.likePosts = likePosts;

    //Backwards compatibility with browser.js

    /**
     * @deprecated Will be removed in 0.15.0
     * @see getContent
     */
    exports.get_content = getContent;
    /**
     * @deprecated Will be removed in 0.15.0
     * @see postContent
     */
    exports.post_message = postContent;

    /**
     * @deprecated Will be removed in 0.15.0
     * @see postContent
     */
    exports.postMessage = postContent;
    /**
     * @deprecated Will be removed in 0.15.0
     * @see postTopic
     */
    exports.post_topic = postTopic;
    /**
     * @deprecated Will be removed in 0.15.0
     * @see postReply
     */
    exports.reply_topic = postReply;

    /**
     * @deprecated Will be removed in 0.15.0
     * @see getPost
     */
    exports.get_post = getPost;

    /**
     * @deprecated Will be removed in 0.15.0
     * @see readPosts
     */
    exports.read_posts = readPosts;
}());