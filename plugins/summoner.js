'use strict';

module.exports = function summoner(forum, config) {

    let messages = [
        '@%username% has summoned me, and so I appear.',
        'Yes master %name%, I shall appear as summoned.',
        'Yes mistress %name%, I shall appear as summoned.'
    ];
    if (Array.isArray(config) && config.length > 0) {
        messages = config;
    } else if (Array.isArray(config.messages) && config.messages.length > 0) {
        messages = config.messages;
    }

    function handler(notification) {
        return Promise.all([notification.getPost(),
                notification.getUser()
            ])
            .then((data) => {
                const post = data[0],
                    user = data[1],
                    index = Math.floor(Math.random() * messages.length);
                return post.reply(messages[index].replace(/%(\w+)%/g, (_, key) => {
                    let value = user[key] || `%${key}%`;
                    if (typeof value !== 'string') {
                        value = `%${key}%`;
                    }
                    return value;
                }));
            });
    }

    function activate() {
        forum.on('notification.mention', handler);
    }

    function deactivate() {
        forum.off('notification.mention', handler);
    }

    return {
        activate: activate,
        deactivate: deactivate,
        handler: handler,
        messages: mes
    };
};
