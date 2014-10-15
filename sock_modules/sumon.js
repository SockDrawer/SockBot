/*jslint node: true, indent: 4 */
(function () {
    'use strict';
    var m_config,
        m_browser,
        summons = {},
        summoning;

    /**
     * @var {string} description Brief description of this module for Help Docs
     */
    exports.description = 'Allow Summoning of bot to play in certain threads';

    /**
     * @var {object} configuration Default Configuration settings for this sock_module
     */
    exports.configuration = {
        enabled: true,
        autoTimeout: 1 * 60 * 1000
    };

    /**
     * @var {string} name The name of this sock_module
     */
    exports.name = "Summoner";

    /**
     * @var {number} priority If defined by a sock_module it is the priority of the module with respect to other modules.
     *
     * sock_modules **should not** define modules with negative permissions. Default value is 50 with lower numbers being higher priority.
     */
    exports.priority = 1000;

    /**
     * @var {string} version The version of this sock_module
     */
    exports.version = "1.1.0";

    exports.onNotify = function onNotify(type, notification, post, callback) {
        if (type === 'mentioned' && m_config.summoner && summoning.test(post.raw)) {
            console.log(notification.data.display_username + ' summoned me to play in ' + notification.slug);
            var now = (new Date().getTime());
            if ((!!summons[notification.topic_id]) && now < summons[notification.topic_id]) {
                callback();
                return;
            }
            summons[notification.topic_id] = now + m_config.summonerTimeout;
            m_browser.reply_topic(notification.topic_id, notification.post_number,
                '@' + notification.data.display_username + ' has summoned me, and so I appear' + ((notification.topic_id !== 3125) ? '.' : '?'),
                callback);
        } else {
            callback();
        }
    };
    exports.begin = function begin(browser, config) {
        m_browser = browser;
        m_config = config;
        summoning = new RegExp('@' + config.username + '(,|[.]|[?]|!|;|:| ?-)');
    };
}());