/*jslint node: true, indent: 4 */
/**
 * @module notifyprint
 * @author Accalia
 * @license MIT
 * @overview Prints messages to the console when notifications are received.
 */
(function () {
    'use strict';
    var m_browser,
        m_config;

    /**
     * @callback AsyncCallback
     * @param {boolean} [stop] Set to True to stop processing notification or message. No lower priority sock_modules will be called for the message if set to `true`
     */

    /**
     * @callback RegistrationCallback
     * @param {string[]} channels Message_bus channels this modules wishes to listen to
     */

    /**
     * @var {string} description Brief description of this module for Help Docs
     */
    exports.description = 'Print messages to console on notifications';

    /**
     * @var {object} configuration Default Configuration settings for this sock_module
     */
    exports.configuration = {
        printTime: true,
        enabled: true
    };

    /**
     * @var {string} name The name of this sock_module
     */
    exports.name = "NotifyPrint";

    /**
     * @var {number} priority If defined by a sock_module it is the priority of the module with respect to other modules.
     *
     * sock_modules **should not** define modules with negative permissions. Default value is 50 with lower numbers being higher priority.
     */
    exports.priority = 0;

    /**
     * @var {string} version The version of this sock_module
     */
    exports.version = "0.0.0";

    /**
     * Begin Processing. Called once on bot init after authentication. **Must** return without blocking.
     * @param {SockBot.Browser} browser Authenticated browser
     * @param {SockBot.Configuration} config Sockbot configuration object
     */
    exports.begin = function begin(browser, config) {
        m_browser = browser;
        m_config = config;
    };

    /**
     * Handle a message from message_bus
     * @param {SockBot.Message} message Message from message_bus
     * @param {SockBot.Post} post Post details associated with message
     * @param {AsyncCallback} callback
     */
    exports.onMessage = function onMessage(message, post, callback) {
        if (message || post) { // jslint unused params
            callback();
        } else {
            callback();
        }
    };

    /**
     * Handle a notification;
     * @param {string} type Notification type received
     * @param {Discourse.Notification} notification Notification details
     * @param {Discourse.Post} post Post details
     * @param {AsyncCallback} callback
     */
    exports.onNotify = function (type, notification, post, callback) {
        if (m_browser && m_config) {
            m_browser.log('Notification ' + type + ' from ' + notification.data.display_username + ' in "' + notification.data.topic_title + '"');
            if (post && post.raw) {
                m_browser.log('\t' + (post.raw || '').split('\n')[0]);
            }
        }
        callback();
    };

    /**
     * Called Periodically to get channels that sock_modules wish to listen in on.
     * @param {RegistrationCallback} callback
     */
    exports.registerListeners = function registerListeners(callback) {
        callback();
    };
}());