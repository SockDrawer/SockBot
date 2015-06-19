'use strict';
/**
 * Webbrowser abstraction for communicating with discourse
 * @module browser
 * @licenst MIT
 */

let request = require('request');
const utils = require('./utils');
const defaults = {
    rejectUnauthorized: false,
    jar: request.jar(),
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'SockBot 2.0.x Angelic Ariel'
    }
};
request = request.defaults(defaults);

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.defaults = defaults;
}
