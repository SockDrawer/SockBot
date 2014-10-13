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
        tag = "\n\n<!-- Posted by @SockBot v0.9.99 on %DATE%-->";


    /**
     *@callback BrowserCallback
     *  @param {object} err error object if `request` indicated error
     *  @param {object} resp response object, contains the response object from `request`
     *  @param {onject} body body of response. If body was valid JSON this has been deserialized
     */

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
    exports.getContent = function getContent(url, callback) {
        if (!/^https?:\/\//i.test(url)) {
            url = 'http://what.thedailywtf.com/' + url;
        }
        browser.get(url, function (a, b, c) {
            if (b.statusCode === 429) {
                console.log('Too many requests. Muting for 60 seconds.');
            }
            setTimeout(function () {
                try {
                    var q = JSON.parse(c);
                    callback(a, b, q);
                } catch (e) {
                    callback(a, b, c);
                }
            }, b.statusCode !== 429 ? 1 : 60 * 1000);
        });
    };

    /**
     * Post `form` to remote url` and call provided callback with results
     *
     * If `url` does not begin with http(s):// the URL of the configured discourse instance is used.
     *
     * @param {string} url URL to post to
     * @param {object} form Name:Value dictionary to post
     * @param {BrowserCallback} callback
     */
    exports.postMessage = function postMessage(url, form, callback) {
        browser.get('http://what.thedailywtf.com/session/csrf.json',
            function (a, b, c) {
                if (b.statusCode === 429) {
                    console.log('Too many requests. Muting for 60 seconds.');
                }
                setTimeout(function () {
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
                    }, function (a, b, c) {
                        if (b.statusCode === 429) {
                            console.log('Too many requests. Muting for 60 seconds.');
                        }
                        setTimeout(function () {
                            try {
                                var q = JSON.parse(c);
                                callback(a, b, q);
                            } catch (e) {
                                callback(a, b, c);
                            }
                        }, b.statusCode !== 429 ? 1 : 60 * 1000);
                    });
                }, b.statusCode !== 429 ? 1 : 60 * 1000);
            });
    };

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
        exports.postMessage('session', {
            login: username,
            password: password
        }, callback);
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
        exports.postMessage('/posts', form, function (a, b, c) {
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
        exports.postMessage('/posts', form, function (a, b, c) {
            callback();
        });
    };
}());