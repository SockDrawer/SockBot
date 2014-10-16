/*jslint node: true, indent: 4 */
(function () {
    'use strict';
    var fs = require('fs'),
        browser,
        async = require('async'),
        message_bus = require('./message_bus'),
        config = require('./configuration'),
        sock_modules = [];

    async.waterfall([

        function (cb) {
            fs.readdir('./sock_modules/', cb);
        },
        function (files, cb) {
            files.filter(function (name) {
                return name[0] !== '.' && /[.]js$/.test(name);
            }).forEach(function (name) {
                var module = require('./sock_modules/' + name);
                if (isNaN(module.priority)) {
                    module.priority = 50;
                }
                sock_modules.push(module);
                console.log('Loaded module: ' + module.name + ' v' + module.version);
            });
            sock_modules.sort(function (a, b) {
                return a.priority - b.priority;
            });
            cb();
        },
        function (cb) {
            config = config.loadConfiguration(sock_modules);
            browser = require('./browser');
            cb();
        },
        function (cb) {
            browser.authenticate(config.username, config.password, function () {
                cb();
            });
        },
        function (cb) {
            if (!config.user) {
                // login failed. what can we do?
                console.log('Login failed. Waiting 10 minutes to exit');
                setTimeout(cb, 10 * 60 * 1000);
                return;
            }
            console.log('Logged in as: '+ config.user.username);
            sock_modules.forEach(function (module) {
                if (typeof module.begin !== 'function') {
                    return;
                }
                console.log('Starting module: ' + module.name);
                module.begin(browser, config);
            });
            message_bus.begin(browser, config, sock_modules);
            cb();
        }
    ]);
}());