'use strict';
/**
 * Example plugin, replies to mentions with random quips.
 * @module summoner
 * @author Accalia
 * @license MIT
 */

const utils = require('../lib/utils');
const debug = require('debug')('sockbot:plugins:summoner');

const defaultMessages = [
    '@%username% has summoned me, and so I appear.',
    'Yes master %name%, I shall appear as summoned.',
    'Yes mistress %name%, I shall appear as summoned.'
];


/**
 * Plugin generation function.
 *
 * Returns a plugin object bound to the provided forum provider
 *
 * @param {Provider} forum Active forum Provider
 * @param {object|Array} config Plugin configuration
 * @returns {Plugin} An instance of the Summoner plugin
 */
module.exports = function summoner(forum, config) {
    let messages = utils.cloneData(defaultMessages);
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
        debug('summoner received a mention notification!');
        return notification.getUser()
            .then((user) => {
                if (user.username && !user.name) {
                    user.name = user.username;
                }
                debug(`summoner responding to summons by ${user.name}`);
                const index = Math.floor(Math.random() * messages.length);
                const message = messages[index].replace(/%(\w+)%/g, (_, key) => {
                    let value = user[key] || `%${key}%`;
                    if (typeof value !== 'string') {
                        value = `%${key}%`;
                    }
                    return value;
                });
                debug(`summoner replying with: ${message}`);
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
module.exports.defaultMessages = defaultMessages;
