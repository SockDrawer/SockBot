'use strict';

const utils = require('./utils');

exports.bindNotification = function bindNotification(forum) {
    function notificationHandler(data) {
        const notification = Notification.parse(data);
        //TODO: apply ignore filtering, also rate limiting
        forum.emit(`notification:${notification.type}`, notification);
        forum.emit(`notification`, notification);
    }
    class Notification {
        constructor(data) {
            data = utils.parseJSON(data);
            let type = 'notification';
            if (/^\[\[notifications:user_posted_to/.test(data.bodyShort)) {
                type = 'reply';
            } else if (/^\[\[mentions:user_mentioned_you_in/.test(data.bodyShort)) {
                type = 'mention';
            }
            const values = {
                type: type,
                body: data.bodyShort,
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
        get id() {
            return utils.mapGet(this, 'id');
        }
        get postId() {
            return utils.mapGet(this, 'postId');
        }
        get topicId() {
            return utils.mapGet(this, 'topicId');
        }
        get userId() {
            return utils.mapGet(this, 'userId');
        }
        get type() {
            return utils.mapGet(this, 'type');
        }
        get read() {
            return utils.mapGet(this, 'read');
        }
        get date() {
            return utils.mapGet(this, 'date');
        }
        get body() {
            return utils.mapGet(this, 'body');
        }
        url() {
            return Promise.resolve(`${forum.url}/${utils.mapGet(this,'url')}`);
        }
        getPost() {
            return forum.Post.get(this.postId);
        }
        getTopic() {
            return forum.Topic.get(this.topicId);
        }
        getUser() {
            return forum.User.get(this.userId);
        }
        static get(notificationId) {
            const payload = {
                nids: [notificationId]
            };
            return forum._emit('notifications.get', payload)
                .then((data) => Notification.parse(data[0]));
        }
        static parse(payload) {
            return new Notification(payload);
        }
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
        static activate() {
            forum.addListener('event:new_notification', notificationHandler);
        }
        static deactivate() {
            forum.removeListener('event:new_notification', notificationHandler);
        }
    }
    return Notification;
};
