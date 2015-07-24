'use strict';
/**
 * message-bus handler for SockBot2.0
 * @module commands
 * @author Accalia
 * @license MIT
 */
const async = require('async');

const utils = require('./utils'),
    config = require('./config');
const browser = require('./browser')();

const internals = {
        clientId: null,
        events: null,
        channels: null,
        channelCounts: null,
        cooldownTimers: {}
    },
    messagePrefix = 'message#',
    messagePrefixTest = /^message#/,
    topicPrefix = 'topic#',
    topicPrefixTest = /^topic#/;

exports.prepare = function prepare(events, clientId, callback) {
    internals.events = events;
    internals.clientId = clientId;
    internals.channels = {};
    internals.channelCounts = {};
    events.onChannel = onChannel;
    events.removeChannel = removeChannel;
    events.onTopic = onTopic;
    events.removeTopic = removeTopic;
    events.on('newListener', onMessageAdd);
    events.on('removeListener', onMessageRemove);
    onChannel('/__status', statusChannelHandler);
    callback();
};

function pollMessages(callback) {
    browser.messageBus(internals.channels, internals.clientId, (err, messages) => {
        if (err) {
            //Reset channel position on error
            resetChannelPositions();
            utils.warn('Error in messageBus: ' + JSON.stringify(err));
            return;
        }
        updateChannelPositions();
        async.each(messages, (message) => {
            setTimeout(() => {

            }, 0);
        });
    });
}

function filterIgnoredOnPost(post, topic, callback) {
    const flow = (err, msg) => setTimeout(() => callback(err, msg), 0),
        ignoredUsers = config.core.ignoreUsers,
        now = Date.now();
    if (post.trust_level >= 4) {
        return flow(null, 'Poster is TL4+');
    }
    if (ignoredUsers.indexOf(post.username) >= 0) {
        return flow('ignore', 'Post Creator Ignored');
    }
    if (post.trust_level < 1) {
        return flow('ignore', 'Poster is TL0');
    }
    if (post.trust_level === 1) {
        if (internals.cooldownTimers[post.username] && now < internals.cooldownTimers[post.username]) {
            return flow('ignore', 'Poster is TL1 on Cooldown');
        }
        internals.cooldownTimers[post.username] = now + config.core.cooldownPeriod;
    }
    if (post.primary_group_name === 'bots') {
        return flow('ignore', 'Poster is a Bot');
    }
    flow(null, 'POST OK');
}

function filterIgnoredOnTopic(post, topic, callback) {
    const flow = (err, msg) => setTimeout(() => callback(err, msg), 0),
        ignoredUsers = config.core.ignoreUsers,
        ignoredCategory = config.core.ignoreCategories;
    if (post.trust_level >= 5) {
        return flow(null, 'Poster is Staff');
    }
    if (topic.details) {
        const user = topic.details.created_by.username;
        if (topic.details.notification_level < 1) {
            return flow('ignore', 'Topic Was Muted');
        }
        if (ignoredUsers.indexOf(user) >= 0) {
            return flow('ignore', 'Topic Creator Ignored');
        }
    }
    if (ignoredCategory.indexOf(topic.category_id) >= 0) {
        return flow('ignore', 'Topic Category Ignored');
    }
    flow(null, 'TOPIC OK');
}

function filterIgnored(post, topic, callback) {
    async.parallel([
        (cb) => filterIgnoredOnPost(post, topic, cb), (cb) => filterIgnoredOnTopic(post, topic, cb)
    ], (err, reason) => {
        if (err) {
            utils.warn('Post #' + post.id + ' Ignored: ' + reason.join(', '));
        }
        callback(err);
    });
}

//{"global_id":24139840,"message_id":841790,"channel":"/topic/1000",
//"data":{"id":487321,"post_number":58230,"updated_at":"2015-07-22 17:32:24 +0000","type":"created"}}
function processTopicMessage(message) {
    const topic = message.channel.replace('/topic/', '');
    async.parallel({
        topic: (cb) => browser.getTopic(topic, cb),
        post: (cb) => browser.getPost(message.data.id, cb)
    }, (err, result) => {
        if (err) {
            return;
        }
        filterIgnored(result.topic, result.post, (ignored) => {
            if (!ignored) {
                internals.events.emit('topic#' + topic, result.topic, result.post);
            }
        });
    });
}

function updateChannelPositions(messages) {
    const channels = internals.channels;
    messages.forEach((message) => {
        const channel = message.channel;
        channels[channel] = Math.max(channels[channel], message.message_id);
    });
}

function resetChannelPositions() {
    Object.keys(internals.channels).forEach((channel) => {
        internals.channels[channel] = -1;
    });
}

/**
 * Message handler for the `/__status` message channel
 *
 * @param {Object<string,number>} message New channel positions
 */
function statusChannelHandler(message) {
    Object.keys(message).forEach((channel) => {
        internals.channels[channel] = message[channel];
    });
}

/**
 * Add message-bus non-topic channel listener
 *
 * @param {string} channel Channel to listen to
 * @param {messageHandler} handler Message handler to add
 * @returns {EventEmitter} Returns emitter, so calls can be chained.
 */
function onChannel(channel, handler) {
    internals.events.on(messagePrefix + channel, handler);
    return internals.events;
}

/**
 * Add message-bus topic channel listener
 *
 * @param {string} topicId Topic to listen to
 * @param {messageHandler} handler Message handler to add
 * @returns {EventEmitter} Returns emitter, so calls can be chained.
 */
function onTopic(topicId, handler) {
    internals.events.on(topicPrefix + topicId, handler);
    return internals.events;
}

/**
 * Remove message-bus non-topic channel listener
 *
 * @param {string} channel Channel to remove listener from
 * @param {messageHandler} handler Message handler to remove
 * @returns {EventEmitter} Returns emitter, so calls can be chained.
 */
function removeChannel(channel, handler) {
    internals.events.removeListener(messagePrefix + channel, handler);
    return internals.events;
}

/**
 * Remove message-bus topic channel listener
 *
 * @param {string} topicId Topic to remove listener from
 * @param {messageHandler} handler Message handler to remove
 * @returns {EventEmitter} Returns emitter, so calls can be chained.
 */
function removeTopic(topicId, handler) {
    internals.events.removeListener(topicPrefix + topicId, handler);
    return internals.events;
}

/**
 * Listen for new message-bus channels
 *
 * @param {string} event Event that's been registered
 * @returns {boolean} True if event was a message-bus channel, false otherwise
 */
function onMessageAdd(event) {
    if (messagePrefixTest.test(event)) {
        const channel = event.replace(messagePrefixTest, '');
        const count = internals.channelCounts[channel] || 0;
        internals.channelCounts[channel] = count + 1;
        if (count === 0) {
            internals.channels[channel] = -1;
        }
        return true;
    } else if (topicPrefixTest.test(event)) {
        const channel = '/topic/' + event.replace(topicPrefixTest, '');
        const count = internals.channelCounts[channel] || 0;
        internals.channelCounts[channel] = count + 1;
        if (count === 0) {
            internals.channels[channel] = -1;
        }
        return true;
    } else {
        return false;
    }
}

/**
 * Listen for parting message-bus channels
 *
 * @param {string} event, event that has unregistered a handler
 * @returns {boolean} True if event was a message-bus channel, false otherwise
 */
function onMessageRemove(event) {
    if (messagePrefixTest.test(event)) {
        const channel = event.replace(messagePrefixTest, '');
        const count = internals.channelCounts[channel] || 1;
        internals.channelCounts[channel] = count - 1;
        if (count <= 1) {
            delete internals.channels[channel];
        }
        return true;
    } else if (topicPrefixTest.test(event)) {
        const channel = '/topic/' + event.replace(topicPrefixTest, '');
        const count = internals.channelCounts[channel] || 1;
        internals.channelCounts[channel] = count - 1;
        if (count <= 1) {
            delete internals.channels[channel];
        }
        return true;
    } else {
        return false;
    }
}

/**
 * Message-bus Message Handler
 *
 * @callback
 * @name messageHandler
 */

/**
 * Message-bus Topic Message Handler
 *
 * @callback
 * @name topicMessageHandler
 */

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.internals = internals;
    exports.privateFns = {
        onChannel: onChannel,
        onTopic: onTopic,
        removeChannel: removeChannel,
        removeTopic: removeTopic,
        onMessageAdd: onMessageAdd,
        onMessageRemove: onMessageRemove,
        statusChannelHandler: statusChannelHandler,
        filterIgnoredOnPost: filterIgnoredOnPost,
        filterIgnoredOnTopic: filterIgnoredOnTopic,
        filterIgnored: filterIgnored,
        updateChannelPositions: updateChannelPositions,
        resetChannelPositions: resetChannelPositions
    };
}
