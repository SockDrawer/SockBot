'use strict';

const utils = require('./utils');

exports.bindUser = function bindUser(forum) {
    class User {
        /**
         * description
         *
         */
        constructor(payload) {
            payload = utils.parseJSON(payload);
            const values = {
                username: payload.username,
                name: payload.fullname,
                email: payload.email || '',
                avatar: payload.picture,
                id: payload.uid,
                postCount: payload.postcount,
                topicCount: payload.topiccount,
                reputation: payload.reputation,
                lastPosted: new Date(payload.lastposttime),
                lastSeen: new Date(payload.lastonline)
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
        get name() {
            return utils.mapGet(this, 'name');
        }

        /**
         * description
         *
         */
        get username() {
            return utils.mapGet(this, 'username');
        }

        /**
         * description
         *
         */
        get email() {
            return utils.mapGet(this, 'email');
        }

        /**
         * description
         *
         */
        get avatar() {
            return utils.mapGet(this, 'avatar');
        }

        /**
         * description
         *
         */
        get postCount() {
            return utils.mapGet(this, 'postCount');
        }

        /**
         * description
         *
         */
        get topicCount() {
            return utils.mapGet(this, 'topicCount');
        }

        /**
         * description
         *
         */
        get reputation() {
            return utils.mapGet(this, 'reputation');
        }

        /**
         * description
         *
         */
        get lastPosted() {
            return utils.mapGet(this, 'lastPosted');
        }

        /**
         * description
         *
         */
        get lastSeen() {
            return utils.mapGet(this, 'lastSeen');
        }

        /**
         * description
         *
         */
        url() {
            return Promise.resolve(`${forum.url}/user/${this.username}`);
        }

        /**
         * description
         *
         */
        follow() {
            return forum._emit('user.follow', {
                uid: this.id
            }).then(() => this);
        }

        /**
         * description
         *
         */
        unfollow() {
            return forum._emit('user.unfollow', {
                uid: this.id
            }).then(() => this);
        }

        /**
         * description
         *
         */
        static get(userId) {
            return forum._emit('user.getUserByUID', userId)
                .then((data) => User.parse(data));
        }

        /**
         * description
         *
         */
        static getByName(username) {
            return forum._emit('user.getUserByUsername', username)
                .then((data) => User.parse(data));
        }

        /**
         * description
         *
         */
        static parse(payload) {
            return new User(payload);
        }
    }
    return User;
};
