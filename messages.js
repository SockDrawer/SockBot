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
    privateFns = {
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
        resetChannelPositions: resetChannelPositions,
        processTopicMessage: processTopicMessage
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

exports.pollMessages = function pollMessages(callback) {
    browser.messageBus(internals.channels, internals.clientId, (err, messages) => {
        if (err) {
            //Reset channel position on error
            privateFns.resetChannelPositions();
            utils.warn('Error in messageBus: ' + JSON.stringify(err));
            return callback(err);
        }
        privateFns.updateChannelPositions(messages);
        async.each(messages, (message, next) => {
            if (/\/topic\//.test(message.channel)) {
                privateFns.processTopicMessage(message);
            } else {
                internals.events.emit(message.channel, message.data);
            }
            next();
        }, callback);
    });
};

/**
 * Proccess post for ignore contitions
 *
 * @param {externals.posts.CleanedPost} post Post to filter
 * @param {externals.topics.Topic} topic Topic `post` belongs to
 * @param {filterCallback} callback Completion Callback
 * @returns {null} No return value
 */
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
    return flow(null, 'POST OK');
}

/**
 * Proccess topic for ignore contitions
 *
 * @param {externals.posts.CleanedPost} post Triggering post
 * @param {externals.topics.Topic} topic Topic to filter
 * @param {filterCallback} callback Completion Callback
 * @returns {null} No return value
 */
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

/**
 * Filter post/topic for ignore conditions
 *
 * @param {externals.posts.CleanedPost} post Post to filter
 * @param {externals.topics.Topic} topic Topic to filter
 * @param {completionCallback} callback Completion Callback
 */
function filterIgnored(post, topic, callback) {
    async.parallel([
        (cb) => {
            privateFns.filterIgnoredOnPost(post, topic, cb);
        }, (cb) => {
            privateFns.filterIgnoredOnTopic(post, topic, cb);
        }
    ], (err, reason) => {
        if (err) {
            utils.warn('Post #' + post.id + ' Ignored: ' + reason.join(', '));
        }
        callback(err);
    });
}

/**
 * Process a message that is from a `/topic/*` channel
 *
 * @param {externals.messageBus.message} message Message to process
 */
function processTopicMessage(message) {
    const topic = message.channel.replace('/topic/', '');
    async.parallel({
        topic: (cb) => browser.getTopic(topic, cb),
        post: (cb) => browser.getPost(message.data.id, cb)
    }, (err, result) => {
        if (err) {
            return;
        }
        privateFns.filterIgnored(result.topic, result.post, (ignored) => {
            if (!ignored) {
                internals.events.emit('topic#' + topic, message.data, result.topic, result.post);
            }
        });
    });
}

/**
 * Update channel position for polled messages.
 *
 * @param {externals.messageBus.message[]} messages Messages that were polled
 */
function updateChannelPositions(messages) {
    const channels = internals.channels;
    messages.forEach((message) => {
        const channel = message.channel;
        channels[channel] = Math.max(channels[channel] || -1, message.message_id);
    });
}

/**
 * Reset all channels to position -1.
 *
 * This is to reset message-bus after poll failure or after software version update
 */
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
 * Completion Callback
 *
 * @callback
 * @name completionCallback
 * @param {string|Error} err Filter Error state
 */

/**
 * Filter Callback
 *
 * @callback
 * @name filterCallback
 * @param {string|Error} err Filter Error state
 * @param {string} reason Filter Reason
 */

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
 * @param {externals.messageBus.postMessage} message Payload of message
 * @param {externals.topics.Topic} topic Topic containing post
 * @param {externals.posts.CleanedPost} post Post that triggered the message
 */

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.internals = internals;
    exports.privateFns = privateFns;
}
