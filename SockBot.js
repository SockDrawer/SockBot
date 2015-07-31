#!/usr/bin/env node --harmony
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

/**
 * Prepared Callback
 *
 * @callback
 * @name preparedCallback
 * @param {string|Error} err Any Error encountered
 * @param {external.events.SockEvents} events SockBot's internal event emitter with added helper functions
 * @param {browser} pluginBrowser discourse communication class, will be logged into discourse once bot starts
 */

/**
 * Completion Callback
 *
 * @callback
 * @name completedCallback
 * @param {string|Error} err Any Error encountered
 */

/**
 * Prepare the bot for running
 *
 * @param {object|string} configuration Configuration to use. If string interpret as file path to read from
 * @param {preparedCallback} callback Completion callback
 */
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

/**
 * Start the bot
 *
 * @param {completedCallback} callback Completion Callback
 */
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
        callback(null);
    });
};

/**
 * Stop the event loop and signal plugins to stop
 */
exports.stop = function () {
    running = false;
    plugins.forEach((plugin) => plugin.stop());
};


/**
 * Load module as plugin
 *
 * @param {string} module Module to require
 * @returns {object} requested module
 */
function doPluginRequire(module) {
    try {
        // Look in plugins first
        return require('./plugins/' + module);
    } catch (e) {
        // Error! check if it's ENOENT and try raw module
        if (/^Cannot find module/.test(e.message)) {
            return require(module);
        }
        // Rethrow error if it wasn't ENOENT
        throw e;
    }
}

/**
 * Prepare core EventEmitter as a SockEvents object
 *
 * @param {preparedCallback} callback Completion callback
 */
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

/**
 * Load plugins based on current configuration.
 */
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

/**
 * Load configuration
 *
 * @param {string|object} cfg Configuration to use, if string load as filepath to configuration
 * @param {completedCallback} callback CompletionCallback
 */
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
