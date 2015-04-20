/*jslint node: true, indent: 4 */
/* eslint-disable no-console */
'use strict';

var version = require('./version');
console.log(version.bootString);

var fs = require('fs'),
    async = require('async'),
    config = require('./configuration'),
    admin = require('./admin'),
    commands = require('./commands'),
    database = require('./database');
var browser,
    messageBus,
    sockModules = [];

process.on('exit', function() {
    console.log(version.bootString);
});

async.waterfall([
    admin.load,
    function (cb) {
        fs.readdir('./sock_modules/', cb);
    },
    function (files, cb) {
        files.filter(function (name) {
            return name[0] !== '.' && /[.]js$/.test(name);
        }).forEach(function (name) {
            var module;
            try {
                module = require('./sock_modules/' + name);
            } catch (e) {
                console.log('Error in Module ' + name + ': ' + e.message);
                return;
            }
            if (isNaN(module.priority)) {
                module.priority = 50;
            }
            if (!module.configuration || module.configuration.enabled) {
                console.warn('Ignoring module: `' + (module.name || name) +
                    '` Does not default to disabled');
            } else {
                sockModules.push(module);
                console.log('Loaded module: ' +
                    module.name + ' v' + module.version);
            }
        });
        sockModules.sort(function (a, b) {
            return a.priority - b.priority;
        });
        cb();
    },
    function (cb) {
        config = config.loadConfiguration(sockModules, admin,
            process.argv[2]);
        browser = require('./discourse');
        messageBus = require('./messageBus');
        sockModules = sockModules.filter(function (module) {
            return config.modules[module.name].enabled;
        });
        sockModules.unshift(admin);
        sockModules.unshift(commands);
        commands.loadModules(sockModules);
        admin.setModules(sockModules);
        cb();
    },
    function (cb) {
        var tries = 0;
        var loggerIn = function () {
            tries++;
            browser.login(function () {
                if (config.user && config.user.user
                    || tries >= config.maxLoginAttempts) {
                    if (config.verbose) {
                        console.log('Login attempts: ' + tries);
                    }
                    cb();
                } else {
                    if (config.user) {
                        if (typeof (config.user) === 'object') {
                            config.user = JSON.stringify(config.user);
                        }
                        console.log('Login error: ' + config.user);
                    }
                    var delay = config.extendRetryLoginDelay
                        ? tries * config.retryLoginDelay
                        : config.retryLoginDelay;
                    setTimeout(loggerIn, delay);
                }
            });
        };
        loggerIn();
    },
    function (cb) {
        if (!config.user || !config.user.user) {
            if (config.user) {
                if (typeof (config.user) === 'object') {
                    config.user = JSON.stringify(config.user);
                }
                console.log('Login error: ' + config.user);
            }
            console.log('Terminating bot due to failure to log in');
            /* eslint-disable no-process-exit */
            process.exit(0);
            /* eslint-able no-process-exit */
        }
        console.log('Logged in as: ' + config.user.user.username);
        database.begin(browser, config);
        sockModules.forEach(function (module) {
            if (typeof module.begin !== 'function') {
                return;
            }
            console.log('Starting module: ' + module.name);
            module.begin(browser, config);
        });
        messageBus.begin(sockModules, admin);
        cb();
    }
]);
