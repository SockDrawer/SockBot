#!/usr/bin/env node

/*eslint-disable no-var */
var spawn = require('child_process').spawn;

//respawn, ensuring required command switches
reSpawn('./lib/cli', ['--harmony', '--harmony_arrow_functions']);

// Respawn ensuring proper command switches
function reSpawn(id, requiredArgs) {
    if (!requiredArgs) {
        requiredArgs = ['--harmony'];
    }
    var args = process.execArgv.slice();
    for (var i = 0; i < requiredArgs.length; i += 1) {
        if (args.indexOf(requiredArgs[i]) < 0) {
            args.push(requiredArgs[i]);
        }
    }
    spawn(process.execPath, args.concat(id, process.argv.slice(2)), {
        cwd: process.cwd(),
        stdio: 'inherit'
    });
}
/*eslint-enable no-var */
