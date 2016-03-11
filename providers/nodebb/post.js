'use strict';
const storage = new WeakMap();

function getValue(obj, key) {
    return (storage.get(obj) || {})[key];
}

class Post {
    /**
     * Construct a post object from a previously retrieved payload
     *
     * @constructor
     *
     * @param {*} payload Serialized post representation retrieved from forum
     *
     * @returns {Post} the deserialized Post object
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
     * @returns {Promise<string>}
     *
     * @promise
     * @fulfill {string} The web URL for this post
     * @reject {Error} An Error that occured while retreiving post URL
     */
    url() {
        throw new Error('[[E-NOT-IMPLEMENTED-YET]]');
    }

    /**
     * Reply to this post with the given content
     *
     * @param {string} content Post content
     *
     * @returns {Promise<Post>}
     *
     * @promise
     * @fulfill {Post} The newly created Post
     * @reject {Error} An Error that occured while posting
     */
    reply(content) {
        throw new Error('[[E-NOT-IMPLEMENTED-YET]]');
    }
    /**
     * Edit this post to contain new content
     *
     * @param {string} newContent New post content
     * @param {string} [reason] Post edit reason
     *
     * @returns {Promise<Post>}
     *
     * @promise
     * @fulfill {Post} The edited Post
     * @reject {Error} An Error that occured while editing
     */
    edit(newContent, reason) {
        throw new Error('[[E-NOT-IMPLEMENTED-YET]]');
    }
    /**
     * Append new content to this post
     *
     * @param {string} newContent New post content
     * @param {string} [reason] Post edit reason
     *
     * @returns {Promise<Post>}
     *
     * @promise
     * @fulfill {Post} The edited Post
     * @reject {Error} An Error that occured while editing
     */
    append(newContent, reason) {
        throw new Error('[[E-NOT-IMPLEMENTED-YET]]');
    }
    /**
     * Delete this post
     *
     * @returns {Promise<Post>}
     *
     * @promise
     * @fulfill {Post} The deleted Post
     * @reject {Error} An Error that occured while deleting
     */
    delete() {
        throw new Error('[[E-NOT-IMPLEMENTED-YET]]');
    }
    /**
     * Upvote this post
     *
     * @returns {Promise<Post>}
     *
     * @promise
     * @fulfill {Post} The upvoted Post
     * @reject {Error} An Error that occured while upvoting
     */
    upvote() {
        throw new Error('[[E-NOT-IMPLEMENTED-YET]]');
    }
    /**
     * Downvote this post
     *
     * @returns {Promise<Post>}
     *
     * @promise
     * @fulfill {Post} The downvoted Post
     * @reject {Error} An Error that occured while downvoting
     */
    downvote() {
        throw new Error('[[E-NOT-IMPLEMENTED-YET]]');
    }
    /**
     * Bookmark this post
     *
     * @returns {Promise<Post>}
     *
     * @promise
     * @fulfill {Post} The bookmarked post
     * @reject {Error} An Error that occured while bookmarking
     */
    bookmark() {
        throw new Error('[[E-NOT-IMPLEMENTED-YET]]');
    }
    /**
     * Remove a bookmark from this post
     *
     * @returns {Promise<Post>}
     *
     * @promise
     * @fulfill {Post} The unbookmarked post
     * @reject {Error} An Error that occured while unbookmarking
     */
    unbookmark() {
        throw new Error('[[E-NOT-IMPLEMENTED-YET]]');
    }
    /**
     * Retrieve a post identified by postId
     *
     * @static
     *
     * @param {*} postId Forum specific post id to retrieve
     * @returns {Promise<Post>}
     *
     * @promise
     * @fulfill {Post} The retrieved Post
     * @reject {Error} An Error that occured retrieving the post
     */
    static get(postId) {
        throw new Error('[[E-NOT-IMPLEMENTED-YET]]');
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
exports.Post = Post;