#!/usr/bin/env node

'use strict';

const path = require('path');
const packageInfo = require('../package.json'),
    config = require('./config'),
    utils = require('./utils'),
    commands = require('./commands');

const debug = require('debug')('sockbot');

/**
 * Construct a useragent for sockbot to use
 *
 * @param {object} cfg Instance Configuration to construct User Agent for
 * @returns {string} User-Agent to use for a forum instance
 */
exports.getUserAgent = function getUserAgent(cfg) {
    return `${packageInfo.name}/${packageInfo.version} ` +
        `(${process.platform} ${process.arch}) ` +
        `(nodejs v${process.versions.node}) ` +
        `(v8 v${process.versions.v8}) ` +
        `(user:${cfg.core.username} owner:${cfg.core.owner})`;
};

/**
 * Construct a stringified message to log
 *
 * @param {Array<*>} args Item to stringify and log
 * @returns {string} stringified message
 */
exports._buildMessage = function _buildMessage(args) {
    if (!args || args.length < 1) {
        return '';
    }
    if (!Array.isArray(args)) {
        args = Array.prototype.slice.apply(args);
    }
    args.unshift(`[${new Date().toISOString()}]`);
    return args
        .map((part) => typeof part === 'string' ? part : JSON.stringify(part, null, '\t'))
        .join(' ');
};

/**
 * Log a message to stdout
 *
 * @param {...*} message Message to log to stdout
 */
exports.log = function log() {
    console.log(exports._buildMessage(arguments)); // eslint-disable-line no-console
};

/**
 * Log a message to stderr
 *
 * @param {...*} message Message to log to stderr
 */
exports.error = function error() {
    console.error(exports._buildMessage(arguments)); // eslint-disable-line no-console
};

/**
 * Load a module relative to a local path, or relative to loaded config file
 *
 * @param {string} relativePath Local path to use
 * @param {string} module Module to load
 * @param {function} requireIt Function to use to load module
 * @returns {object | function} Loaded module
 */
exports.relativeRequire = function relativeRequire(relativePath, module, requireIt) {
    try {
        let resolved = `${__dirname}/../${relativePath}/${module}`;
        if (module.startsWith('/') || module.startsWith('./') || module.startsWith('../')) {
            resolved = path.posix.resolve(config.basePath, module);
        }
        debug(`requiring ${relativePath} ${module} as ${resolved}`);
        // Look in plugins first
        return requireIt(resolved);
    } catch (err) {
        // Error! check if it's ENOENT and try raw module
        if (/^Cannot find module/.test(err.message)) {
            debug(`retrying requiring ${relativePath} ${module} as raw`);
            return requireIt(module);
        }
        // Rethrow error if it wasn't ENOENT
        throw err;
    }
};

/**
 * Load plugins for forum instance
 *
 * @param {Provider} forumInstance Provider instance to load plugins into
 * @param {object} botConfig Bot configuration to load plugins with
 * @returns {Promise} Resolves when plugins have been loaded
 */
exports.loadPlugins = function loadPlugins(forumInstance, botConfig) {
    return Promise.all(Object.keys(botConfig.plugins).map((name) => {
        exports.log(`Loading plugin ${name} for ${botConfig.core.username}`);
        const plugin = exports.relativeRequire('plugins', name, require);
        const pluginConfig = botConfig.plugins[name];
        return forumInstance.addPlugin(plugin, pluginConfig).catch((err) => {
            exports.error(`Plugin ${name} failed to load with error: ${err}`);
            throw err;
        });
    }));
};

/**
 * Activate a loaded configuration.
 *
 * @param {object} botConfig Configuration to activate
 * @returns {Promise} Resolves when configuration is fully activated
 */
exports.activateConfig = function activateConfig(botConfig) {
    const Provider = exports.relativeRequire('providers', botConfig.core.provider, require);
    exports.log(`Using provider ${botConfig.core.provider} for ${botConfig.core.username}`);
    const ua = exports.getUserAgent(botConfig);
    const instance = new Provider(botConfig, ua);
    instance.on('log', exports.log);
    instance.on('error', exports.error);
    instance.on('logExtended', utils.logExtended);
    instance.Commands = commands.bindCommands(instance);
    return exports.loadPlugins(instance, botConfig)
        .then(() => {
            exports.log(`${botConfig.core.username} ready for login`);
        })
        .then(() => instance.login())
        .then(() => {
            exports.log(`${botConfig.core.username} login successful`);
            return instance.activate();
        })
        .then(() => exports.log(`${botConfig.core.username} activated`));
};

exports.ponyError = function ponyError(prefix, err) {
    err = err || {};
    if (err.stack) {
        debug(err.stack);
    }
    const pony = [
        `A-derp! ${prefix}: ${err.message || err}`
    ];
    exports.error(pony.join('\n'));
};

// This is for the automated tests.... ;-)
exports.require = require;

/* istanbul ignore if */
if (require.main === module) {
    process.on('unhandledRejection', (_, reason) => {
        exports.ponyError('Unhandled Promise Rejection', reason);
    });

    const yargs = require('yargs');
    const argv = yargs
        .usage('Usage: $0 <cfgFile>')
        .demand(1, 1, 'A valid configuration file must be provided')
        .argv;
    exports.log(`Starting Sockbot ${packageInfo.version} - ${packageInfo.releaseName}`);
    config.load(argv._[0])
        .then((cfg) => {
            exports.log(`Loaded configuration file: ${argv._[0]}`);
            process.chdir(config.basePath);
            return cfg;
        })
        .then((cfg) => {
            const promises = cfg.map((botConfig) => {
                exports.log(`Activating logon: ${botConfig.core.username}`);
                return exports.activateConfig(botConfig);
            });
            return Promise.all(promises);
        })
        .catch((err) => {
            exports.ponyError('Fatal Startup Error', err);
        });
}
