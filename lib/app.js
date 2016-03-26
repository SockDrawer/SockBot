#!/usr/bin/env node

'use strict';

const path = require('path');
const config = require('./config');
const commands = require('./commands');

function relativeRequire(relativePath, module, requireIt) {
    try {
        let resolved = `${__dirname}/${relativePath}/${module}`;
        if (module.startsWith('/') || module.startsWith('./') || module.startsWith('../')) {
            resolved = path.posix.resolve(config.basePath, module);
        }
        // Look in plugins first
        return requireIt(resolved);
    } catch (err) {
        // Error! check if it's ENOENT and try raw module
        if (/^Cannot find module/.test(err.message)) {
            return requireIt(module);
        }
        // Rethrow error if it wasn't ENOENT
        throw err;
    }
}

function loadPlugins(forumInstance, botConfig) {
    Object.keys(botConfig.plugins).map((name) => {
        const plugin = relativeRequire('../plugins', name, require);
        const pluginConfig = botConfig.plugins[name];
        forumInstance.addPlugin(plugin, pluginConfig);
    });
}

function activateConfig(botConfig) {
    const provider = relativeRequire('../providers', botConfig.core.provider, require);
    const instance = new provider(botConfig);
    loadPlugins(instance, botConfig);
    instance.Commands = commands.bindCommands(instance);
    instance.login()
        .then(() => instance.activate())
        .catch((err) => console.log(err, err.stack)); // TODO: should login errors be fatal?
}

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
    config.load(argv._[0])
        .then((cfg) => cfg.map((botConfig) => {
            activateConfig(botConfig);
        }))
        .catch((err) => console.error('Fatal Startup Error:\n', err.message || err));
}
