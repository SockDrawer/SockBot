'use strict';

const utils = require('./utils');

const fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml');

/**
 * Default configuration options
 *
 * @readonly
 * @type {object}
 */
const defaultConfig = {
    /**
     * Core configuration options
     *
     * @type {object}
     */
    core: {
        /**
         * Username the bot will log in as
         *
         * @default
         * @type {string}
         */
        username: '',
        /**
         * Password the bot will log in with
         *
         * @default
         * @type {string}
         */
        password: '',
        /**
         * User the bot will consider owner
         *
         * Owner promotes the user to virtual trust level 9 (above forum admins)
         *
         * @default
         * @type {string}
         */
        owner: '',
        /**
         * Base URL for the discourse instance to log into
         *
         * Is case sensitive
         *
         * @default
         * @type {string}
         */
        forum: 'https://what.thedailywtf.com',
        /**
         * Users to ignore.
         *
         * Ignoring users demotes them internally to virtual trust level 0. Forum staff cannot be ignored.
         *
         * @default
         * @type {string[]}
         */
        ignoreUsers: [
            'blakeyrat', 'PaulaBean'
        ],
        /**
         * Discourse categories to ignore
         *
         * Posts from ignored categories will not trigger bot.
         *
         * @default
         * @type {Number[]}
         */
        ignoreCategories: [8, 23],
        /**
         * Cooldown timer for users that map to virtual trust level 1 or lower
         *
         * @default
         * @type {Number}
         */
        cooldownPeriod: 3.6E6,
        /**
         * Switch to handle `acted` type channel messages.
         *
         * This type of message is often not needed for bot operation and generates a fair bit of traffic.
         * Disabling reduces load on the host forum.
         *
         * @default
         * @type {boolean}
         */
        handleActedMessage: false,
        /**
         * Set whether to poll for messages.
         *
         * If the bot only needs to handle notifications, set this to `false` to reduce load on the host forum.
         *
         * Note: Setting this to `false` will cause notifications to be polled less frequently;
         * leave `true` if you want a more responsive bot
         *
         * @default
         * @type {boolean}
         */
        pollMessages: true,
        /**
         * Set whether to poll for notifications.
         *
         * For bots, this will normally be left `true`.
         * For cyberparts, set this to `false` to stop the bot marking notifications as read.
         *
         * @default
         * @type {boolean}
         */
        pollNotifications: true,
        /**
         * Extended Logging Level.
         *
         * Extended log messages will only be logged if they have a lower level than this value. omit or set to `0` to
         * disable extended logging
         *
         * @default
         * @type {boolean}
         */
        extendedLogLevel: 0,
        /**
         * Extended Logging Destination.
         *
         * Where to write extended log information. Can be `stderr`, or stdout` to write to the respective outputs, or
         * a file path to append logs to, or if you are using input redirection to attach additional open file
         * descriptors a number indicating the file descriptor to write to.
         *
         * @default
         * @type {number|string}
         */
        extendedLog: 'stderr'
    },
    /**
     * Plugin configuration.
     *
     * See `Plugin Configuration` for details
     *
     * @type {object}
     */
    plugins: {},
    /**
     * Base Path of the active config file
     *
     * @type {string}
     */
    basePath: null
};

/**
 * Read and parse configuration file from disc
 *
 * @param {string} filePath Path of file to read
 * @param {configComplete} callback Completion callback
 */
function readFile(filePath, callback) {
    if (!filePath || typeof filePath !== 'string') {
        callback(new Error('Path must be a string'));
        return;
    }
    fs.readFile(filePath, (err, data) => {
        if (err) {
            return callback(err);
        }
        // Remove UTF-8 BOM if present
        if (data.length >= 3 && data[0] === 0xef &&
            data[1] === 0xbb && data[2] === 0xbf) {
            data = data.slice(3);
        }
        try {
            callback(null, yaml.safeLoad(data));
        } catch (e) {
            callback(e);
        }
    });
}

/**
 * Load configuration from disc
 *
 * @param {string} filePath Configuration file path
 * @param {configComplete} callback Completion callback
 */
exports.loadConfiguration = function loadConfiguration(filePath, callback) {
    readFile(filePath, (err, config) => {
        if (err) {
            callback(err);
            return;
        }
        try {
            const cfg = utils.mergeObjects(true, defaultConfig, config);
            exports.core = cfg.core;
            exports.plugins = cfg.plugins;
            exports.basePath = path.posix.resolve(filePath, '..');
            validateConfiguration();
            callback(null, cfg);
        } catch (e) {
            callback(e);
        }
    });
};

function validateConfiguration() {
    const errors = [];
    if (typeof exports.core.username !== 'string' || exports.core.username.length < 1) {
        errors.push('A valid username must be specified');
    }
    if (typeof exports.core.password !== 'string' || exports.core.password.length < 1) {
        errors.push('A valid password must be specified');
    }
    if (typeof exports.core.owner !== 'string' || exports.core.owner.length < 1) {
        errors.push('A valid owner must be specified');
    }
    if (errors.length > 0) {
        throw new Error(errors.join('\n'));
    }
}

/**
 * Configuration Loaded Callback
 *
 * @callback
 * @name configComplete
 * @param {Exception} [err=null] Error encountered processing request
 * @param {Object} config Loaded Configuration
 */


const config = JSON.parse(JSON.stringify(defaultConfig));

/**
 * Current core configuration
 *
 * Set by internals. Do not edit
 *
 * @readonly
 */
exports.core = config.core;

/**
 * Current plugin configuration
 *
 * Set by internals. Do not edit
 *
 * @readonly
 */
exports.plugins = config.plugins;


/**
 * Base Path of the active config file
 *
 * Set by internals. Do not edit
 *
 * @type {string}
 * @readonly
 */
exports.basePath = config.basePath;

/**
 * Merge multiple objects into one object
 *
 * Later objects override earlier objects
 *
 * This is simply a reference to the function of the same name in `utils`,
 * exposed to allow plugins to call it without `require`ing `utils` itself
 *
 * @param {boolean} [mergeArrays] Merge arrays instead of concatenating them
 * @param {...object} mixin Objects to merge
 * @returns {object} object constructed by merging `mixin`s from left to right
 */
exports.mergeObjects = utils.mergeObjects;

/**
 * Current logged in user
 *
 * Set by internals. Do not edit
 *
 * @readonly
 */
exports.user = {};

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    exports.internals = {
        readFile: readFile,
        defaultConfig: defaultConfig
    };
}
