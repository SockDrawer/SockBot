'use strict';
/**
 * NodeBB provider module User class
 * @module sockbot.providers.nodebb.User
 * @author Accalia
 * @license MIT
 */

const utils = require('../../lib/utils');
const debug = require('debug')('sockbot:provider:nodebb:user');

/**
 * Create a User class and bind it to a forum instance
 *
 * @param {Provider} forum A forum instance to bind to constructed User class
 * @returns {User} A User class bound to the provided `forum` instance
 */
exports.bindUser = function bindUser(forum) {
    /**
     * User Class
     *
     * Represents a forum user
     *
     * @public
     */
    class User {
        /**
         * Construct a User object from payload
         *
         * This constructor is intended to be private use only, if you need to construct a user from payload data use
         * `User.parse()` instead
         *
         * @public
         * @class
         *
         * @param {*} payload Payload to construct the User object out of
         */
        constructor(payload) {
            payload = utils.parseJSON(payload);
            const values = {
                username: payload.username,
                name: payload.fullname,
                email: payload.email,
                avatar: payload.picture,
                id: payload.uid,
                postCount: payload.postcount,
                topicCount: payload.topiccount,
                reputation: payload.reputation,
                lastPosted: new Date(payload.lastposttime),
                lastSeen: new Date(payload.lastonline)
            };
            utils.mapSet(this, values);
        }

        /**
         * Forum Specific User Id
         *
         * @public
         *
         * @type {!number}
         */
        get id() {
            return utils.mapGet(this, 'id');
        }

        /**
         * Descriptive name of the User
         *
         * @public
         *
         * @type {?string}
         */
        get name() {
            return utils.mapGet(this, 'name');
        }

        /**
         * Username of the User
         *
         * @public
         *
         * @type {!string}
         */
        get username() {
            return utils.mapGet(this, 'username');
        }

        /**
         * Email address of the User
         *
         * May be blank if active login does not have sufficient rights to read email address
         *
         * @public
         *
         * @type {?string}
         */
        get email() {
            return utils.mapGet(this, 'email');
        }

        /**
         * Link to avatar image for user
         *
         * @public
         *
         * @type {!string}
         */
        get avatar() {
            return utils.mapGet(this, 'avatar');
        }

        /**
         * Number of posts User has made at time of retrieval
         *
         * @public
         *
         * @type {!number}
         */
        get postCount() {
            return utils.mapGet(this, 'postCount');
        }

        /**
         * Number of topics User has created at time of retrieval
         *
         * @public
         *
         * @type {!number}
         */
        get topicCount() {
            return utils.mapGet(this, 'topicCount');
        }

        /**
         * User reputation at time of retrieval
         *
         * @public
         *
         * @type {!number}
         */
        get reputation() {
            return utils.mapGet(this, 'reputation');
        }

        /**
         * Datetime User last made a publically visible post
         *
         * @public
         *
         * @type {!Date}
         */
        get lastPosted() {
            return utils.mapGet(this, 'lastPosted');
        }

        /**
         * Datetime User was last seen online
         *
         * @public
         *
         * @type {!Date}
         */
        get lastSeen() {
            return utils.mapGet(this, 'lastSeen');
        }

        /**
         * Url to User profile
         *
         * @public
         *
         * @returns {Promise<string>} A promise that resolves to the desired URL
         *
         * @promise
         * @fulfill {string} The desired Url
         * @reject {Error} An Error that occured while determining URL
         */
        url() {
            return Promise.resolve(`${forum.url}/user/${this.username}`);
        }

        /**
         * Follow the User
         *
         * @public
         *
         * @returns {Promise<User>} Resolves on completion to followed User
         *
         * @promise
         * @fulfill {User} The followed User
         * @reject {Error} An Error that occured while processing
         */
        follow() {
            return forum._emit('user.follow', {
                uid: this.id
            }).then(() => this);
        }

        /**
         * Unfollow the User
         *
         * @public
         *
         * @returns {Promise<user>} Resolves to the unfollowed User
         *
         * @promise
         * @fulfill {User} The unfollowed User
         * @reject {Error} An Error that occured while processing
         */
        unfollow() {
            return forum._emit('user.unfollow', {
                uid: this.id
            }).then(() => this);
        }

        /**
         * Communicate privately with the user
         *
         * @public
         *
         * @param {string} message Message to communicate with the user
         * @param {string} [title] Optional: Title of the message to communicate
         * @returns {Promise} Resolve when communication has occured, rejects if attempt fails or is unsupported
         */
        whisper(message, title) {
            return forum.Chat.create(this.username, message, title);
        }

        /**
         * Get User by Id
         *
         * @static
         * @public
         *
         * @param {!number} userId ID of the user to retrieve
         * @returns {Promise<User>} Resolves to the retrieved User
         *
         * @promise
         * @fulfill {User} The retrieved User
         * @reject {Error} An Error that occured while processing
         *
         */
        static get(userId) {
            debug(`retrieving user by id: ${userId}`);
            return forum.fetchObject('user.getUserByUID', userId, User.parse);
        }

        /**
         * Get User by username
         *
         * @static
         * @public
         *
         * @param {!string} username Username of the user to retrieve
         * @returns {Promise<User>} Resolves to the retrieved User
         *
         * @promise
         * @fulfill {User} The retrieved User
         * @reject {Error} An Error that occured while processing
         *
         */
        static getByName(username) {
            debug(`retrieving user by login ${username}`);
            return forum.fetchObject('user.getUserByUsername', username, User.parse);
        }

        /**
         * Parse user from retrieved payload
         *
         * @static
         * @public
         *
         * @param {!*} payload Data to parse as a User object
         * @returns {Promise<User>} Resolves to the parsed User
         *
         * @promise
         * @fulfill {User} The parsed User
         * @reject {Error} An Error that occured while processing
         *
         */
        static parse(payload) {
            if (!payload) {
                throw new Error('E_USER_NOT_FOUND');
            }
            return new User(payload);
        }
    }
    return User;
};
