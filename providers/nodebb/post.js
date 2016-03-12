'use strict';
const storage = new WeakMap();

function getValue(obj, key) {
    return (storage.get(obj) || {})[key];
}

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
                raw: payload.content,
                cleaned: `unclean: ${payload.content}`, //TODO: clean content
                posted: new Date(payload.timestamp),
                id: payload.pid,
                topicId: payload.tid
            };
            storage.set(this, values);
        }

        /**
         * authorId
         *
         * Forum specific ID for post author
         *
         * @type {*}
         */
        get authorId() {
            return getValue(this, 'authorId');
        }

        /**
         * Raw content of the post, before any HTML transformation has been applied
         *
         * @type {string}
         */
        get raw() {
            return getValue(this, 'raw');
        }

        /**
         * Cleaned content of the post, removing quotes and code blocks from the raw content. suitible for parsing for bots
         * of all ages.
         *
         * @type {string}
         */
        get cleaned() {
            return getValue(this, 'cleaned');
        }

        /**
         * DateTime that the post was posted
         *
         * @type {Date}
         */
        get posted() {
            return getValue(this, 'posted');
        }

        /**
         * Forum specific ID for post
         *
         * @type {*}
         */
        get id() {
            return getValue(this, 'id');
        }

        /**
         * Forum specific ID for topic that contains this post
         *
         * @type {*}
         */
        get topicId() {
            return getValue(this, 'topicId');
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
            return Promise.reject(new Error('[[E-NOT-IMPLEMENTED-YET]]'));
        }

        /**
         * Reply to this post with the given content
         *
         * @param {string} content Post content
         *
         * @returns {Promise<Post>} Resolves to the newly created Post
         *
         * @promise
         * @fulfill {Post} The newly created Post
         * @reject {Error} An Error that occured while posting
         */
        reply(content) {
            return new Promise((resolve, reject) => {
                forum.socket.emit('posts.reply', {
                    tid: this.topicId,
                    content: content,
                    toPid: this.id,
                    lock: false
                }, (e, result) => {
                    if (e) {
                        return reject(e);
                    } else {
                        return Post.parse(result);
                    }
                });
            });
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
            return Promise.reject(new Error('[[E-NOT-IMPLEMENTED-YET]]'));
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
            return Promise.reject(new Error('[[E-NOT-IMPLEMENTED-YET]]'));
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
            return Promise.reject(new Error('[[E-NOT-IMPLEMENTED-YET]]'));
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
            return Promise.reject(new Error('[[E-NOT-IMPLEMENTED-YET]]'));
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
            return Promise.reject(new Error('[[E-NOT-IMPLEMENTED-YET]]'));
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
            return Promise.reject(new Error('[[E-NOT-IMPLEMENTED-YET]]'));
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
            return Promise.reject(new Error('[[E-NOT-IMPLEMENTED-YET]]'));
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
            return Promise.reject(new Error('[[E-NOT-IMPLEMENTED-YET]]'));
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
            return new Promise((resolve, reject) => {
                forum.socket.emit('posts.getPost', postId, (e, result) => {
                    if (e) {
                        return reject(e);
                    }
                    resolve(Post.parse(result));
                });
            });
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
