/*jslint node: true, indent: 4 */

/**
 * Elizabot - a virtual therapist. 
 * @module eliza
 */

(function () {
    'use strict';
    var discourse,
        summons = {},
        configuration,
        eliza;
    var ElizaBot = require('./eliza/elizabot').ElizaBot;

    /**
     * Brief description of this module for Help Docs
     */
    exports.description = 'Elizabot module';

    /**
     * Default Configuration settings for this sock_module
     */
    exports.configuration = {
        /**
         * Whether to enable this bot
         * @type {Boolean}
         */
        enabled: false,

        /**
         * The default timeout
         * @type {Number}
         */
        autoTimeout: 30 * 1000,

        /**
         * Timeout per user
         * @type {Number}
         */
        userTimeout: 60 * 60 * 1000,

        /**
         * WAit time for a reply
         * @type {Number}
         */
        waitTime: 25 * 1000,

        /**
         * Probability of answering, from 0 to 1
         * @type {Number}
         */
        probability: 1,
        /**
         *  Vocabulary file is loaded via require() in elizabot.js. This implies
         *  the path is  relative to 'sock_modules/eliza' :(
         *  TODO: load data in a better way. 
         *  @type {String} 
         */
        vocabulary: 'elizadata'
    };

    /**
     * The name of this sock_module
     */
    exports.name = 'Eliza';

    /**
     * If defined by a sock_module it is the priority
     * of the module with respect to other modules.
     *
     * sock_modules **should not** define modules with negative permissions.
     * Default value is 50 with lower numbers being higher priority.
     */
    exports.priority = 1000;

    /**
     * The version of this sock_module
     */
    exports.version = '0.0.1';

    function purgeMemory() {
        var lastHour = (new Date().getTime()) - 60 * 60 * 1000, // an hour ago;
            k; //key
        for (k in summons) {
            if (summons.hasOwnProperty(k) && summons[k] < lastHour) {
                delete summons[k];
            }
        }
    }

    /**
     * Runs on notification. Uses a random chance of appearing to determine if it should appear or not, 
     * controlled by the module configuration.
     * @param {string} type - The type of event. Only responds if this is 'mentioned', PM, or reply
     * @param {string} notification - The notification to respond to
     * @param {string} topic - Unused.
     * @param {string} post - The post the notification was for
     * @param {function} callback - The callback to notify when processing is complete.
     */
    exports.onNotify = function onNotify(type, notification, topic,
        post, callback) {
        if ( post && post.cleaned &&
                (['private_message', 'mentioned', 'replied'].indexOf(type)
                    !== -1) &&
                (Math.random() < configuration.probability)) {
            var now = (new Date().getTime());
            var cleaner = /(<\/?[a-z][^>]*>)/ig;
            var text = post.cleaned.replace(cleaner, '');
            var msg = eliza.transform(text);
            if (summons[notification.topic_id] &&
                now < summons[notification.topic_id]) {
                return callback();
            }
            discourse.log(notification.data.display_username +
                ' talked to me in ' + notification.slug);
            summons[notification.topic_id] = now + configuration.autoTimeout;
            setTimeout(function() {
                discourse.createPost(notification.topic_id,
                    notification.post_number, msg,
                    function () {
                    });
            }, configuration.waitTime);
            callback(true);
        } else {
            callback();
        }
    };

 /**
 * Bootstrap the module.
 * @param {object} browser - The Discourse interface object
 * @param {object} config - The SockBot config object
 */
    exports.begin = function begin(browser, config) {
        configuration = config.modules[exports.name];
        discourse = browser;
        discourse.log('Loading vocabulary from: ' + configuration.vocabulary);
        eliza = new ElizaBot(configuration.vocabulary);
        setInterval(purgeMemory, 30 * 60 * 1000);
    };
}());
