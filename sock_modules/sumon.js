/*jslint node: true, indent: 4 */
(function () {

/**
 * Sumon module. Summons the bot.
 * @module sumon
 */

    'use strict';
    var discourse,
        summons = {},
        configuration;

    /**
     * Brief description of this module for Help Docs
     */
    exports.description = 'Allow Summoning of bot to play in certain threads';


    /**
     * Default Configuration settings for this sock_module
     * @type {Object}
     */
    exports.configuration = {
        /**
         * Is the module enabled?
         * @type {Boolean}
         */
        enabled: false,

        /**
         * What's the timeout for backfilling old summons
         * @type {Number}
         */
        autoTimeout: 60 * 1000,

        /**
         * Unused
         * @type {Number}
         */
        userTimeout: 60 * 60 * 1000,

        /**
         * How likely it is that the bot will respond to summons. 
         * Probability is between 0 and 1
         * @type {Number}
         */
        probability: 1,

        /**
         * Messages to use when being summoned.
         * @type {Array}
         */
        messages: [
            '@%__username__% has summoned me, and so I appear.',
            'Yes master %__name__%, I shall appear as summoned.',
            'Yes mistress %__name__%, I shall appear as summoned.'
        ]
    };

    /**
     * The name of this sock_module
     */
    exports.name = 'Summoner';

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
    exports.version = '1.1.0';

    /**
     * Purge summons older than an hour ago. For performance reasons
     */
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
     * @param {string} type - The type of event. Only responds if this is 'mentioned'
     * @param {string} notification - The notification to respond to
     * @param {string} topic - Unused.
     * @param {string} post - The post the notification was for
     * @param {function} callback - The callback to notify when processing is complete.
     */
    exports.onNotify = function onNotify(type, notification, topic,
        post, callback) {
        if (type === 'mentioned' && Math.random() < configuration.probability) {
            var now = (new Date().getTime()),
                r = Math.floor(Math.random() * configuration.messages.length),
                s = configuration.messages[r];
            if (summons[notification.topic_id] &&
                now < summons[notification.topic_id]) {
                return callback();
            }
            discourse.log(notification.data.display_username +
                ' summoned me to play in ' + notification.slug);
            s = s.replace(/%__(\w+)__%/g, function (m, key) {
                if (post.hasOwnProperty(key)) {
                    return key === 'name' 
                        ? post[key].replace(/@/g, '@&zwj;')
                        : post[key];
                }
                return m;
            });
            summons[notification.topic_id] = now + configuration.autoTimeout;
            discourse.createPost(notification.topic_id,
                notification.post_number, s,
                function () {
                    callback(true);
                });
        } else {
            callback();
        }
    };

    /**
     * Bootstrap the module
     * @param  {string} browser - discourse.
     * @param  {object} config - The configuration to use
     */
    exports.begin = function begin(browser, config) {
        configuration = config.modules[exports.name];
        discourse = browser;
        setInterval(purgeMemory, 30 * 60 * 1000);
    };
}());
