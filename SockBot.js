/*jslint node: true, indent: 4 */
(function () {
    'use strict';
    var fs = require('fs'),
        async = require('async'),
        browser = require('./browser'),
        queue = require('./queue'),
        config = require('./configuration').configuration,
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
                sock_modules.push(module);
                console.log('Loaded module: ' + module.name);
            });
            cb();
        },
        function () {
            browser.authenticate(config.username, config.password, function () {
                config.user = browser.user;
                sock_modules.forEach(function (module) {
                    if (typeof module.begin !== 'function') {
                        return;
                    }
                    console.log('Starting module: ' + module.name);
                    module.begin(browser, config);
                });
                queue.begin(sock_modules);

            });
        }
    ]);
}());