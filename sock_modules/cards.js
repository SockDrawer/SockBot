/*jslint node: true, indent: 4, todo: true */

'use strict';
/**
 * Cards module. Responsible for drawing cards
 * @module cards
 */

var async = require('async'),
    xRegExp = require('xregexp').XRegExp,
    request = require('request');
var parser,
    discourse,
    conf,
    configuration;

/**
 * Brief description of this module for Help Docs
 */
exports.description = 'Allow bot to play with cards';

/**
 * Default Configuration settings for this sock_module
 */
exports.configuration = {
    enabled: false
};

/**
 * The name of this sock_module
 */
exports.name = 'CardBox';

/**
 * If defined by a sock_module it is the priority of
 * the module with respect to other modules.
 *
 * sock_modules **should not** define modules with negative permissions.
 * Default value is 50 with lower numbers being higher priority. 
 */
exports.priority = 50;

/**
 * The version of this sock_module
 */
exports.version = '1.0.0';

/**
 * Bootstrap the module
 * @param  {string} browser - discourse.
 * @param  {object} config - The configuration to use
 */
exports.begin = function begin(browser, config) {
    configuration = config.modules[exports.name];
    conf = config;
    discourse = browser;
};

/**
     * Runs on notification. If there is a mention of this bot, replies it will respond.
     * @param {string} type - The type of event. Only responds if this is 'mentioned'
     * @param {string} notification - The notification to respond to
     * @param {string} topic - Unused.
     * @param {string} post - The post the notification was for
     * @param {function} callback - The callback to notify when processing is complete.
     */
    exports.onNotify = function onNotify(type, notification, topic,
        post, callback) {
        var customOptions = false;
        discourse.log(type, notification.slug);
        
    };
