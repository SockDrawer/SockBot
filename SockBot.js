'use strict';
/**
 * Main Module for SockBot2.0
 * @module SockBot
 * @author Accalia
 * @license MIT
 */

/*eslint-disable no-console */
exports.version = 'v2.0.0';

const async = require('async');
const EventEmitter = require('events').EventEmitter;
const config = require('./config'),
    messages = require('./messages'),
    notifications = require('./notifications'),
    commands = require('./commands'),
    utils = require('./utils');
const browser = require('./browser')();
const plugins = [];
let running = false;

exports.prepare = function prepare(configuration, callback) {
    async.waterfall([(next) => {
        loadConfig(configuration, next);
    }, (next) => {
        prepareEvents(next);
    }, (events, pluginBrowser, next) => {
        loadPlugins();
        plugins.forEach((plugin) => {
            plugin.prepare(config.plugin[plugin.prepare.pluginName], config, events, pluginBrowser);
        });
        next(null, events, pluginBrowser);
    }], callback);
};

exports.start = function (callback) {
    browser.login((err, user) => {
        if (err) {
            utils.warn('Login Failed: ' + err);
            return callback(err);
        }
        config.user = user;
        plugins.forEach((plugin) => plugin.start());
        utils.log('SockBot `' + config.user.username + '` Started');
        running = true;
        async.whilst(() => running, (next) => {
            messages.pollMessages(() => setTimeout(next, 3 * 1000));
        });
        async.whilst(() => running, (next) => {
            notifications.pollNotifications(() => setTimeout(next), 5 * 60 * 1000);
        });
    });

};

exports.stop = function () {
    running = false;
    plugins.forEach((plugin) => plugin.stop());
};


function doPluginRequire(module) {
    if (/\//.test(module)) {
        return require(module);
    }
    try {
        return require('./plugins/' + module);
    } catch (e) {
        if (/^Cannot find module/.test(e.message)) {
            return require(module);
        }
        throw e;
    }
}

function prepareEvents(callback) {
    const events = new EventEmitter(),
        pluginBrowser = browser.setPlugins(),
        clientid = utils.uuid();
    async.series([
        (next) => {
            messages.prepare(events, clientid, next);
        }, (next) => {
            notifications.prepare(events, next);
        }, (next) => {
            commands.prepareCommands(events, next);
        }
    ], (err) => {
        if (err) {
            return callback(err);
        }
        callback(null, events, pluginBrowser);
    });
}

function loadPlugins() {
    Object.keys(config.plugins).forEach((module) => {
        const plugin = doPluginRequire(module);
        if (typeof plugin.prepare !== 'function') {
            console.error('Plugin `' + module + '` does not export `prepare()` function');
        } else if (typeof plugin.start !== 'function') {
            console.error('Plugin `' + module + '` does not export `start()` function');
        } else if (typeof plugin.stop !== 'function') {
            console.error('Plugin `' + module + '` does not export `start()` function');
        } else {
            plugin.prepare.pluginName = module;
            plugins.push(plugin);
        }
    });
}

function loadConfig(cfg, callback) {
    if (typeof cfg === 'object' && typeof cfg.core === 'object' && typeof cfg.plugins === 'object') {
        config.core = cfg.core;
        config.plugins = cfg.plugins;
        callback(null);
    } else {
        config.loadConfiguration(cfg, callback);
    }
}

/* istanbul ignore if */
if (require.main === module) {
    exports.start(process.argv[2]);
}
