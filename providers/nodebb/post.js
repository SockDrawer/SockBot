'use strict';
/**
 * NodeBB provider module User class
 * @module sockbot.providers.nodebb.User
 * @author Accalia
 * @license MIT
 */

const utils = require('../../lib/utils');

/**
 * Create a Post class and bind it to a forum instance
 *
 * @param {Provider} forum A forum instance to bind to constructed Post class
 * @returns {User} A Post class bound to the provided `forum` instance
 */
exports.bindPost = function bindPost(forum) {
    /**
     * Post Class
     *
     * Represents a forum post
     *
     * @public
     */
    class Post {
        /**
         * Construct a Post object from payload
         *
         * This constructor is intended to be private use only, if you need to construct a post from payload data use
         * `Post.parse()` instead
         *
         * @public
         * @class
         *
         * @param {*} payload Payload to construct the Post object out of
         */
        constructor(payload) {
            payload = utils.parseJSON(payload);
            const values = {
                authorId: payload.uid,
                content: payload.content,
                posted: new Date(payload.timestamp),
                id: payload.pid,
                topicId: payload.tid
            };
            utils.mapSet(this, values);
        }

        /**
         * ID of the post author
         *
         * @public
         *
         * @type {!number}
         */
        get authorId() {
            return utils.mapGet(this, 'authorId');
        }

        /**
         * Raw content of the post, before any HTML transformation has been applied
         *
         * @public
         *
         * @type {string}
         */
        get content() {
            return utils.mapGet(this, 'content');
        }

        /**
         * Retrieve the HTML representation of the raw content of the post
         *
         * @public
         *
         * @returns {Promise<string>} Resolves to the HTML markup for the post
         *
         * @promise
         * @fulfill {string} The HTML markup for this post
         * @reject {Error} An Error that occured while deleting
         */
        markup() {
            return Post.preview(this.content);
        }

        /**
         * DateTime that the post was posted
         *
         * @public
         *
         * @type {Date}
         */
        get posted() {
            return utils.mapGet(this, 'posted');
        }

        /**
         * ID of the post
         *
         * @public
         *
         * @type {number}
         */
        get id() {
            return utils.mapGet(this, 'id');
        }

        /**
         * ID of the topic that contains this post
         *
         * @public
         *
         * @type {number}
         */
        get topicId() {
            return utils.mapGet(this, 'topicId');
        }

        /**
         * Retrieve the direct URL for this post
         *
         * @public
         *
         * @returns {Promise<string>} Resolves to the web URL for this post
         *
         * @promise
         * @fulfill {string} The web URL for this post
         * @reject {Error} An Error that occured while retreiving post URL
         */
        url() {
            return new Promise((resolve) => {
                resolve(forum.Format.urlForPost(this.id));
            });
        }

        /**
         * Reply to this post with the given content
         *
         * @public
         *
         * @param {string} content Post content
         * @returns {Promise<Post>} Resolves to the newly created Post
         *
         * @promise
         * @fulfill {Post} The newly created Post
         * @reject {Error} An Error that occured while posting
         */
        reply(content) {
            return Post.reply(this.topicId, this.id, content);
        }

        /**
         * Post a reply to a post with the given content
         *
         * @public
         * @static
         *
         * @param {string} topicId Topic Id to reply to
         * @param {string} postId Post Id to reply to
         * @param {string} content Post content
         * @returns {Promise<Post>} Resolves to the newly created Post
         *
         * @promise
         * @fulfill {Post} The newly created Post
         * @reject {Error} An Error that occured while posting
         */
        static reply(topicId, postId, content) {
            return forum._emitWithRetry(10000, 'posts.reply', {
                tid: topicId,
                content: content,
                toPid: postId,
                lock: false
            }).then((result) => Post.parse(result));
        }

        /**
         * Edit this post to contain new content
         *
         * @public
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
                .then((composer) => forum._emitWithRetry(10000, 'posts.edit', {
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
         * @public
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
                newContent = `${newContent}\n\n###### ${reason}`;
            }
            return forum._emit('plugins.composer.push', this.id)
                .then((composer) => forum._emitWithRetry(10000, 'posts.edit', {
                    pid: composer.pid,
                    content: `${composer.body}\n\n---\n\n${newContent}`,
                    title: composer.title,
                    tags: composer.tags
                }))
                .then((result) => Post.parse(result));
        }

        /**
         * Take action on a post
         *
         * @private
         *
         * @param {string} action Action Event to emit
         * @returns {Promise<Post>} Resolves to self on completion
         *
         * @promise
         * @fulfill Post The post upon which an action has been made
         * @reject {Error} An Error that occured while deleting
         */
        _postAction(action) {
            return forum._emit(action, {
                pid: this.id,
                tid: this.topicId
            }).then(() => this);
        }

        /**
         * Delete this post
         *
         * @public
         *
         * @returns {Promise<Post>} Resolves to the deleted post
         *
         * @promise
         * @fulfill {Post} The deleted Post
         * @reject {Error} An Error that occured while deleting
         */
        delete() {
            return this._postAction('posts.delete');
        }

        /**
         * Undelete this post
         *
         * @public
         *
         * @returns {Promise<Post>} Resolves to the undeleted post
         *
         * @promise
         * @fulfill {Post} The undeleted Post
         * @reject {Error} An Error that occured while deleting
         */
        undelete() {
            return this._postAction('posts.restore');
        }

        /**
         * Take action on a post within a room
         *
         * @private
         *
         * @param {string} action Action Event to emit
         * @returns {Promise<Post>} Resolves to self on completion
         *
         * @promise
         * @fulfill Post The post upon which an action has been made
         * @reject {Error} An Error that occured while deleting
         */
        _roomAction(action) {
            return forum._emit(action, {
                pid: this.id,
                'room_id': `topic_${this.topicId}`
            }).then(() => this);
        }

        /**
         * Upvote this post
         *
         * @public
         *
         * @returns {Promise<Post>} Resolves to the upvoted post
         *
         * @promise
         * @fulfill {Post} The upvoted Post
         * @reject {Error} An Error that occured while upvoting
         */
        upvote() {
            return this._roomAction('posts.upvote');
        }

        /**
         * Downvote this post
         *
         * @public
         *
         * @returns {Promise<Post>} Resolves to the downvoted post
         *
         * @promise
         * @fulfill {Post} The downvoted Post
         * @reject {Error} An Error that occured while downvoting
         */
        downvote() {
            return this._roomAction('posts.downvote');
        }

        /**
         * Unvote this post
         *
         * @public
         *
         * @returns {Promise<Post>} Resolves to the unvoted post
         *
         * @promise
         * @fulfill {Post} The unvoted Post
         * @reject {Error} An Error that occured while downvoting
         */
        unvote() {
            return this._roomAction('posts.unvote');
        }

        /**
         * Bookmark this post
         *
         * @public
         *
         * @returns {Promise<Post>} Resolves to the bookmarked post
         *
         * @promise
         * @fulfill {Post} The bookmarked post
         * @reject {Error} An Error that occured while bookmarking
         */
        bookmark() {
            return this._roomAction('posts.favorite');
        }

        /**
         * Remove a bookmark from this post
         *
         * @public
         *
         * @returns {Promise<Post>} Resolves to the unbookmarked post
         *
         * @promise
         * @fulfill {Post} The unbookmarked post
         * @reject {Error} An Error that occured while unbookmarking
         */
        unbookmark() {
            return this._roomAction('posts.unfavorite');
        }

        /**
         * Retrieve a post identified by postId
         *
         * @public
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
            return forum.fetchObject('posts.getPost', postId, Post.parse);
        }

        /**
         * Construct a post object from a previously retrieved payload
         *
         * @public
         * @static
         *
         * @param {*} payload Serialized post representation retrieved from forum
         * @returns {Post} the deserialized Post object
         */
        static parse(payload) {
            if (!payload) {
                throw new Error('E_POST_NOT_FOUND');
            }
            return new Post(payload);
        }

        /**
         * Render the content to HTML as it would be rendered for a post
         *
         * @public
         * @static
         *
         * @param {string} content Content to render HTML PReview for
         * @returns {Promise<String>} Resolves to the rendered HTML
         *
         * @promise
         * @fulfill {string} Rendered HTML for `content`
         * @reject {Error} Any error that occurred rendering HTML for `content`
         *
         */
        static preview(content) {
            return forum._emit('plugins.composer.renderPreview', content);
        }
    }
    return Post;
};
