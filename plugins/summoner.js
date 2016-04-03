'use strict';
/**
 * Example plugin, replies to mentions with random quips.
 * @module summoner
 * @author Accalia
 * @license MIT
 */

/**
 * Plugin generation function.
 *
 * Returns a plugin object bound to the provided forum provider
 *
 * @param {Provider} forum Active forum Provider
 * @returns {Plugin} An instance of the Summoner plugin
 */
module.exports = function summoner(forum, config) {

    let messages = [
        '@%username% has summoned me, and so I appear.',
        'Yes master %name%, I shall appear as summoned.',
        'Yes mistress %name%, I shall appear as summoned.'
    ];
    config = config || {}; // prevent nulls
    if (Array.isArray(config) && config.length > 0) {
        messages = config;
    } else if (Array.isArray(config.messages) && config.messages.length > 0) {
        messages = config.messages;
    }

    /**
     * Handle a mention notification.
     *
     * Choose a random message and reply with it
     *
     * @param {Notification} notification Notification event to handle
     * @returns {Promise} Resolves when event is processed
     */
    function handler(notification) {
        return notification.getUser()
            .then((user) => {
                const index = Math.floor(Math.random() * messages.length);
                const message = messages[index].replace(/%(\w+)%/g, (_, key) => {
                    let value = user[key] || `%${key}%`;
                    if (typeof value !== 'string') {
                        value = `%${key}%`;
                    }
                    return value;
                });
                return forum.Post.reply(notification.topicId, notification.postId, message);
            }).catch((err) => {
                forum.emit('error', err);
                return Promise.reject(err);
            });
    }

    /**
     * Activate the plugin
     */
    function activate() {
        forum.on('notification:mention', handler);
    }

    /**
     * Deactivate the plugin
     */
    function deactivate() {
        forum.off('notification:mention', handler);
    }

    return {
        activate: activate,
        deactivate: deactivate,
        handler: handler,
        messages: messages
    };
};
