#!/usr/bin/env node

'use strict';

const path = require('path');
const packageInfo = require('../package.json'),
    config = require('./config'),
    utils = require('./utils'),
    commands = require('./commands');

const debug = require('debug')('sockbot');

exports._buildMessage = function _buildMessage(message) {
    const parts = Array.prototype.slice.call(arguments);
    parts.unshift(`[${new Date().toISOString()}]`);
    return parts
        .map((part) => typeof part === 'string' ? part : JSON.stringify(part, null, '\t'))
        .join(' ');
};

exports.log = function log(message) {
    console.log(exports._buildMessage.apply(null, arguments)); // eslint-disable-line no-console
};

exports.error = function error(message) {
    console.error(exports._buildMessage.apply(null, arguments)); // eslint-disable-line no-console
};

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

exports.loadPlugins = function loadPlugins(forumInstance, botConfig) {
    Object.keys(botConfig.plugins).map((name) => {
        exports.log(`Loading plugin ${name} for ${botConfig.core.username}`);
        const plugin = exports.relativeRequire('plugins', name, require);
        const pluginConfig = botConfig.plugins[name];
        forumInstance.addPlugin(plugin, pluginConfig);
    });
};

exports.activateConfig = function activateConfig(botConfig) {
    const Provider = exports.relativeRequire('providers', botConfig.core.provider, require);
    exports.log(`Using provider ${botConfig.core.provider} for ${botConfig.core.username}`);
    const instance = new Provider(botConfig);
    instance.on('log', exports.log);
    instance.on('error', exports.error);
    instance.on('logExtended', utils.logExtended);
    instance.Commands = commands.bindCommands(instance);
    exports.loadPlugins(instance, botConfig);
    exports.log(`${botConfig.core.username} ready for login`);
    return instance.login()
        .then(() => {
            exports.log(`${botConfig.core.username} login successful`);
            return instance.activate();
        })
        .then(() => exports.log(`${botConfig.core.username} activated`));
};

/* istanbul ignore if */
if (require.main === module) {
    const yargs = require('yargs');
    const argv = yargs
        .usage('Usage: $0 <cfgFile> [options]')
        .demand(1, 1, 'A valid configuration file must be provided')
        .describe({
            checkCfg: 'Check the validity of the configuration file without starting the bot'
        })
        .argv;
    exports.log(`Starting Sockbot ${packageInfo.version} - ${packageInfo.releaseName}`);
    config.load(argv._[0])
        .then((cfg) => {
            exports.log(`Loaded configuration file: ${argv._[0]}`);
            return cfg;
        })
        .then((cfg) => {
            const promises = cfg.map((botConfig) => {
                exports.log(`Activating logon: ${botConfig.core.username}`);
                return exports.activateConfig(botConfig)
                    .catch((err) => exports.error(err, err.stack));
            });
            return Promise.all(promises);
        })
        .catch((err) => exports.error('Fatal Startup Error:\n', err.message || err));
}
