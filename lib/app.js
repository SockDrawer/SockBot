#!/usr/bin/env node

/*eslint-disable no-var */
var path = require('path');
var spawner = require('child_process');

// Respawn ensuring proper command switches
exports.respawn = function respawn(script, requiredArgs, hostProcess) {
    if (!requiredArgs) {
        requiredArgs = ['--harmony'];
    }
    var args = hostProcess.execArgv.slice();
    for (var i = 0; i < requiredArgs.length; i += 1) {
        if (args.indexOf(requiredArgs[i]) < 0) {
            args.push(requiredArgs[i]);
        }
    }
    var execScript = path.join(__dirname, script);
    spawner.spawn(hostProcess.execPath, args.concat(execScript, hostProcess.argv.slice(2)), {
        cwd: process.cwd(),
        stdio: 'inherit'
    });
};

/* istanbul ignore if */
if (require.main === module) {
    //respawn, ensuring required command switches
    exports.respawn('cli', ['--harmony', '--harmony_arrow_functions'], process);
}
/*eslint-enable no-var */
