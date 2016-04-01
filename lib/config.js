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
        provider: 'nodebb',
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
        forum: 'https://what.thedailywtf.com'
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
 * Read and parse configuration file from disc
 *
 * @param {string} filePath Path of file to read
 * @param {configComplete} callback Completion callback
 * @returns {Promise<*>} Resolves tyo YAML parsed configuration file
 */
function readYaml(filePath) {
    return new Promise((resolve, reject) => {
        if (!filePath || typeof filePath !== 'string') {
            throw new Error('Path must be a string');
        }
        fs.readFile(filePath, (err, data) => {
            if (err) {
                return reject(err);
            }
            // Remove UTF-8 BOM if present
            if (data.length >= 3 && data[0] === 0xef &&
                data[1] === 0xbb && data[2] === 0xbf) {
                data = data.slice(3);
            }
            try {
                return resolve(yaml.safeLoad(data));
            } catch (yamlerr) {
                return reject(yamlerr);
            }
        });
    });
}

/**
 * Load configuration from disc
 *
 * @param {string} filePath Configuration file path
 * @returns {Promise<Array>} Resolves to an array of valid configuration entries
 */
exports.load = function load(filePath) {
    return readYaml(filePath)
        .then((data) => {
            if (!data) {
                throw new Error('Invalid Configuration File.');
            }
            if (Array.isArray(data)) {
                return Promise.resolve(data);
            }
            if (typeof data === 'object') {
                return Promise.resolve([data]);
            }
            throw new Error('Invalid Configuration File.');
        })
        .then((data) => data.map((cfg) => {
            exports.basePath = path.posix.resolve(filePath, '..');
            const config = utils.mergeObjects(true, defaultConfig, cfg);
            exports.validateConfig(config);
            return config;
        }));
};

/**
 * Validate a configuration entry
 *
 * @param {object} config Configuration entry to validate
 * @throws {Error} `username`, `password`, or `owner` is not a string of at least length 1
 */
exports.validateConfig = function validateConfig(config) {
    const errors = [];
    const checkIt = (key) => {
        if (typeof config.core[key] !== 'string' || config.core[key].length < 1) {
            errors.push(`A valid ${key} must be specified`);
        }
    };
    checkIt('username');
    checkIt('password');
    checkIt('owner');
    if (errors.length > 0) {
        throw new Error(errors.join('\n'));
    }
};

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


/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    exports.internals = {
        readYaml: readYaml,
        defaultConfig: defaultConfig
    };
}
