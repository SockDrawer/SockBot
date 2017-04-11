'use strict';
/**
 * NodeBB provider module Topic class
 * @module sockbot.providers.nodebb.Topic
 * @author Accalia
 * @license MIT
 */
const utils = require('../../lib/utils');

/**
 * Create a Topic class and bind it to a forum instance
 *
 * @param {Provider} forum A forum instance to bind to constructed Topic class
 * @returns {User} A Topic class bound to the provided `forum` instance
 */
exports.bindTopic = function bindTopic(forum) {
    /**
     * Topic Class
     *
     * Represends a forum topic
     *
     * @public
     *
     */
    class Topic {
        /**
         * Construct a topic object from a provided payload.
         *
         * This constructor is intended for private use only, if you need top construct a topic from payload data use
         * `Topic.parse()` instead.
         *
         * @public
         * @class
         *
         * @param {*} payload Payload to construct the User object out of
         */
        constructor(payload) {
            payload = utils.parseJSON(payload);
            const values = {
                authorId: payload.uid,
                title: payload.title,
                url: payload.slug,
                posted: new Date(payload.timestamp),
                lastPosted: new Date(payload.lastposttime),
                id: payload.tid,
                mainPostId: payload.mainPid,
                postCount: payload.postcount,
                categoryId: payload.cid
            };
            utils.mapSet(this, values);
        }

        /**
         * Forum specific ID for topic category
         *
         * @public
         *
         * @type {!number}
         */
        get categoryId() {
            return utils.mapGet(this, 'categoryId');
        }
        
        /**
         * Forum specific ID for topic author
         *
         * @public
         *
         * @type {!number}
         */
        get authorId() {
            return utils.mapGet(this, 'authorId');
        }

        /**
         * Topic title
         *
         * @public
         *
         * @type {!string}
         */
        get title() {
            return utils.mapGet(this, 'title');
        }

        /**
         * DateTime that the topic was created
         *
         * @public
         *
         * @type {!Date}
         */
        get posted() {
            return utils.mapGet(this, 'posted');
        }

        /**
         * DateTime that the topic was last replied to
         *
         * @public
         *
         * @type {!Date}
         */
        get lastPosted() {
            return utils.mapGet(this, 'lastPosted');
        }

        /**
         * Forum Specific Topic Id
         *
         * @public
         *
         * @type {!number}
         */
        get id() {
            return utils.mapGet(this, 'id');
        }

        /**
         * Forum id of the opening post
         *
         * @public
         *
         * @type {!number}
         */
        get mainPostId() {
            return utils.mapGet(this, 'mainPostId');
        }

        /**
         * Count of posts in topic
         *
         * @public
         *
         * @type {number}
         */
        get postCount() {
            return utils.mapGet(this, 'postCount');
        }

        /**
         * Retrieve the web URL for the topic
         *
         * @public
         *
         * @returns {Promise<string>} Resolves to the web URL for this topic
         *
         * @promise
         * @fulfill {string} The Web URL for this topic
         * @reject {Error} An Error that occured while retrieving the post URL
         */
        url() {
            return Promise.resolve(`${forum.url}/${utils.mapGet(this, 'url')}`);
        }

        /**
         * Reply to this topic with the given content
         *
         * @public
         *
         * @param {string} content Post Content
         * @returns {Promise<Post>} Resolves to the newly created Post
         *
         * @promise
         * @fulfill {Post} The newly created Post
         * @reject {Error} An Error that occured while posting
         */
        reply(content) {
            const payload = {
                tid: this.id,
                content: content
            };
            return forum._emitWithRetry(10000, 'posts.reply', payload)
                .then((result) => forum.Post.parse(result));
        }

        /**
         * Proccess Post
         *
         * @typedef {PostProcessor}
         * @function
         *
         * @param {Post} post Post to process
         * @param {User} user User who posted `post`
         * @param {Topic} topic Topic `post` is posted to
         * @returns {Promise} A promise that fulfills when processing is complete
         */

        /**
         * Apply a Promised based function to retrieved post data
         *
         * @private
         *
         * @param {string} data Post Content
         * @param {PostProcessor} eachPost A function to process each post
         * @returns {Promise} Resolves on completion
         *
         * @promise
         * @reject {Error} An Error that occured while posting
         */
        _forEachPost(data, eachPost) {
            const post = forum.Post.parse(data);
            const user = forum.User.parse(data.user);
            return eachPost(post, user, this);
        }

        /**
         * Retrieve all posts from this topic, passing each off to a provided iterator function.
         *
         * @public
         *
         * @param {PostProcessor} eachPost A function to process retrieved posts.
         * @returns {Promise<Topic>} Resolves to self on completion
         *
         * @promise
         * @fulfill {Topic} Source Topic
         * @reject {Error} An Error that occured while posting
         */
        getAllPosts(eachPost) {
            return new Promise((resolve, reject) => {
                let idx = 0;
                const iterate = () => forum._emit('topics.loadMore', {
                    tid: this.id,
                    after: idx,
                    direction: 1
                }).then((results) => {
                    if (!results.posts || !results.posts.length) {
                        return resolve(this);
                    }
                    idx += results.posts.length;
                    return utils.iterate(results.posts, (data) => this._forEachPost(data, eachPost))
                        .then(iterate).catch(reject);
                }).catch((err) => reject(err));
                iterate();
            });
        }

        /**
         * Retrieve most posts from this topic, passing each off to a provided iterator function.
         *
         * @public
         *
         * @param {PostProcessor} eachPost A function to process retrieved posts.
         * @returns {Promise<Topic>} Resolves to self on completion
         *
         * @promise
         * @fulfill {Topic} Source Topic
         * @reject {Error} An Error that occured while posting
         */
        getLatestPosts(eachPost) {
            return forum._emit('topics.loadMore', {
                tid: this.id,
                after: this.postCount,
                direction: -1
            }).then((results) => utils.iterate(results.posts, (data) => this._forEachPost(data, eachPost)));
        }

        /**
         * Mark the topic read up to a point
         *
         * @public
         *
         * @param {number} [postNumber] Last read post. Omit to mark the entire topic read
         * @returns {Promise<Topic>} Resolves to self on completion
         *
         * @promise
         * @fulfill {Topic} Source Topic
         * @reject {Error} An Error that occured while posting
         */
        markRead(postNumber) {
            if (postNumber) {
                const payload = {
                    tid: this.id,
                    index: postNumber
                };
                return forum._emit('topics.bookmark', payload)
                    .then(() => this);
            }
            return forum._emit('topics.markAsRead', [this.id])
                .then(() => this);
        }

        /**
         * Watch the topic for new replies
         *
         * @public
         *
         * @returns {Promise<Topic>} Resolves to self on completion
         *
         * @promise
         * @fulfill {Topic} Source Topic
         * @reject {Error} An Error that occured while posting
         */
        watch() {
            return forum._emit('topics.follow', this.id)
                .then(() => this);
        }

        /**
         * Stop watching the tipic for new replies
         *
         * @public
         *
         * @returns {Promise<Topic>} Resolves to self on completion
         *
         * @promise
         * @fulfill {Topic} Source Topic
         * @reject {Error} An Error that occured while posting
         */
        unwatch() {
            return forum._emit('topics.toggleFollow', this.id)
                .then((following) => {
                    if (following) {
                        return forum._emit('topics.toggleFollow', this.id);
                    }
                    return Promise.resolve();
                })
                .then(() => this);
        }

        /**
         * Mute the topic to suppress notifications
         *
         * @public
         *
         * @returns {Promise<Topic>} Resolves to self on completion
         *
         * @promise
         * @fulfill {Topic} Source Topic
         * @reject {Error} An Error that occured while posting
         */
        mute() {
            return Promise.resolve(this);
        }

        /**
         * Unmute the topic, allowing notifications to be generated again.
         *
         * @public
         *
         * @returns {Promise<Topic>} Resolves to self on completion
         *
         * @promise
         * @fulfill {Topic} Source Topic
         * @reject {Error} An Error that occured while posting
         */
        unmute() {
            return Promise.resolve(this);
        }
        
        /**
         * Locks the topic. Will reject if you're not a moderator.
         *
         * @public
         *
         * @returns {Promise<Topic>} Resolves to self on completion
         *
         * @promise
         * @fulfill {Topic} Source Topic
         * @reject {Error} An Error that occured while posting
         */
        lock() {
            return forum._emit('topics.lock', {
                tids: [this.id],
                cid: this.categoryId
            })
            .then(() => this);
        }
        
        /**
         * Unlocks the topic. Will reject if you're not a moderator.
         *
         * @public
         *
         * @returns {Promise<Topic>} Resolves to self on completion
         *
         * @promise
         * @fulfill {Topic} Source Topic
         * @reject {Error} An Error that occured while posting
         */
        unlock() {
            return forum._emit('topics.unlock', {
                tids: [this.id],
                cid: this.categoryId
            })
            .then(() => this);
        }

        /**
         * Retrieve a topic by topic id
         *
         * @static
         * @public
         *
         * @param {!number} topicId Id of topic to retrieve
         * @returns {Promise<Topic>} Retrieved topic
         *
         * @promise
         * @fulfill {Topic} Retrieved Topic
         * @reject {Error} An Error that occured while posting
         */
        static get(topicId) {
            return forum._emit('topics.getTopic', topicId)
                .then((topic) => Topic.parse(topic));
        }

        /**
         * Parse a topic from retrieved data
         *
         * @public
         *
         * @param {*} payload Payload to parse into a topic
         * @returns {Topic} Parsed topic
         */
        static parse(payload) {
            if (!payload) {
                throw new Error('E_TOPIC_NOT_FOUND');
            }
            return new Topic(payload);
        }

        /**
         * @typedef {TopicExtended}
         * @prop {Topic} topic Topic data
         * @prop {User} user User data
         * @prop {Category} category Category data
         */

        /**
         * Parse a topic with embedded user and category information into respective objects
         *
         * @public
         *
         * @param {*} data Data to parse into a topic
         * @returns {Promise<TopicExtended>} Parsed Results
         *
         * @promise
         * @fulfill {TopicExtended} Parsed topic data
         */
        static parseExtended(data) {
            const topic = forum.Topic.parse(data);
            const user = forum.User.parse(data.user);
            const category = forum.Category.parse(data.category);
            return Promise.resolve({
                topic: topic,
                user: user,
                category: category
            });
        }

        /**
         * Proccess a Topic
         *
         * @typedef {TopicProcessor}
         * @function
         *
         * @param {Topic} topic Topic to process
         * @param {User} user User who started `topic`
         * @param {Category} category Category `topic` is contained in
         * @returns {Promise} A promise that fulfills when processing is complete
         */

        /**
         * Retrieve, parse, and handle many topics
         *
         * @private
         *
         * @param {string} room The type of topic list to retrieve
         * @param {object} query Additional query parameters to filter list on
         * @param {TopicProcessor} eachTopic a function to process each retrieved topic
         * @returns {Promise} A promise that resolves when processing is complete
         */
        static _getMany(room, query, eachTopic) {
            return new Promise((resolve, reject) => {
                query.after = 0;
                const iterate = () => forum._emit(room, utils.cloneData(query)).then((results) => {
                    if (!results.topics || !results.topics.length) {
                        return resolve(this);
                    }
                    query.after += results.topics.length;
                    const each = (data) => Topic.parseExtended(data)
                        .then((parsed) => eachTopic(parsed.topic, parsed.user, parsed.category));
                    return utils.iterate(results.topics, each)
                        .then(iterate).catch(reject);
                }).catch(reject);
                iterate();
            });
        }

        /**
         * Get All Unread Topics
         *
         * @public
         *
         * @param {TopicProcessor} eachTopic A function to process each retrieved topic
         * @returns {Promise} A promise that resolves when all topics have been processed
         */
        static getUnreadTopics(eachTopic) {
            return Topic._getMany('topics.loadMoreUnreadTopics', {}, eachTopic);
        }

        /**
         * Get All Topics in order of most recent activity
         *
         * @public
         *
         * @param {TopicProcessor} eachTopic A function to process each retrieved topic
         * @returns {Promise} A promise that resolves when all topics have been processed
         */
        static getRecentTopics(eachTopic) {
            return Topic._getMany('topics.loadMoreFromSet', {
                set: 'topics:recent'
            }, eachTopic);
        }
    }
    return Topic;
};
