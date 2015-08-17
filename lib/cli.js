'use strict';
/**
 * Command-line parsing for SockBot
 * @module cli
 * @license MIT
 */

const SockBot = require('../SockBot'),
    utils = require('./utils');

const privateFns = {
    bootstrap: bootstrap
};

/**
 * Command line bootstrapper
 *
 * @param {string} cfg Configuration to use, if string load as filepath to configuration
 * @param {boolean} checkCfg Check the validity of the configuration without starting the bot
 */
function bootstrap(cfg, checkCfg) {
    SockBot.prepare(cfg, (err) => {
        if (err) {
            utils.error(err.message);
        } else {
            if (checkCfg) {
                utils.log('The supplied configuration file is valid');
            } else {
                SockBot.start(() => 0);
            }
        }
    });
}

/* istanbul ignore if */
if (require.main === module) {
    //argv._[0] should be the config JSON/YAML file
    //validity is checked in app.js; that's before the harmony respawn
    const argv = require('yargs').argv;
    bootstrap(argv._[0], argv.checkCfg);
}

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.privateFns = privateFns;
}
