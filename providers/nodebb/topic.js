'use strict';
const storage = new WeakMap();

function getValue(obj, key) {
    return (storage.get(obj) || {})[key];
}

exports.bindTopic = function bindTopic(socket) {
    class Topic {
        /**
         * description
         *
         */
        constructor(payload) {
            if (!payload) {
                throw new Error('[[invalid-argument:payload required]]');
            }
            if (typeof payload === 'string') {
                try {
                    payload = JSON.parse(payload);
                } catch (e) {
                    throw new Error(`[[invalid-json:${e.message}]]`);
                }
            }
            const type = typeof payload;
            if (type !== 'object') {
                throw new Error(`[[invalid-argument: expected object but received ${type}]]`);
            }
            const values = {
                authorId: payload.uid,
                title: payload.title,
                url: `/${payload.slug}`,
                posted: new Date(payload.timestamp),
                lastPosted: new Date(payload.lastposttime),
                id: payload.tid,
                mainPostId: payload.mainPid,
                postCount: payload.postCount
            };
            storage.set(this, values);
        }

        /**
         * description
         *
         */
        get authorId() {
            return getValue(this, 'authorId');
        }

        /**
         * description
         *
         */
        get title() {
            return getValue(this, 'title');
        }

        /**
         * description
         *
         */
        get posted() {
            return getValue(this, 'posted');
        }

        /**
         * description
         *
         */
        get lastPosted() {
            return getValue(this, 'lastPosted');
        }

        /**
         * description
         *
         */
        get id() {
            return getValue(this, 'id');
        }

        /**
         * description
         *
         */
        get mainPostId() {
            return getValue(this, 'mainPostId');
        }

        /**
         * description
         *
         */
        get postCount() {
            return getValue(this, 'postCount');
        }

        /**
         * description
         *
         */
        url() {
            return getValue(this, 'url');
        }

        /**
         * description
         *
         */
        reply(content) {
                return Promise.reject(new Error('[[E-NOT-IMPLEMENTED-YET]]'));
            }
            /**
             * description
             *
             */
        getAllPosts(eachPost) {
            return Promise.reject(new Error('[[E-NOT-IMPLEMENTED-YET]]'));
        }

        /**
         * description
         *
         */
        getLatestPosts(eachPost) {
            return Promise.reject(new Error('[[E-NOT-IMPLEMENTED-YET]]'));
        }

        /**
         * description
         *
         */
        getPost(postNumber) {
            return Promise.reject(new Error('[[E-NOT-IMPLEMENTED-YET]]'));
        }

        /**
         * description
         *
         */
        markRead(postNumber) {
            return Promise.reject(new Error('[[E-NOT-IMPLEMENTED-YET]]'));
        }

        /**
         * description
         *
         */
        watch() {
            return Promise.reject(new Error('[[E-NOT-IMPLEMENTED-YET]]'));
        }

        /**
         */
        unwatch() {
            return Promise.reject(new Error('[[E-NOT-IMPLEMENTED-YET]]'));
        }

        /**
         * description
         *
         */
        mute() {
            return Promise.reject(new Error('[[E-NOT-IMPLEMENTED-YET]]'));
        }

        /**
         * description
         *
         */
        unmute() {
            return Promise.reject(new Error('[[E-NOT-IMPLEMENTED-YET]]'));
        }

        /**
         * description
         *
         */
        static get(topicId) {
            return Promise.reject(new Error('[[E-NOT-IMPLEMENTED-YET]]'));
        }

        /**
         * description
         *
         */
        static parse(payload) {
            return new Topic(payload);
        }
    }
    return Topic;
};
