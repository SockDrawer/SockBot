'use strict';
/**
 * Main Module for SockBot2.0
 * @module SockBot
 * @author Accalia
 * @license MIT
 */

/*eslint-disable no-console */
exports.version = 'v2.0.0';



const config = require('./config'),
    browser = require('./browser');
/* istanbul ignore if */
if (require.main === module) {
    config.loadConfiguration(process.argv[2], () => {
        browser.login(() => console.log(arguments));
    });
}
