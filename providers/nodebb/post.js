'use strict';
const utils = require('./utils');

exports.bindPost = function bindPost(forum) {
    class Post {
        /**
         * Construct a post object from a previously retrieved payload
         *
         * @class
         *
         * @param {*} payload Serialized post representation retrieved from forum
         */
        constructor(payload) {
            payload = utils.parseJSON(payload);
            const values = {
                authorId: payload.uid,
                raw: payload.content,
                cleaned: `unclean: ${payload.content}`, //TODO: clean content
                posted: new Date(payload.timestamp),
                id: payload.pid,
                topicId: payload.tid
            };
            utils.mapSet(this, values);
        }

        /**
         * Forum specific ID for post author
         *
         * @type {*}
         */
        get authorId() {
            return utils.mapGet(this, 'authorId');
        }

        /**
         * Raw content of the post, before any HTML transformation has been applied
         *
         * @type {string}
         */
        get raw() {
            return utils.mapGet(this, 'raw');
        }

        /**
         * Cleaned content of the post, removing quotes and code blocks from the raw content.
         * Suitible for parsing for bots
         * of all ages.
         *
         * @type {string}
         */
        get cleaned() {
            return utils.mapGet(this, 'cleaned');
        }

        /**
         * DateTime that the post was posted
         *
         * @type {Date}
         */
        get posted() {
            return utils.mapGet(this, 'posted');
        }

        /**
         * Forum specific ID for post
         *
         * @type {*}
         */
        get id() {
            return utils.mapGet(this, 'id');
        }

        /**
         * Forum specific ID for topic that contains this post
         *
         * @type {*}
         */
        get topicId() {
            return utils.mapGet(this, 'topicId');
        }

        /**
         * Retrieve the direct URL for this post
         *
         * @returns {Promise<string>} Resolves to the web URL for this post
         *
         * @promise
         * @fulfill {string} The web URL for this post
         * @reject {Error} An Error that occured while retreiving post URL
         */
        url() {
            return Promise.all([
                forum.Topic.get(this.topicId).then((topic) => topic.url()),
                forum._emit('posts.getPidIndex', {
                    pid: this.id,
                    tid: this.topicId
                })
            ]).then((results) => `${results[0]}/${results[1]}`);
        }

        /**
         * Reply to this post with the given content
         *
         * @param {string} content Post content
         * @returns {Promise<Post>} Resolves to the newly created Post
         *
         * @promise
         * @fulfill {Post} The newly created Post
         * @reject {Error} An Error that occured while posting
         */
        reply(content) {
            return forum._emit('posts.reply', {
                tid: this.topicId,
                content: content,
                toPid: this.id,
                lock: false
            }, (result) => Post.parse(result));
        }

        /**
         * Edit this post to contain new content
         *
         * @param {string} newContent New post content
         * @param {string} [reason] Post edit reason
         *
         * @returns {Promise<Post>} Resolves to the edited Post
         *
         * @promise
         * @fulfill {Post} The edited Post
         * @reject {Error} An Error that occured while editing
         */
        edit(newContent, reason) {
            if (reason) {
                newContent = `${newContent}\n\n###### ${reason}`;
            }
            return forum._emit('plugins.composer.push', this.id)
                .then((composer) => forum._emit('posts.edit', {
                    pid: composer.pid,
                    content: newContent,
                    title: composer.title,
                    tags: composer.tags
                }))
                .then((result) => Post.parse(result));
        }

        /**
         * Append new content to this post
         *
         * @param {string} newContent New post content
         * @param {string} [reason] Post edit reason
         *
         * @returns {Promise<Post>} Resolves to the edited post
         *
         * @promise
         * @fulfill {Post} The edited Post
         * @reject {Error} An Error that occured while editing
         */
        append(newContent, reason) {
            if (reason) {
                newContent = `${newContent}\n\n<h6>${reason}</h6>`;
            }
            return forum._emit('plugins.composer.push', this.id)
                .then((composer) => forum._emit('posts.edit', {
                    pid: composer.pid,
                    content: `${composer.body}\n\n---\n\n${newContent}`,
                    title: composer.title,
                    tags: composer.tags
                }))
                .then((result) => Post.parse(result));
        }

        /**
         * Delete this post
         *
         * @returns {Promise<Post>} Resolves to the deleted post
         *
         * @promise
         * @fulfill {Post} The deleted Post
         * @reject {Error} An Error that occured while deleting
         */
        delete() {
            return forum._emit('posts.delete', {
                pid: this.id,
                tid: this.topicId
            }).then(() => this);
        }

        /**
         * Undelete this post
         *
         * @returns {Promise<Post>} Resolves to the undeleted post
         *
         * @promise
         * @fulfill {Post} The undeleted Post
         * @reject {Error} An Error that occured while deleting
         */
        undelete() {
            return forum._emit('posts.restore', {
                pid: this.id,
                tid: this.topicId
            }).then(() => this);
        }

        /**
         * Upvote this post
         *
         * @returns {Promise<Post>} Resolves to the upvoted post
         *
         * @promise
         * @fulfill {Post} The upvoted Post
         * @reject {Error} An Error that occured while upvoting
         */
        upvote() {
            return forum._emit('posts.upvote', {
                pid: this.id,
                'room_id': `topic_${this.topicId}`
            }).then(() => this);
        }

        /**
         * Downvote this post
         *
         * @returns {Promise<Post>} Resolves to the downvoted post
         *
         * @promise
         * @fulfill {Post} The downvoted Post
         * @reject {Error} An Error that occured while downvoting
         */
        downvote() {
            return forum._emit('posts.downvote', {
                pid: this.id,
                'room_id': `topic_${this.topicId}`
            }).then(() => this);
        }

        /**
         * Unvote this post
         *
         * @returns {Promise<Post>} Resolves to the unvoted post
         *
         * @promise
         * @fulfill {Post} The unvoted Post
         * @reject {Error} An Error that occured while downvoting
         */
        downvote() {
            return forum._emit('posts.unvote', {
                pid: this.id,
                'room_id': `topic_${this.topicId}`
            }).then(() => this);
        }

        /**
         * Bookmark this post
         *
         * @returns {Promise<Post>} Resolves to the bookmarked post
         *
         * @promise
         * @fulfill {Post} The bookmarked post
         * @reject {Error} An Error that occured while bookmarking
         */
        bookmark() {
            return forum._emit('posts.favorite', {
                pid: this.id,
                'room_id': `topic_${this.topicId}`
            }).then(() => this);
        }

        /**
         * Remove a bookmark from this post
         *
         * @returns {Promise<Post>} Resolves to the unbookmarked post
         *
         * @promise
         * @fulfill {Post} The unbookmarked post
         * @reject {Error} An Error that occured while unbookmarking
         */
        unbookmark() {
            return forum._emit('posts.unfavorite', {
                pid: this.id,
                'room_id': `topic_${this.topicId}`
            }).then(() => this);
        }

        /**
         * Retrieve a post identified by postId
         *
         * @static
         *
         * @param {*} postId Forum specific post id to retrieve
         * @returns {Promise<Post>} Resolves to the retrieved post
         *
         * @promise
         * @fulfill {Post} The retrieved Post
         * @reject {Error} An Error that occured retrieving the post
         */
        static get(postId) {
            return forum._emit('posts.getPost', postId)
                .then((result) => Post.parse(result));
        }

        /**
         * Construct a post object from a previously retrieved payload
         *
         * @static
         *
         * @param {*} payload Serialized post representation retrieved from forum
         * @returns {Post} the deserialized Post object
         */
        static parse(payload) {
            return new Post(payload);
        }
    }
    return Post;
};
