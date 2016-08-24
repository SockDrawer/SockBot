'use strict';
/**
 * NodeBB provider module Category class
 * @module sockbot.providers.nodebb.Category
 * @author Accalia
 * @license MIT
 */
const utils = require('../../lib/utils');

/**
 * Create a Category class and bind it to a forum instance
 *
 * @param {Provider} forum A forum instance to bind to constructed Category class
 * @returns {Category} A Category class bound to the provided `forum` instance
 */
exports.bindCategory = function bindCategory(forum) {
    /**
     * Topic Processor
     *
     * @typedef {TopicProcesspr}
     * @function
     *
     * @param {Topic} topic Topic to process
     * @param {User} user Topic Opening User
     * @param {Category} category The category `topic` belongs to
     * @returns {Promise} Resolves on completion
     */

    /**
     * Create a function to process topic data using a Topic Processor
     *
     * @private
     *
     * @param {TopicProcessor} eachTopic Function to process topics
     * @returns {function} Internal topic processing function
     */
    function onEachTopic(eachTopic) {
        return (data) => forum.Topic.parseExtended(data)
            .then((parsed) => eachTopic(parsed.topic, parsed.user, parsed.category));
    }

    /**
     * Category Class
     *
     * Represents a forum category.
     *
     * @public
     *
     */
    class Category {
        /**
         * Construct a category object from a provided payload.
         *
         * This constructor is intended for private use only, if you need top construct a category from payload data use
         * `Category.parse()` instead.
         *
         * @public
         * @class
         *
         * @param {*} payload Payload to construct the Category object out of
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
         * Category Id
         *
         * @public
         *
         * @type {number}
         */
        get id() {
            return utils.mapGet(this, 'id');
        }

        /**
         * Category Name
         *
         * @public
         *
         * @type {string}
         */
        get name() {
            return utils.mapGet(this, 'name');
        }

        /**
         * Category description
         *
         * @public
         *
         * @type {string}
         */
        get description() {
            return utils.mapGet(this, 'description');
        }

        /**
         * Parent Category Id
         *
         * @public
         *
         * @type {number}
         */
        get parentId() {
            return utils.mapGet(this, 'parentId');
        }

        /**
         * Number of topics in this category
         *
         * @public
         *
         * @type {number}
         */
        get topicCount() {
            return utils.mapGet(this, 'topicCount');
        }

        /**
         * Number of posts in this category
         *
         * @public
         *
         * @type {number}
         */
        get postCount() {
            return utils.mapGet(this, 'postCount');
        }

        /**
         * Number of "recent" posts in this category
         *
         * @public
         *
         * @type {number}
         */
        get recentPosts() {
            return utils.mapGet(this, 'recentPosts');
        }

        /**
         * The web URL of the category
         *
         * @public
         *
         * @returns {Promise<string>} Resolves to the web URL         *
         */
        url() {
            return Promise.resolve(`${forum.url}/category/${utils.mapGet(this, 'url')}`);
        }

        /**
         * Get all Topics in the category
         *
         * @public
         *
         * @param {TopicProcessor} eachTopic A function to process each topic
         * @returns {Promise} Resolves when all topics have been processed
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
         * Get all recently active Topics in the category
         *
         * @public
         *
         * @param {TopicProcessor} eachTopic A function to process each topic
         * @returns {Promise} Resolves when all topics have been processed
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

        /**
         * Apply an action to this category
         *
         * @private
         *
         * @param {string} action The action to perform
         * @returns {Promise<Category>} Resolves to delf on completion
         */
        _categoryAction(action) {
            const payload = {
                cid: this.id
            };
            return forum._emit(action, payload)
                .then(() => this);
        }
        
        /**
         * Add a topic to this category
         *
         * @public
         * 
         * @param {string} title The title of the topic
         * @param {string} body The body of the first post of the topic
         *
         * @returns {Promise<Category>} Resolves to self on completion
         */
        addTopic(title, body) {
            const payload = {
                category_id: this.id,
                title: title,
                content: body,
                tags: [],
                topic_thumb: ''
            };
            
            return forum._emit('topics.post', payload)
                .then(() => this);
        }

        /**
         * Watch this category for new activity
         *
         * @public
         *
         * @returns {Promise<Category>} Resolves to self on completion
         */
        watch() {
            return this._categoryAction('categories.watch');
        }

        /**
         * Stop watching this category for new activity
         *
         * @public
         *
         * @returns {Promise<Category>} Resolves to self on completion
         */
        unwatch() {
            return this._categoryAction('categories.ignore');
        }

        /**
         * Prevent this category from generating any notifications
         *
         * This is not currently supported by NodeBB and is a noop
         *
         * @public
         *
         * @returns {Promise<Category>} Resolves to self on completion
         */
        mute() {
            return Promise.resolve(this);
        }

        /**
         * Allow this category to generate notifications
         *
         * This is not currently supported by NodeBB and is a noop
         *
         * @public
         *
         * @returns {Promise<Category>} Resolves to self on completion
         */
        unmute() {
            return Promise.resolve(this);
        }

        /**
         * retrieve a category by Id
         *
         * @public
         *
         * @param {number} categoryId Id of the category to retrieve
         * @returns {Promise<Category>} Resolves to retrieved category
         */
        static get(categoryId) {
            return forum.fetchObject('categories.getCategory', categoryId, Category.parse);
        }


        /**
         * Parse a category from payload data
         *
         * @public
         *
         * @param {*} payload Data to parse as category
         * @returns {Category} Parsed category
         *
         */
        static parse(payload) {
            if (!payload) {
                throw new Error('E_CATEGORY_NOT_FOUND');
            }
            return new Category(payload);
        }
    }
    return Category;
};
