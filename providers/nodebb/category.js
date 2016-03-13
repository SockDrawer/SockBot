'use strict';
const utils = require('./utils');

/**
 * description
 */
exports.bindCategory = function bindCategory(forum) {
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
        get postCounts() {
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
            return Promise.resolve(`${forum.url}/${utils.mapGet(this, 'id')}`);
        }

        /**
         * description
         *
         */
        getAllTopics(eachTopic) {

        }

        /**
         * description
         *
         */
        getRecentTopics(eachTopic) {
            return forum._emit('categories.loadMore', {
                    cid: this.id,
                    after: 0,
                    direction: 1
                })
                .then((results) => utils.iterate(results.topics, (topic) => eachTopic(forum.Topic.parse(topic))))
                .then(() => this);
        }

        /**
         * description
         *
         */
        static get(categoryId) {
            return forum._emit('categories.getCategory', categoryId)
                .then((category) => Category.parse(category));
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
