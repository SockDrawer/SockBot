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
    } catch (e) {
        // Error! check if it's ENOENT and try raw module
        if (/^Cannot find module/.test(e.message)) {
            return requireIt(module);
        }
        // Rethrow error if it wasn't ENOENT
        throw e;
    }
}

function loadPlugins(forumInstance, botConfig){
    Object.keys(botConfig.plugins).map((name)=>{
        const plugin = relativeRequire('../plugins', name, require);
        const pluginConfig = botConfig.plugins[name];
        forumInstance.addPlugin(plugin, pluginConfig);
    });
}

function activateConfig(botConfig) {
    const provider = relativeRequire('../providers', botConfig.core.provider, require);
    const instance = new provider.Forum(botConfig);
    loadPlugins(instance, botConfig);
    instance.Commands = commands.bindCommands(instance);
    instance.login()
        .then(() => instance.activate())
        .catch(e => console.log(e));
}

if (require.main === module) {
    config.loadConfiguration('./test.yml')
        .then((cfg) => cfg.map((botConfig) => {
            activateConfig(botConfig);
        }))
        .catch((e) => console.error('Fatal Startup Error:\n', e.message || e));
}

/*



var path = require('path');
var spawner = require('child_process');

exports.getFullPath = function(script){
    return path.join(__dirname, script);
};

// Respawn ensuring proper command switches
exports.respawn = function respawn(script, requiredArgs, hostProcess) {
    if (!requiredArgs || requiredArgs.length === 0) {
        requiredArgs = ['--harmony'];
    }
    var args = hostProcess.execArgv.slice();
    for (var i = 0; i < requiredArgs.length; i += 1) {
        if (args.indexOf(requiredArgs[i]) < 0) {
            args.push(requiredArgs[i]);
        }
    }
    var execScript = exports.getFullPath(script);
    spawner.spawn(hostProcess.execPath, args.concat(execScript, hostProcess.argv.slice(2)), {
        cwd: hostProcess.cwd(),
        stdio: 'inherit'
    });
};


if (require.main === module) {
    require('yargs')
        .usage('Usage: $0 <cfgFile> [options]')
        .demand(1, 1, 'A valid configuration file must be provided')
        .describe({
            checkCfg: 'Check the validity of the configuration file without starting the bot'
        })
        .argv;
    //respawn, ensuring required command switches
    exports.respawn('cli', ['--harmony', '--harmony_arrow_functions'], process);
}

*/