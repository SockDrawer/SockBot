/*jslint node: true, indent: 4 */
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
        enabled: false,
        autoTimeout: 30 * 1000,
        userTimeout: 60 * 60 * 1000,
        waitTime: 25 * 1000,
        probability: 1,
        /** Vocabulary file is loaded via require() in elizabot.js. This implies
         *  the path is  relative to 'sock_modules/eliza' :(
         *  TODO: load data in a better way. */
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
    exports.begin = function begin(browser, config) {
        configuration = config.modules[exports.name];
        discourse = browser;
        discourse.log('Loading vocabulary from: ' + configuration.vocabulary);
        eliza = new ElizaBot(configuration.vocabulary);
        setInterval(purgeMemory, 30 * 60 * 1000);
    };
}());
