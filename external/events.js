'use strict';
/**
 * SockEvents for SockBot2.0
 * @module events
 * @author Accalia
 * @license MIT
 */

/**
 * SockEvents object
 *
 * All methods from core EventEmitter are preserved, refer to the [core api](https://nodejs.org/api/events.html)
 * for details.
 *
 * @typedef {object}
 * @name SockEvents
 * @augments {EventEmitter}
 */
exports.SockEvents = {
    /**
     * Parsed Command Data
     *
     * @name command
     * @typedef {object}
     * @param {string} input Raw Command Input
     * @param {string} command Command name
     * @param {string[]} args Command arguments
     * @param {string} mention Mention text that was included in command
     * @param {external.posts.CleanedPost} post Post that triggered the command
     */

    /**
     * Discourse message-bus channel message handler
     *
     * @callback
     * @name messageHandler
     * @param {externals.messageBus.message} message Message to handle
     */

    /**
     * Discourse message-bus topic message handler
     *
     * @callback
     * @name topicMessageHandler
     * @param {externals.messageBus.postMessage} message Payload of message
     * @param {externals.topics.Topic} topic Topic containing post
     * @param {externals.posts.CleanedPost} post Post that triggered the message
     */

    /**
     * Notification Handler
     *
     * @callback
     * @name notificationHandler
     * @param {external.notifications.notification} notification Received notification
     * @param {external.topics.Topic} [topic] Topic data for received notification
     * @param {external.posts.CleanedPost} [post] Post data for recieved notification
     */

    /**
     * Command handler
     *
     * @callback
     * @name commandHandler
     * @param {command} command Triggering Command
     */

    /**
     * Register a message-bus channel listener
     *
     * @param {string} channel Message-bus channel to subscribe to
     * @param {messageHandler} handler Event Handler
     */
    onChannel: true,

    /**
     * Register a message-bus topic listener
     *
     * @param {Number} topicId Numerical ID of topic to subscribe to
     * @param {topicMessageHandler} handler Event Handler
     */
    onTopic: true,

    /**
     * Unregister a message-bus channel listener
     *
     * @param {string} channel Message-bus channel to subscribe to
     * @param {messageHandler} handler Event Handler
     * @returns {SockEvents} SockEvents for chaining calls
     */
    removeChannel: true,

    /**
     * Unregister a message-bus topic listener
     *
     * @param {Number} topicId Numerical ID of topic to subscribe to
     * @param {topicMessageHandler} handler Event Handler
     * @returns {SockEvents} SockEvents for chaining calls
     */
    removeTopic: true,

    /**
     * Add a notification listener
     *
     * @param {string} type Notification type
     * @param {notificationHandler} handler Notification handler
     * @returns {SockEvents} SockEvents for chaining calls
     */
    onNotification: true,

    /**
     * Remove a notification listener
     *
     * @param {string} type Notification type
     * @param {notificationHandler} handler Notification handler
     * @returns {SockEvents} SockEvents for chaining calls
     */
    removeNotification: true,

    /**
     * Add a notification listener
     *
     * @param {string} type Command name
     * @param {string} helpstring Short help text for command
     * @param {commandHandler} handler Command handler
     * @returns {SockEvents} SockEvents for chaining calls
     */
    onCommand: true,

    /**
     * Remove a command listener
     *
     * @param {string} command Command type
     * @param {commandHandler} handler Command handler
     * @returns {SockEvents} SockEvents for chaining calls
     */
    removeCommand: true
};
