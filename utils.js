'use strict';
/**
 * Core Utilities for Sockbot
 * @module utils
 * @license MIT
 */


/**
 * Generate a "good enough" Type 4 UUID.
 *
 * Not cryptographically secure, not pretty, not fast, but since we only need a couple of these it's good enough
 *
 * @returns {string} a "type 4 UUID"
 */
exports.uuid = function () {
    return '88888888-8888-4888-2888-888888888888'.replace(/[82]/g, (c) => (Math.random() * c * 2 ^ 8).toString(16));
};

/**
 * Add timestamp to message.
 *
 * @param {*} message Message to timestamp
 * @returns {string} timestamped input message
 */
function addTimestamp(message) {
    let date = new Date().toISOString().replace(/\..+$/, '');
    if (typeof message !== 'string'){
        message = JSON.stringify(message, null, '    ');
    }
    message = '[' + date.replace(/^.+T/, '') + '] ' + message;
    return message;
}

/**
 * Log a message to the console
 *
 * @param {*} message Message to log
 */
exports.log = function (message) {
    console.log(addTimestamp(message)); //eslint-disable-line no-console
};

/**
 * Log a warning to the console
 *
 * @param {*} message Warning to log
 */
exports.warn = function (message) {
    console.warn(addTimestamp(message)); //eslint-disable-line no-console
};

/**
 * Log an error to the console
 *
 * @param {*} message Error to log
 */
exports.error = function (message) {
    console.error(addTimestamp(message)); //eslint-disable-line no-console
};


/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.addTimestamp = addTimestamp;
}
