/*jslint node: true, indent: 4, unparam: true  */
/**
 * @module browser
 * @class brower
 * @author Accalia
 * @license MIT
 * @overview Used for communicating to discourse and the web.
 */
(function () {
    'use strict';
    // Request library handles the actual web stuff
    var request = require('request'),
        xRegExp = require('xregexp').XRegExp,
        conf = require('./configuration').configuration,
        // Cookie jar to save cookies in. not persistant across Sockbot instances
        jar = request.jar(),
        // Set header defaults and cookie jar.
        //Discourse requires XHR requests so we fake those here.
        browser = request.defaults({
            jar: jar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': 'SockAdept 1.1.0 @' + conf.username
            }
        }),
        //Append this to all posts made by sockbot. Makes sockbot easier to track and prevents body to simmilar errors
        tag = "\n\n<!-- Posted by @SockBot v0.9.99 on %DATE%-->",
        r_quote = xRegExp('\\[quote(?:(?!\\[/quote\\]).)*\\[/quote\\]', 'sgi'),
        r_close_quote = xRegExp('\\[/quote\\]', 'sgi');



    /**
     * @callback BrowserCallback
     * @param {object} err error object if `request` indicated error
     *  @param {object} resp response object, contains the response object from `request`
     *  @param {onject} body body of response. If body was valid JSON this has been deserialized
     */

    function rateLimit(callback) {
        return function (err, resp, body) {
            if (resp.statusCode === 429 || resp.statusCode === 503) {
                console.log('Too many requests. Muting for 60 seconds.');
                var until = (new Date()).getTime() + 60 * 1000,
                    now;
                //Doing a busy wait on purpose. Using SetTimeout would allow other threads to process while the wait is
                //happening. we got the 429 for a reason. don't mess it up
                do {
                    now = (new Date()).getTime();
                } while (now < until);
            }
            callback(err, resp, body);
        };
    }

    /**
     * Issue a GET request to the defined url and call the provided callback with the results.
     *
     * If `url` does not begin with http(s):// the URL of the configured discourse instance is used.
     *
     * @param {string} url Url to get content from
     * @param {BrowserCallback} callback
     * @returns undefined
     *
     */
    exports.get_content = function get_content(url, callback) {
        if (!/^https?:\/\//i.test(url)) {
            url = 'http://what.thedailywtf.com/' + url;
        }
        browser.get(url, rateLimit(function (a, b, c) {
            try {
                var q = JSON.parse(c);
                callback(a, b, q);
            } catch (e) {
                callback(a, b, c);
            }
        }));
    };

    /**
     * Replaced by get_content.
     * @deprecated
     */
    exports.getContent = exports.get_content;

    /**
     * Post `form` to remote url` and call provided callback with results
     *
     * If `url` does not begin with http(s):// the URL of the configured discourse instance is used.
     *
     * @param {string} url URL to post to
     * @param {object} form Name:Value dictionary to post
     * @param {BrowserCallback} callback
     */
    exports.post_message = function post_message(url, form, callback) {
        browser.get('http://what.thedailywtf.com/session/csrf.json',
            rateLimit(function (a, b, c) {
                var csrf = '';
                try {
                    csrf = JSON.parse(c).csrf;
                } catch (e) {
                    callback(e);
                }
                browser.post('http://what.thedailywtf.com/' + url, {
                    headers: {
                        'X-CSRF-Token': csrf
                    },
                    form: form
                }, rateLimit(function (a, b, c) {
                    try {
                        var q = JSON.parse(c);
                        callback(a, b, q);
                    } catch (e) {
                        callback(a, b, c);
                    }
                }));
            }));
    };
    exports.postMessage = exports.post_message;

    /**
     * @var {Discourse.User} user Details about authenticated user
     */
    exports.user = null;

    /**
     * Authenticate with Discourse, as a side effect populates the {@link user} field
     *
     * @param {string} username Discourse Username
     * @param {string} password Discourse Password
     * @param {BrowserCallback} callback
     */
    exports.authenticate = function authenticate(username, password, callback) {
        exports.post_message('session', {
            login: username,
            password: password
        }, function (a, b, c) {
            if (!a) {
                conf.user = c.user;
            } else {
                console.log(a);
            }
            callback(a, b, c);

        });
    };

    /**
     * Create a new Topic on Discourse
     *
     * @param {number} category Discourse category to post new topic in
     * @param {string} title Title of the new topic
     * @param {string} content Content of the new topic
     * @param {BrowserCallback} callback
     */
    exports.post_topic = function post_topic(category, title, content, callback) {
        var form = {
            raw: content + tag.replace('%DATE%', new Date()),
            is_warning: false,
            category: category,
            archetype: 'regular',
            title: title,
            auto_close_time: ''
        };
        exports.post_message('/posts', form, function (a, b, c) {
            callback();
        });
    };

    /**
     * Reply to an existing topic on Discourse
     *
     * @param {number} topic Topic to reply to
     * @param {number} reply_to Post number to reply to or undefined to reply to topic
     * @param {string} content Content of new Post
     * @param {BrowserCallback} callback
     */
    exports.reply_topic = function reply_topic(topic, reply_to, content, callback) {
        var form = {
            raw: content + tag.replace('%DATE%', new Date()),
            topic_id: topic,
            is_warning: false,
            reply_to_post_number: reply_to,
            category: '',
            archetype: 'regular',
            auto_close_time: ''
        };
        exports.post_message('/posts', form, function (a, b, c) {
            callback();
        });
    };

    exports.get_post = function get_post(post_id, callback) {
        exports.get_content('/posts/' + post_id + '.json', function (err, resp, post) {
            if (err || resp.statusCode >= 300) {
                console.error('Error loading post #' + post_id);
                post = undefined;
            } else {
                post.cleaned = xRegExp.replace(xRegExp.replace(post.raw, r_quote, ''), r_close_quote, '');
            }
            callback(post);
        });
    };

    exports.get_topic_post = function get_topic_post(topic_number, post_number, callback) {
        exports.get_content('http://what.thedailywtf.com/t/' + topic_number + '/posts.json?post_ids=0', function (err, resp, topic) {
            if (err || resp.statusCode >= 300 || !topic || !topic.post_stream || !topic.post_stream.stream || !topic.post_stream.stream[post_number]) {
                console.error('Error loading post #' + topic_number);
                callback();
            } else {
                get_post(topic.post_stream.stream[post_number], callback);
            }
        });
    };
}());