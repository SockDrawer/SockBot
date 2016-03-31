'use strict';
const utils = require('../../lib/utils');

/**
 * description
 */
exports.bindCategory = function bindCategory(forum) {
    function onEachTopic(eachTopic) {
        return (data) => forum.Topic.parseExtended(data)
            .then((parsed) => eachTopic(parsed.topic, parsed.user, parsed.category));
    }
    class Category {
        /**
         * description
         *
         */
        constructor(payload) {
            payload = utils.parseJSON(payload);
            const values = {
                id: payload.cid,
                name: payload.name,
                description: payload.description,
                url: payload.slug,
                parentId: payload.parentCid,
                topicCount: payload.topic_count,
                postCount: payload.post_count,
                recentPosts: payload.numRecentReplies
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
        get description() {
            return utils.mapGet(this, 'description');
        }

        /**
         * description
         *
         */
        get parentId() {
            return utils.mapGet(this, 'parentId');
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
        get postCount() {
            return utils.mapGet(this, 'postCount');
        }

        /**
         * description
         *
         */
        get recentPosts() {
            return utils.mapGet(this, 'recentPosts');
        }

        /**
         * description
         *
         */
        url() {
            return Promise.resolve(`${forum.url}/category/${utils.mapGet(this, 'url')}`);
        }

        /**
         * description
         *
         */
        getAllTopics(eachTopic) {
            return new Promise((resolve, reject) => {
                let idx = 0;
                const each = onEachTopic(eachTopic);
                const iterate = () => forum._emit('categories.loadMore', {
                    cid: this.id,
                    after: idx,
                    direction: 1
                }).then((results) => {
                    if (!results.topics || !results.topics.length) {
                        return resolve(this);
                    }
                    idx = results.nextStart;
                    return utils.iterate(results.topics, each)
                        .then(iterate).catch(reject);
                }).catch(reject);
                iterate();
            });
        }

        /**
         * description
         *
         */
        getRecentTopics(eachTopic) {
            const payload = {
                cid: this.id,
                after: 0,
                direction: 1
            };
            const each = onEachTopic(eachTopic);
            return forum._emit('categories.loadMore', payload)
                .then((results) => utils.iterate(results.topics, each))
                .then(() => this);
        }

        _categoryAction(action) {
            const payload = {
                cid: this.id
            };
            return forum._emit(action, payload)
                .then(() => this);
        }

        /**
         * description
         *
         */
        watch() {
            return this._categoryAction('categories.watch');
        }

        /**
         * description
         *
         */
        unwatch() {
            return this._categoryAction('categories.ignore');
        }

        /**
         * description
         *
         */
        mute() {
            return Promise.resolve(this);
        }

        /**
         * description
         *
         */
        unmute() {
            return Promise.resolve(this);
        }

        /**
         * description
         *
         */
        static get(categoryId) {
            return forum.fetchObject('categories.getCategory', categoryId, Category.parse);
        }

        /**
         * description
         *
         */
        static parse(payload) {
            return new Category(payload);
        }
    }
    return Category;
};
