/*jslint node: true, indent: 4 */
(function () {
    'use strict';
    var m_config,
        m_browser,
        summons = {},
        summoning;

    exports.name = "Summoner 1.0.0";
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
                '@' + notification.data.display_username + ' has summoned me, and so I appear.',
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