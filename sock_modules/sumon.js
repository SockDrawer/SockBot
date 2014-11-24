/*jslint node: true, indent: 4 */
(function () {
    'use strict';
    var discourse,
        summons = {},
        users = {},
        configuration;

    /**
     * @var {string} description Brief description of this module for Help Docs
     */
    exports.description = 'Allow Summoning of bot to play in certain threads';

    /**
     * @var {object} configuration Default Configuration settings for this
     * sock_module
     */
    exports.configuration = {
        enabled: false,
        autoTimeout: 60 * 1000,
        userTimeout: 60 * 60 * 1000,
        messages: [
            '@%__username__% has summoned me, and so I appear.',
            'Yes master %__name__%, I shall appear as summoned.',
            'Yes mistress %__name__%, I shall appear as summoned.'
        ]
    };

    /**
     * @var {string} name The name of this sock_module
     */
    exports.name = 'Summoner';

    /**
     * @var {number} priority If defined by a sock_module it is the priority
     * of the module with respect to other modules.
     *
     * sock_modules **should not** define modules with negative permissions.
     * Default value is 50 with lower numbers being higher priority.
     */
    exports.priority = 1000;

    /**
     * @var {string} version The version of this sock_module
     */
    exports.version = '1.1.0';

    function purgeMemory() {
        var lastHour = (new Date().getTime()) - 60 * 60 * 1000, // an hour ago;
            k; //key
        for (k in users) {
            if (users.hasOwnProperty(k) && users[k] < lastHour) {
                delete users[k];
            }
        }
        for (k in summons) {
            if (summons.hasOwnProperty(k) && summons[k] < lastHour) {
                delete summons[k];
            }
        }
    }

    exports.onNotify = function onNotify(type, notification, topic,
        post, callback) {
        if (type === 'mentioned' && !(post.trust_level < 1 ||
                post.primary_group_name === 'bots')) {
            var now = (new Date().getTime()),
                r = Math.floor(Math.random() * configuration.messages.length),
                s = configuration.messages[r],
                k;
            if (post.trust_level === 1 && (users[post.user_id] &&
                    now < users[post.user_id])) {
                return callback();
            }
            if (summons[notification.topic_id] &&
                now < summons[notification.topic_id]) {
                return callback();
            }
            discourse.log(notification.data.display_username +
                ' summoned me to play in ' + notification.slug);
            for (k in post) {
                if (post.hasOwnProperty(k)) {
                    s = s.replace(new RegExp('%__' + k + '__%', 'g'), post[k]);
                }
            }
            summons[notification.topic_id] = now + configuration.autoTimeout;
            if (post.trust_level === 1) {
                users[post.user_id] = now + configuration.userTimeout;
            }
            discourse.createPost(notification.topic_id,
                notification.post_number, s,
                function () {
                    callback(true);
                });
        } else {
            callback();
        }
    };
    exports.begin = function begin(browser, config) {
        configuration = config.modules[exports.name];
        discourse = browser;
        setInterval(purgeMemory, 30 * 60 * 1000);
    };
}());
