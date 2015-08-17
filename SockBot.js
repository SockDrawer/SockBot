#!/usr/bin/env node --harmony

'use strict';
/**
 * Main Module for SockBot2.0
 * @module SockBot
 * @author Accalia
 * @license MIT
 */

const async = require('async');
const EventEmitter = require('events').EventEmitter;
const config = require('./lib/config'),
    messages = require('./lib/messages'),
    notifications = require('./lib/notifications'),
    commands = require('./lib/commands'),
    utils = require('./lib/utils'),
    packageInfo = require('./package.json');
const browser = require('./lib/browser')();
const internals = {
        plugins: [],
        running: false
    },
    privateFns = {
        doPluginRequire: doPluginRequire,
        loadConfig: loadConfig,
        loadPlugins: loadPlugins,
        prepareEvents: prepareEvents
    };

exports.version = packageInfo.version;
exports.releaseName = packageInfo.releaseName;

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
        privateFns.loadConfig(configuration, next);
    }, (_, next) => {
        privateFns.prepareEvents(next);
    }, (events, pluginBrowser, next) => {
        try {
            privateFns.loadPlugins();
        } catch (e) {
            callback(e);
        }
        internals.plugins.forEach((plugin) => {
            plugin.prepare(config.plugins[plugin.prepare.pluginName], config, events, pluginBrowser);
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
    utils.log('Starting SockBot ' + packageInfo.version + ' ' + packageInfo.releaseName);
    browser.start();
    browser.login((err, user) => {
        if (err) {
            utils.warn('Login Failed: ' + err);
            return callback(err);
        }
        config.user = user;
        commands.start();
        internals.plugins.forEach((plugin) => plugin.start());
        utils.log('SockBot `' + config.user.username + '` Started');
        internals.running = true;
        if (config.core.pollMessages) {
            messages.start();
            async.whilst(() => internals.running, (next) => {
                messages.pollMessages(() => setTimeout(next, 3 * 1000));
            });
        }
        if (config.core.pollNotifications) {
            notifications.start();
            async.whilst(() => internals.running, (next) => {
                notifications.pollNotifications(() => setTimeout(next, 5 * 60 * 1000));
            });
        }
        callback(null);
    });
};

/**
 * Stop the event loop and signal plugins to stop
 *
 * @param {function} callback Completion callback
 */
exports.stop = function (callback) {
    utils.log('Stopping SockBot ' + packageInfo.version + ' ' + packageInfo.releaseName);
    internals.running = false;
    internals.plugins.forEach((plugin) => plugin.stop());
    browser.stop();
    if (callback) {
        callback();
    }
};


/**
 * Load module as plugin
 *
 * @param {string} module Module to require
 * @param {function} requireIt nodejs core require function (for unti testing purposes is parameter)
 * @returns {object} requested module
 */
function doPluginRequire(module, requireIt) {
    try {
        // Look in plugins first
        return requireIt('./plugins/' + module);
    } catch (e) {
        // Error! check if it's ENOENT and try raw module
        if (/^Cannot find module/.test(e.message)) {
            return requireIt(module);
        }
        // Rethrow error if it wasn't ENOENT
        throw e;
    }
}

/**
 * Log a message to console
 *
 * @param {*} message Message to log
 */
exports.logMessage = function logMessage(message) {
    utils.log(message);
};

/**
 * Log a warning to console
 *
 * @param {*} warning Message to log
 */
exports.logWarning = function logWarning(warning) {
    utils.warn(warning);
};

/**
 * Log an error to console
 *
 * @param {*} error Message to log
 */
exports.logError = function logError(error) {
    utils.error(error);
};

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
            events.on('logMessage', exports.logMessage);
            events.on('logWarning', exports.logWarning);
            events.on('logError', exports.logError);
            next();
        }, (next) => {
            messages.prepare(events, clientid, next);
        }, (next) => {
            notifications.prepare(events, next);
        }, (next) => {
            commands.prepare(events, next);
        }, (next) => {
            browser.prepare(events, next);
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
        const plugin = privateFns.doPluginRequire(module, require);
        if (typeof plugin.prepare !== 'function') {
            utils.error('Plugin `' + module + '` does not export `prepare()` function');
        } else if (typeof plugin.start !== 'function') {
            utils.error('Plugin `' + module + '` does not export `start()` function');
        } else if (typeof plugin.stop !== 'function') {
            utils.error('Plugin `' + module + '` does not export `stop()` function');
        } else {
            utils.log('Plugin `' + module + '` Loaded');
            plugin.prepare.pluginName = module;
            internals.plugins.push(plugin);
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
        callback(null, null);
    } else {
        config.loadConfiguration(cfg, callback);
    }
}

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.internals = internals;
    exports.privateFns = privateFns;
}
