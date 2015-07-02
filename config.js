'use strict';

const utils = require('./utils');

const fs = require('fs'),
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
        owner: 'accalia',
        /**
         * Base URL for the discourse instance to log into
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
        cooldownPeriod: 3.6E7
    },
    /**
     * Plugin configuration.
     *
     * See `Plugin Configuration` for details
     *
     * @type {object}
     */
    plugins: {}
};

/**
 * Read and parse configuration File from disc
 *
 * @param {string} path Path of file to read
 * @param {configComplete} callback Completion callback
 */
function readFile(path, callback) {
    if (!path || typeof path !== 'string') {
        callback(new Error('Path must be a string'));
        return;
    }
    fs.readFile(path, (err, data) => {
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
 * @param {string} path Configuration file path
 * @param {configComplete} callback Completion callback
 */
exports.loadConfiguration = function loadConfiguration(path, callback) {
    readFile(path, (err, config) => {
        if (err) {
            callback(err);
            return;
        }
        try {
            exports.config = utils.mergeObjects(defaultConfig, config);
            callback(null, exports.config);
        } catch (e) {
            callback(e);
        }
    });
};

/**
 * Configuration Loaded Callback
 *
 * @param {Exception} [err=null] Error encountered processing request
 * @param {Object} config Loaded Configuration
 */
function configComplete(err, config) {} //eslint-disable-line handle-callback-err, no-unused-vars

/**
 * Current configuration
 *
 * Set by ineternals. Do not edit
 *
 * @readonly
 */
exports.config = JSON.parse(JSON.stringify(defaultConfig));

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    exports.internals = {
        readFile: readFile,
        defaultConfig: defaultConfig
    };
    exports.stubs = {
        configComplete: configComplete
    };
}
