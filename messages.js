'use strict';
/**
 * message-bus handler for SockBot2.0
 * @module messages
 * @author Accalia
 * @license MIT
 */
const async = require('async');

const utils = require('./utils');
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
    events.onChannel('/__status', statusChannelHandler);
    callback();
};

exports.start = function start() {};

exports.pollMessages = function pollMessages(callback) {
    utils.log('Polling Messages');
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
                const handled = internals.events.emit('message#' + message.channel, message.data);
                if (!handled) {
                    utils.warn('Message ' + message.message_id + ' for channel ' +
                        message.channel + ' was not handled!');
                }
            }
            next();
        }, callback);
    });
};



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
        utils.filterIgnored(result.topic, result.post, (ignored) => {
            if (!ignored) {
                const handled = internals.events.emit('topic#' + topic, message.data, result.topic, result.post);
                if (!handled) {
                    utils.warn('Message ' + message.message_id + ' for channel ' +
                        message.channel + ' was not handled!');
                }
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
 * @param {topicMessageHandler} handler Message handler to add
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
 * @param {topicMessageHandler} handler Message handler to remove
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
 * @param {externals.messageBus.message} message Message Recieved
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
