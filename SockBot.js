/*jslint node: true, indent: 4, unparam: true */

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
        });

    function getContent(browser, url, callback) {
        // Just in case I need to start wrapping things around my gets as well
        browser.get(url, callback);
    }

    function postMessage(browser, url, form, callback) {
        browser.get('http://what.thedailywtf.com/session/csrf.json',
            function (a, b, c) {
                var csrf = '';
                try {
                    csrf = JSON.parse(c).csrf;
                } catch (e) {
                    callback(e);
                }
                browser.post(url, {
                    headers: {
                        'X-CSRF-Token': csrf
                    },
                    form: form
                }, callback);
            });
    }

    function auth(request, username, password, callback) {
        async.waterfall([

            function (cb) {
                postMessage(request, 'http://what.thedailywtf.com/session', {
                    login: username,
                    password: password
                }, cb);
            },
            function (req, body, cb) {
                postMessage(request, 'http://what.thedailywtf.com/login', {
                    username: username,
                    password: password,
                    redirect: 'http://what.thedailywtf.com/'
                }, cb);
            },
            function (req, body, cb) {
                getContent(request,
                    'http://what.thedailywtf.com/users/sockbot/activity.json',
                    function (a, b, c) {
                        console.log(c);
                        cb();
                    });
            }
        ], callback);
    }

    auth(browser, 'sockbot', 'sockbotsockbot', function () {
        console.log('authenticated?!');
    });
}());