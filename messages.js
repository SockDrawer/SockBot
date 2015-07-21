'use strict';
/**
 * message-bus handler for SockBot2.0
 * @module commands
 * @author Accalia
 * @license MIT
 */
const internals = {
    clientId: null,
    events: null,
    channels: null,
    channelCounts: null,
    addChannel: addChannel,
    removeChannel: removeChannel,
    onMessageAdd: onMessageAdd,
    onMessageRemove: onMessageRemove
};

exports.prepare = function prepare(events, clientId, callback) {
    internals.events = events;
    internals.clientId = clientId;
    internals.channels = {};
    internals.channelCounts = {};
    events.addChannel = addChannel;
    events.removeChannel = removeChannel;
    events.on('newListener', onMessageAdd);
    events.on('removeListener', onMessageRemove);
    callback();
};

/**
 * Add message-bus channel listener
 *
 * @param {string} channel Channel to listen to
 * @param {messageHandler} handler Message handler to add
 * @returns {EventEmitter} Returns emitter, so calls can be chained.
 */
function addChannel(channel, handler) {
    internals.events.on('message-bus#' + channel, handler);
    return internals.events;
}

/**
 * Remove message-bus channel listener
 *
 * @param {string} channel Channel to remove listener from
 * @param {messageHandler} handler Message handler to remove
 * @returns {EventEmitter} Returns emitter, so calls can be chained.
 */
function removeChannel(channel, handler) {
    internals.events.removeListener('message-bus#' + channel, handler);
    return internals.events;
}

/**
 * Listen for new message-bus channels
 *
 * @param {string} event Event that's been registered
 * @returns {boolean} True if event was a message-bus channel, false otherwise
 */
function onMessageAdd(event) {
    if (!/^message-bus#/.test(event)) {
        return false;
    }
    const channel = event.replace(/^message-bus#/, '');
    const count = internals.channelCounts[channel] || 0;
    internals.channelCounts[channel] = count + 1;
    if (count === 0) {
        internals.channels[channel] = -1;
    }
    return true;
}

/**
 * Listen for parting message-bus channels
 *
 * @param {string} event, event that has unregistered a handler
 * @returns {boolean} True if event was a message-bus channel, false otherwise
 */
function onMessageRemove(event) {
    if (!/^message-bus#/.test(event)) {
        return false;
    }
    const channel = event.replace(/^message-bus#/, '');
    const count = internals.channelCounts[channel] || 1;
    internals.channelCounts[channel] = count - 1;
    if (count <= 1) {
        delete internals.channels[channel];
    }
    return true;
}

/**
 * Message-bus Message Handler
 *
 * @callback
 * @name messageHandler
 */

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.internals = internals;
}
