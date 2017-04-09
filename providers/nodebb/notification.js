'use strict';
/**
 * NodeBB provider module Notification class
 * @module sockbot.providers.nodebb.Notification
 * @author Accalia
 * @license MIT
 */
const debug = require('debug')('sockbot:providers:noderbb:notifications');
const string = require('string');
const utils = require('../../lib/utils');

/**
 * Create a Notification class and bind it to a forum instance
 *
 * @param {Provider} forum A forum instance to bind to constructed Notification class
 * @returns {Notification} A Notification class bound to the provided `forum` instance
 */
exports.bindNotification = function bindNotification(forum) {

    const mentionTester = new RegExp(`(^|\\s)@${forum.username}(\\s|$)`, 'i');

    /**
     * Notification types enum
     *
     * @readonly
     * @enum
     */
    const notificationType = { //eslint-disable-line no-unused-vars
        notification: 'notification',
        reply: 'reply',
        mention: 'mention'
    };

    /**
     * Notification Class
     *
     * Represents a forum notification
     *
     * @public
     */
    class Notification {
        /**
         * Construct a Notification object from payload
         *
         * This constructor is intended to be private use only, if you need to construct a notification from payload
         * data use `Notification.parse()` instead
         *
         * @public
         * @class
         *
         * @param {*} payload Payload to construct the Notification object out of
         */
        constructor(payload) {
            payload = utils.parseJSON(payload);
            const body = string(payload.bodyLong || '').unescapeHTML().s;
            let type = 'notification';
            if (/^\[\[\w+:user_posted_to/i.test(payload.bodyShort)) {
                type = 'reply';
            } else if (/^\[\[\w+:user_mentioned_you_in/i.test(payload.bodyShort)) {
                if (mentionTester.test(body)) {
                    type = 'mention';
                } else {
                    type = 'group_mention';
                }
            }

            const subtype = (/^\[\[\w+:(\w+)/.exec(payload.bodyShort) || [])[1] || '';

            const values = {
                type: type,
                subtype: subtype,
                label: payload.bodyShort,
                body: body,
                id: payload.nid,
                postId: payload.pid,
                topicId: payload.tid,
                categoryId: payload.cid,
                userId: payload.from,
                read: payload.read,
                date: new Date(payload.datetime),
                url: payload.path
            };
            utils.mapSet(this, values);
        }

        /**
         * Unique notification id of this notification
         *
         * @public
         *
         * @type {string}
         */
        get id() {
            return utils.mapGet(this, 'id');
        }

        /**
         * Post id this notification refers to
         *
         * @public
         *
         * @type {number}
         */
        get postId() {
            return utils.mapGet(this, 'postId');
        }

        /**
         * Topic id this post refers to
         *
         * @public
         *
         * @type {number}
         */
        get topicId() {
            return utils.mapGet(this, 'topicId');
        }

        /**
         * Category id this post refers to
         *
         * @public
         *
         * @type {number}
         */
        get categoryId() {
            return utils.mapGet(this, 'categoryId');
        }

        /**
         * User id that generated this notification
         *
         * @public
         *
         * @type {number}
         */
        get userId() {
            return utils.mapGet(this, 'userId');
        }

        /**
         * Notification type code
         *
         * @public
         *
         * @type {notificationType}
         */
        get type() {
            return utils.mapGet(this, 'type');
        }

        /**
         * Notification subtype
         *
         * @public
         *
         * @type {string}
         */
        get subtype() {
            return utils.mapGet(this, 'subtype');
        }

        /**
         * Is this notification read yet?
         *
         * @public
         *
         * @type {boolean}
         */
        get read() {
            return utils.mapGet(this, 'read');
        }

        /**
         * Datetime this notification was generated on
         *
         * @public
         *
         * @type {Date}
         */
        get date() {
            return utils.mapGet(this, 'date');
        }

        /**
         * Notification label
         *
         * @public
         *
         * @type {string}
         */
        get label() {
            return utils.mapGet(this, 'label');
        }

        /**
         * Content of notification.
         *
         * @public
         *
         * @type {string}
         */
        get body() {
            return utils.mapGet(this, 'body');
        }

        /**
         * HTML Markup for this notification body
         *
         * @public
         *
         * @returns {Promise<string>} Resolves to the notification markup
         *
         * @promise
         * @fulfill the Notification markup
         */
        getText() {
            if (this.type === 'mention') {
                return forum.Post.preview(this.body);
            }
            return Promise.resolve(this.body);
        }

        /**
         * URL Link for the notification if available
         *
         * @public
         *
         * @returns {Promise<string>} Resolves to the URL for the post the notification is for
         *
         * @promise
         * @fullfil {string} The URL for the post the notification is for
         */
        url() {
            const value = utils.mapGet(this, 'url');
            return Promise.resolve(`${forum.url}/${value}`);
        }

        /**
         * Get the post this Notification refers to
         *
         * @public
         *
         * @returns {Promise<Post>} Resolves to the post the notification refers to
         *
         * @promise
         * @fulfill {Post} the Post the notification refers to
         */
        getPost() {
            return forum.Post.get(this.postId);
        }

        /**
         * Get the topic this Notification refers to
         *
         * @public
         *
         * @returns {Promise<Topic>} Resolves to the topic the notification refers to
         *
         * @promise
         * @fulfill {Topic} the Topic the notification refers to
         */
        getTopic() {
            return forum.Topic.get(this.topicId);
        }

        /**
         * Get the user who generated this Notification
         *
         * @public
         *
         * @returns {Promise<User>} Resolves to the user who generated this notification
         *
         * @promise
         * @fulfill {Post} the User who generated this notification
         */
        getUser() {
            return forum.User.get(this.userId);
        }

        /**
         * Get a notification
         *
         * @public
         * @static
         *
         * @param {string} notificationId The id of the notification to get
         * @returns {Promise<Notification>} resolves to the retrieved notification
         *
         *@promise
         * @fulfill {Notification} the retrieved notification
         */
        static get(notificationId) {
            const payload = {
                nids: [notificationId]
            };
            return forum._emit('notifications.get', payload)
                .then((data) => Notification.parse(data[0]));
        }

        /**
         * Parse a notification from a given payload
         *
         * @public
         * @static
         *
         * @param {*} payload The notification payload
         * @returns {Notification} the parsed notification
         */
        static parse(payload) {
            if (!payload) {
                throw new Error('E_NOTIFICATION_NOT_FOUND');
            }
            return new Notification(payload);
        }

        /**
         * Notification processor
         *
         * @typedef {NotificationProcessor}
         * @function
         *
         * @param {Notification} notification Notification to process
         * @returns {Promise} Resolves on completion
         */

        /**
         * Get all notifications
         *
         * @public
         * @static
         *
         * @param {NotificationProcessor} eachNotification Function to process notifications
         * @returns {Promise} Fulfills after notifications are processed
         *
         */
        static getNotifications(eachNotification) {
            return new Promise((resolve, reject) => {
                let idx = 0;
                const iterate = () => forum._emit('notifications.loadMore', {
                    after: idx
                }).then((results) => {
                    if (!results.notifications || !results.notifications.length) {
                        return resolve();
                    }
                    idx = results.nextStart;
                    const each = (data) => eachNotification(Notification.parse(data));
                    return utils.iterate(results.notifications, each)
                        .then(iterate).catch(reject);
                }).catch(reject);
                iterate();
            });
        }

        /**
         * Activate notifications.
         *
         * Listen for new notifications and process ones that arrive
         */
        static activate() {
            forum.socket.on('event:new_notification', notifyHandler);
            forum.emit('log', 'Notifications Activated: Now listening for new notifications');
        }

        /**
         * Deactivate notifications
         *
         * Stop listening for new notifcations.
         */
        static deactivate() {
            forum.socket.off('event:new_notification', notifyHandler);
            forum.emit('log', 'Notifications Deactivated: No longer listening for new notifications');
        }
    }

    /**
     * Handle notifications that arrive
     *
     * Parse notification from event and process any commands cound within
     *
     * @private
     *
     * @param {*} data Notification data
     * @returns {Promise} Resolved when any commands contained in notificaiton have been processed
     */
    function notifyHandler(data) {
        const notification = Notification.parse(data);
        return evalBlacklist(notification)
        .then(() => {
            forum.emit('log', `Notification ${notification.id}: ${notification.label} received`);

            const ids = {
                post: notification.postId,
                topic: notification.topicId,
                user: notification.userId,
                pm: -1,
                chat: -1
            };
            return notification.getText()
                .then((postData) => forum.Commands.get(ids,
                    postData, (content) => forum.Post.reply(notification.topicId, notification.postId, content)))
                .then((commands) => {
                    if (commands.commands.length === 0) {
                        debug(`Emitting events: 'notification' and 'notification:${notification.type}'`);
                        forum.emit(`notification:${notification.type}`, notification);
                        forum.emit('notification', notification);
                    }
                    return commands;
                })
                .then((commands) => commands.execute());
        }).catch((err) => {
            if (err === 'Ignoring notification') {
                //We do not process the notification, but we can continue with life
                return Promise.resolve();
            }
            throw err;
        });
    }

    /**
     * Evaluate the blacklist.
     *
     * Determine if we want to process this notification or not based on config settings
     *
     * @private
     *
     * @param {*} notification Notification we are parsing
     * @returns {Promise} Rejects with "Ignoring notification" if we do not process this. Resolves with the notification
     * otherwise.
     */
    function evalBlacklist(notification) {
        return new Promise((resolve, reject) => {
            const ignoreCategories = forum.config.core.ignoreCategories || [];

            //if there's no blacklist, we can ignore the hit for getting the category
            if (ignoreCategories && notification.categoryId) {
                if (ignoreCategories.some((elem) => elem.toString() === notification.categoryId.toString())) {
                    forum.emit('log', `Notification from category ${notification.categoryId} ignored`);
                    return reject('Ignoring notification');
                }
            }
            return resolve(notification);
        });
    }

    return Notification;
};

