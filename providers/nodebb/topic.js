'use strict';
const utils = require('../../lib/utils');

exports.bindTopic = function bindTopic(forum) {
    class Topic {
        /**
         * Construct a topic object from a provided payload
         *
         * @class
         *
         * @param {*} payload Serilaized topic representation retrieved from forum
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
                postCount: payload.postcount
            };
            utils.mapSet(this, values);
        }

        /**
         * Forum specific ID for topic author
         *
         * @type {*}
         */
        get authorId() {
            return utils.mapGet(this, 'authorId');
        }

        /**
         * Topic title
         *
         * @type {string}
         */
        get title() {
            return utils.mapGet(this, 'title');
        }

        /**
         * DateTime that the topic was created
         *
         * @type {Date}
         */
        get posted() {
            return utils.mapGet(this, 'posted');
        }

        /**
         * DateTime that the topic was last replied to
         *
         * @type {Date}
         */
        get lastPosted() {
            return utils.mapGet(this, 'lastPosted');
        }

        /**
         * Forum Specific Topic Id
         *
         * @type {*}
         */
        get id() {
            return utils.mapGet(this, 'id');
        }

        /**
         * Forum id of the opening post
         *
         * @type {*}
         */
        get mainPostId() {
            return utils.mapGet(this, 'mainPostId');
        }

        /**
         * Count of posts in topic
         *
         * @type {number}
         */
        get postCount() {
            return utils.mapGet(this, 'postCount');
        }

        /**
         * Retrieve the web URL for the topic
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
            return forum._emit('posts.reply', payload)
                .then((result) => forum.Post.parse(result));
        }

        _forEachPost(data, eachPost) {
            const post = forum.Post.parse(data);
            const user = forum.User.parse(data.user);
            return eachPost(post, user, this);
        }

        /**
         * Retrieve all posts from this topic, passing each off to a provided iterator function.
         *
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
                }).catch((e) => reject(e));
                iterate();
            });
        }

        /**
         * description
         *
         */
        getLatestPosts(eachPost) {
            return forum._emit('topics.loadMore', {
                tid: this.id,
                after: this.postCount,
                direction: -1
            }).then((results) => utils.iterate(results.posts, (data) => this._forEachPost(data, eachPost)));
        }

        /**
         * description
         *
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
         * description
         *
         */
        watch() {
            return forum._emit('topics.follow', this.id)
                .then(() => this);
        }

        /**
         * description
         *
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
        static get(topicId) {
            return forum._emit('topics.getTopic', topicId)
                .then((topic) => Topic.parse(topic));
        }

        /**
         * description
         *
         */
        static parse(payload) {
            return new Topic(payload);
        }

        static parseExtended(data) {
            const topic = forum.Topic.parse(data);
            const user = forum.User.parse(data.user);
            const category = forum.Category.parse(data.category);
            return Promise.resolve([topic, user, category]);
        }

        static _getMany(room, query, eachTopic) {
            return new Promise((resolve, reject) => {
                query.after = 0;
                const iterate = () => forum._emit(room, utils.cloneData(query)).then((results) => {
                    if (!results.topics || !results.topics.length) {
                        return resolve(this);
                    }
                    query.after += results.topics.length;
                    const each = (data) => Topic.parseExtended(data)
                        .then((parsed) => eachTopic(parsed[0], parsed[1], parsed[2]));
                    return utils.iterate(results.topics, each)
                        .then(iterate).catch(reject);
                }).catch(reject);
                iterate();
            });
        }

        static getUnreadTopics(eachTopic) {
            return Topic._getMany('topics.loadMoreUnreadTopics', {}, eachTopic);
        }

        static getRecentTopics(eachTopic) {
            return Topic._getMany('topics.loadMoreFromSet', {
                set: 'topics:recent'
            }, eachTopic);
        }
    }
    return Topic;
};
