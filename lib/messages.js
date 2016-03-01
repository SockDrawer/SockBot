'use strict';
/**
 * message-bus handler for SockBot2.0
 * @module messages
 * @author Accalia
 * @license MIT
 */
const async = require('async');

const config = require('./config'),
    utils = require('./utils');
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
        processTopicMessage: processTopicMessage,
        broadcastMessages: broadcastMessages,
        processPosts: processPosts,
        processTopics: processTopics,
        handleMessages: handleMessages
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
    internals.events.emit('logMessage', 'Polling Messages');
    browser.messageBus(internals.channels, internals.clientId, (err, messages) => {
        if (err) {
            //Reset channel position on error
            privateFns.resetChannelPositions();
            internals.events.emit('logError', 'Error in messageBus: ' + JSON.stringify(err));
            return setImmediate(() => callback(err));
        }
        if (!messages || !Array.isArray(messages)) {
            //Reset channel position on invalid response
            privateFns.resetChannelPositions();
            internals.events.emit('logWarning', 'Invalid Response from messageBus');
            return setImmediate(callback);
        }
        privateFns.updateChannelPositions(messages);
        setImmediate(() => privateFns.handleMessages(messages));

        // Delay completion by an amount of time based on the number of messages recieved in the poll.
        // The more messages the longer we wait, up to a maximum
        setTimeout(callback, Math.min((messages.length || 1) * 500, 30 * 1000));
    });
};

function logUnhandled(handled, message) {
    if (!handled) {
        internals.events.emit('logWarning', 'Message ' + message.message_id + ' for channel ' + message.channel +
            ' was not handled!');
    }
}

function broadcastMessages(messages, callback) {
    const tester = /\/topic\//;
    messages.forEach(message => {
        if (tester.test(message.channel)) {
            return;
        }
        const handled = internals.events.emit('message#' + message.channel, message.data);
        logUnhandled(handled, message);
    });
    setImmediate(() => callback(null, messages.filter(message => tester.test(message.channel))));
}

function processTopics(topicMessages, callback) {
    const tester = /\/topic\//,
        topics = {};
    topicMessages.forEach(message => {
        const topic = message.channel.replace(tester, '');
        topics[topic] = topics[topic] || [];
        topics[topic].push(message);
    });
    async.forEachOf(topics, (messages, topicId, next) => {
        browser.getTopic(topicId, (err, topic) => {
            if (err || !topic) {
                internals.events.emit('logWarning', 'Error Retrieving topic ' + topicId + ': ' +
                    (err || 'NO TOPIC RECEIVED'));
                return next();
            }
            messages.forEach(message => {
                message.topic = topic;
            });
            next();
        });
    }, () => {
        async.filter(topicMessages, (message, filter) => {
            if (!message.topic) {
                return filter(false);
            }
            utils.filterIgnoredOnTopic(message.topic, (err) => filter(!err));
        }, postMessages => callback(null, postMessages));
    });
}

function processPosts(postMessages, callback) {
    const posts = {};
    postMessages.forEach(message => {
        const post = message.data.id;
        posts[post] = posts[post] || [];
        posts[post].push(message);
    });
    async.forEachOf(posts, (messages, postId, next) => {
        browser.getPost(postId, (err, post) => {
            if (err) {
                internals.events.emit('logWarning', 'Error retrieving post ' + postId + ': ' + err);
            } else if (!post || !post.topic_id) {
                internals.events.emit('logWarning', 'Invalid post ' + postId + ' retrieved: ' + JSON.stringify(post));
            } else {
                messages.forEach(message => message.post = post);
            }
            next();
        });
    }, () => {
        async.filter(postMessages, (message, filter) => {
            if (!message.post) {
                return filter(false);
            }
            utils.filterIgnoredOnPost(message.post, (err) => filter(!err));
        }, filteredMessages => callback(null, filteredMessages));
    });
}

function handleMessages(messages) {
    messages = messages.filter(message => config.core.handleActedMessage || message.data.type !== 'acted');
    async.waterfall([next => {
        privateFns.broadcastMessages(messages, next);
    }, (topicMessages, next) => {
        privateFns.processTopics(topicMessages, next);
    }, (postMessages, next) => {
        privateFns.processPosts(postMessages, next);
    }], (_, finalMessages) => {
        finalMessages.forEach(message => {
            const handled = internals.events.emit('topic#' + message.topic.id,
                message.data, message.topic, message.post);
            logUnhandled(handled, message);
        });
    });
}

/**
 * Process a message that is from a `/topic/*` channel
 *
 * @param {externals.messageBus.message} message Message to process
 */
function processTopicMessage(message) {
    if (!config.core.handleActedMessage && message.data.type === 'acted') {
        return;
    }
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
                logUnhandled(handled, message);
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
 * @param {string} event Event that has unregistered a handler
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
