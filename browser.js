'use strict';
/**
 * Webbrowser abstraction for communicating with discourse
 * @module browser
 * @license MIT
 */

const request = require('request'),
    async = require('async');

const defaults = {
        rejectUnauthorized: false,
        jar: request.jar(),
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'SockBot 2.0.x Angelic Ariel'
        }
    },
    internals = {
        request: request.defaults(defaults),
        queue: async.queue(queueWorker, 1),
        queueWorker: queueWorker,
        defaults: defaults
    };

/**
 * Process browser tasks with rate limiting
 *
 * @param {object} task Task configuration
 * @param {string} [task.method=GET] HTTP method to request
 * @param {string} task.url Site relative URL to request
 * @param {object} [task.form] HTTP form to use in HTTP request
 * @param {discourse~requestComplete} [task.callback] Callback toprovide request results to
 * @param {Number} [task.delay=0] Seconds to delay callback after request for additional rate limiting
 * @param {Function} callback Queue task complete callback
 */
function queueWorker(task, callback) {
    internals.request({
        url: task.url,
        method: task.method || 'GET',
        form: task.form
    }, (e, _, body) => {
        try {
            body = JSON.parse(body);
        } catch (ignore) {} //eslint-disable-line no-empty
        if (task.callback && typeof task.callback === 'function') {
            setTimeout(() => task.callback(e, body), task.delay || 0);
        }
        setTimeout(callback, 5000);
    });
}

/**
 * Browser Request Callback
 * @param {Exception} [err=null] Error encountered processing request
 * @param {Object} body JSON parsed response body. If invalid JSON will be `undefined`
 */
function requestComplete(err, body) {} //eslint-disable-line handle-callback-err, no-unused-vars

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    internals.requestComplete = requestComplete;
    exports.internals = internals;
}
