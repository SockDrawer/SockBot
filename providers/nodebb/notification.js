'use strict';
const string = require('string');
const utils = require('../../lib/utils');

exports.bindNotification = function bindNotification(forum) {
    const commandTest = new RegExp(`/(^|\\n)(!\\w+|@${forum.username})`);

    class Notification {
        /**
         * description
         *
         */
        constructor(data) {
            data = utils.parseJSON(data);
            let type = 'notification';
            if (/^\[\[notifications:user_posted_to/.test(data.bodyShort)) {
                type = 'reply';
            } else if (/^\[\[mentions:user_mentioned_you_in/.test(data.bodyShort)) {
                type = 'mention';
            }

            const subtype = (/^\[\[\w+:(\w+)/.exec(data.bodyShort) || [])[1] || '';

            const values = {
                type: type,
                subtype: subtype,
                label: data.bodyShort,
                body: string(data.bodyLong).unescapeHTML().s,
                id: data.nid,
                postId: data.pid,
                topicId: data.tid,
                userId: data.from,
                read: data.read,
                date: new Date(data.datetime),
                url: data.path
            };
            utils.mapSet(this, values);
        }

        /**
         * description
         *
         */
        get id() {
            return utils.mapGet(this, 'id');
        }

        /**
         * description
         *
         */
        get postId() {
            return utils.mapGet(this, 'postId');
        }

        /**
         * description
         *
         */
        get topicId() {
            return utils.mapGet(this, 'topicId');
        }

        /**
         * description
         *
         */
        get userId() {
            return utils.mapGet(this, 'userId');
        }

        /**
         * description
         *
         */
        get type() {
            return utils.mapGet(this, 'type');
        }

        /**
         * description
         *
         */
        get subtype() {
            return utils.mapGet(this, 'subtype');
        }

        /**
         * description
         *
         */
        get read() {
            return utils.mapGet(this, 'read');
        }

        /**
         * description
         *
         */
        get date() {
            return utils.mapGet(this, 'date');
        }

        /**
         * description
         *
         */
        get label() {
            return utils.mapGet(this, 'label');
        }

        /**
         * description
         *
         */
        get body() {
            return utils.mapGet(this, 'body');
        }

        /**
         * description
         *
         */
        getText() {
            if (this.type === 'mention') {
                return forum.Post.preview(this.body);
            }
            return Promise.resolve(this.body);
        }

        /**
         * description
         *
         */
        url() {
            const value = utils.mapGet(this, 'url');
            return Promise.resolve(`${forum.url}/${value}`);
        }

        hasCommands() {
            return commandTest.test(this.body);
        }

        /**
         * description
         *
         */
        getPost() {
            return forum.Post.get(this.postId);
        }

        /**
         * description
         *
         */
        getTopic() {
            return forum.Topic.get(this.topicId);
        }

        /**
         * description
         *
         */
        getUser() {
            return forum.User.get(this.userId);
        }

        /**
         * description
         *
         */
        static get(notificationId) {
            const payload = {
                nids: [notificationId]
            };
            return forum._emit('notifications.get', payload)
                .then((data) => Notification.parse(data[0]));
        }

        /**
         * description
         *
         */
        static parse(payload) {
            return new Notification(payload);
        }

        /**
         * description
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
         * description
         *
         */
        static activate() {
            forum.socket.on('event:new_notification', notifyHandler);
        }

        /**
         * description
         *
         */
        static deactivate() {
            forum.socket.removeListener('event:new_notification', notifyHandler);
        }
    }

    /**
     * description
     *
     */
    function notifyHandler(data) {
        const notification = Notification.parse(data);
        //TODO: apply ignore filtering, also rate limiting
        forum.Commands.get(notification).then((command)=>command.execute());
        forum.emit(`notification:${notification.type}`, notification);
        forum.emit('notification', notification);
    }

    return Notification;
};
