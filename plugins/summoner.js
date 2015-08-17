'use strict';
/**
 * Summoner plugin
 *
 * Watches for @mentions and replies with a canned response
 *
 * @module summoner
 * @author Accalia
 * @license MIT
 */

const internals = {
    browser: null,
    configuration: exports.defaultConfig,
    timeouts: {},
    interval: null,
    events: null
};
exports.internals = internals;

/**
 * Default plugin configuration
 */
exports.defaultConfig = {
    /**
     * Required delay before posting another reply in the same topic.
     *
     * @default
     * @type {Number}
     */
    cooldown: 60 * 1000,
    /**
     * Messages to select reply from.
     *
     * @default
     * @type {string[]}
     */
    messages: [
        '@%username% has summoned me, and so I appear.',
        'Yes master %name%, I shall appear as summoned.',
        'Yes mistress %name%, I shall appear as summoned.'
    ]
};

/**
 * Respond to @mentions
 *
 * @param {external.notifications.Notification} _ Notification recieved (ignored)
 * @param {external.topics.Topic} topic Topic trigger post belongs to
 * @param {external.posts.CleanedPost} post Post that triggered notification
 */
exports.mentionHandler = function mentionHandler(_, topic, post) {
    const now = Date.now();
    if (internals.timeouts[topic.id] && internals.timeouts[topic.id] > now) {
        return;
    }
    const index = Math.floor(Math.random() * internals.configuration.messages.length),
        reply = internals.configuration.messages[index].replace(/%(\w+)%/g, (__, key) => {
            let value = post[key] || '%' + key + '%';
            if (typeof value !== 'string') {
                value = JSON.stringify(value);
            }
            return value;
        }).replace(/(^|\s)@(\w+)\b/g, '$1<a class="mention">@&zwj;$2</a>');
    internals.timeouts[topic.id] = now + internals.configuration.cooldown;
    internals.browser.createPost(topic.id, post.id, reply, () => 0);
};

/**
 * Prepare Plugin prior to login
 *
 * @param {*} plugConfig Plugin specific configuration
 * @param {Config} config Overall Bot Configuration
 * @param {externals.events.SockEvents} events EventEmitter used for the bot
 * @param {Browser} browser Web browser for communicating with discourse
 */
exports.prepare = function prepare(plugConfig, config, events, browser) {
    if (Array.isArray(plugConfig)) {
        plugConfig = {
            messages: plugConfig
        };
    }
    if (plugConfig === null || typeof plugConfig !== 'object') {
        plugConfig = {};
    }
    internals.events = events;
    internals.browser = browser;
    internals.configuration = config.mergeObjects(exports.defaultConfig, plugConfig);
    events.onNotification('mentioned', exports.mentionHandler);
};

/**
 * Start the plugin after login
 */
exports.start = function start() {};

/**
 * Stop the plugin prior to exit or reload
 */
exports.stop = function stop() {};
