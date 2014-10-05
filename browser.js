/*jslint node: true, indent: 4, unparam: true  */
(function () {
    'use strict';
    var async = require('async'),
        request = require('request'),
        jar = request.jar(),
        browser = request.defaults({
            jar: jar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': 'SockAdept 1.0.0'
            }
        }),
        tag = "\n\n<!-- Posted by @SockBot v0.9.99 on %DATE%-->";

    function getContent(url, callback) {
        if (!/^http:\/\//.test(url)) {
            url = 'http://what.thedailywtf.com/' + url;
        }
        browser.get(url, function (a, b, c) {
            try {
                var q = JSON.parse(c);
                callback(a, b, q);
            } catch (e) {
                callback(a, b, c);
            }
        });
    }
    exports.getContent = getContent;

    function postMessage(url, form, callback) {
        browser.get('http://what.thedailywtf.com/session/csrf.json',
            function (a, b, c) {
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
                    try {
                        var q = JSON.parse(c);
                        callback(a, b, q);
                    } catch (e) {
                        callback(a, b, c);
                    }
                });
            });
    }
    exports.postMessage = postMessage;

    function auth(username, password, callback) {
        var user;
        async.waterfall([

            function (cb) {
                postMessage('session', {
                    login: username,
                    password: password
                }, cb);
            },
            function (req, body, cb) {
                user = body;
                // Not needed for authentication but registers the login
                postMessage('login', {
                    username: username,
                    password: password,
                    redirect: 'http://what.thedailywtf.com/'
                }, cb);
            }
        ], function () {
            callback(user);
        });
    }
    exports.auth = auth;


    function post_topic(category, title, content, callback) {
        var form = {
            raw: content + tag.replace('%DATE%', new Date()),
            is_warning: false,
            category: category,
            archetype: 'regular',
            title: title,
            auto_close_time: ''
        };
        postMessage('/posts', form, function (a, b, c) {
            callback();
        });
    }
    exports.post_topic = post_topic;

    function reply_topic(topic, reply_to, content, callback) {
        var form = {
            raw: content + tag.replace('%DATE%', new Date()),
            topic_id: topic,
            is_warning: false,
            reply_to_post_number: reply_to,
            category: '',
            archetype: 'regular',
            auto_close_time: ''
        };
        postMessage('/posts', form, function (a, b, c) {
            callback();
        });
    }
    exports.reply_topic = reply_topic;
}());