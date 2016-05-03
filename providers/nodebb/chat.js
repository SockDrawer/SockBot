'use strict';

const utils = require('../../lib/utils');

/**
 * Create a ChatRoom class and bind it to a forum instance
 *
 * @param {Provider} forum A forum instance to bind to constructed ChatRoom class
 * @returns {User} A ChatRoomPo class bound to the provided `forum` instance
 */
exports.bindChat = function bindChat(forum) {
    /**
     * Message Class
     *
     * Represents a message in a chatroom
     *
     * @public
     */
    class Message {
        /**
         * Construct a Message object from payload
         *
         * This constructor is intended to be private use only, if you need to construct a chat message from payload
         * data use `Message.parse()` instead
         *
         * @private
         * @class
         *
         * @param {*} payload Payload to construct the Message object out of
         */
        constructor(payload) {
            payload = utils.parseJSON(payload);
            const values = {
                markup: payload.content,
                content: utils.htmlToRaw(payload.content),
                id: payload.messageId,
                room: payload.roomId,
                from: forum.User.parse(payload.fromUser),
                sent: new Date(payload.timestamp),
                self: payload.self === 1
            };
            utils.mapSet(this, values);
        }

        /**
         * Chat message id
         *
         * @public
         *
         * @returns {number} Id of the chat message
         */
        get id() {
            return utils.mapGet(this, 'id');
        }

        /**
         * Id of the chatroom this message belongs to
         *
         * @public
         *
         * @returns {number} Id of the ChatRoom this message belongs to
         */
        get room() {
            return utils.mapGet(this, 'room');
        }

        /**
         * User who sent this message
         *
         * @public
         *
         * @returns {User} User who authored this chat message
         */
        get from() {
            return utils.mapGet(this, 'from');
        }

        /**
         * Identify if this message was created by current user
         *
         * @public
         *
         * @returns {boolean} True if message was sent by current user
         */
        get self() {
            return utils.mapGet(this, 'self');
        }

        /**
         * Text content of message
         *
         * @public
         *
         * @returns {string} Content of the message with formatting and quotes removed
         */
        get content() {
            return utils.mapGet(this, 'content');
        }

        /**
         * DateTime the message was sent
         *
         * @public
         *
         * @returns {Date} datetime the message was sent
         */
        get sent() {
            return utils.mapGet(this, 'sent');
        }

        /**
         * Message markup
         *
         * @public
         *
         * @returns {Promise<string>} Resolves to the HTML markup of the chat message
         */
        markup() {
            return Promise.resolve(utils.mapGet(this, 'markup'));
        }

        /**
         * Reply to the chat message
         *
         * @public
         *
         * @param {string} content Message to reply with
         * @returns {Promise} Resolves once message has been sent
         */
        reply(content) {
            return forum._emit('modules.chats.send', {
                roomId: this.room,
                message: content
            });
        }

        /**
         * Parse a Message from a given payload
         *
         * @public
         *
         * @param {string|object} payload Data to parse as a Message
         * @returns {Message} parsed Message
         */
        static parse(payload) {
            return new Message(payload);
        }
    }

    /**
     * ChatRoom Class
     *
     * Represents a chat room
     *
     * @public
     *
     */
    class ChatRoom {

        /**
         * Construct a ChatroomObject from payload
         *
         * This constructor is intended to be private use only, if you need to construct a chatroom from payload
         * data use `ChatRoom.parse()` instead
         *
         * @private
         * @class
         *
         * @param {*} payload Payload to construct the ChatRoom object out of
         */
        constructor(payload) {
            payload = utils.parseJSON(payload);
            const values = {
                id: payload.roomId,
                owner: payload.owner,
                name: payload.roomName,
                users: payload.users || []
            };
            utils.mapSet(this, values);
        }

        /**
         * Get the chatroom id
         *
         * @public
         *
         * @returns {number} Id of the chatroom
         *
         */
        get id() {
            return utils.mapGet(this, 'id');
        }

        /**
         * Get the chatroom name
         *
         * @public
         *
         * @returns {string} Name of the chatroom
         */
        get name() {
            return utils.mapGet(this, 'name');
        }

        /**
         * Get the users in the chatroom
         *
         * @public
         *
         * @returns {User[]} The users that were in teh chatroom when the room was retrieved
         */
        get users() {
            return utils.mapGet(this, 'users').map((user) => forum.User.parse(user));
        }

        /**
         * Get the number of users in the chatroom
         *
         * @public
         *
         * @returns {number} Number of users in the chatroom
         */
        get participants() {
            return utils.mapGet(this, 'users').length;
        }

        /**
         * Get the owner of the chatroom
         *
         * @public
         *
         * @returns {User} Owning user for the chatroom
         */
        get owner() {
            const ownerId = utils.mapGet(this, 'owner');
            const owner = utils.mapGet(this, 'users').filter((user) => user.uid === ownerId)[0];
            return forum.User.parse(owner);
        }

        /**
         * Retrieve the weblink for the Chatroom
         *
         * @public
         *
         * @returns {Promise<string>} Resolves to the URL web link to the chatroom
         */
        url() {
            return Promise.resolve(`${forum.url}/chats/${this.id}`);
        }

        /**
         * Send a message to the chatroom
         *
         * @public
         *
         * @param {string} content Message to send to the chatroom
         * @returns {Promise} Resolves when message has been sent
         */
        send(content) {
            return forum._emit('modules.chats.send', {
                roomId: this.id,
                message: content
            });
        }

        /**
         * Apply an operation to a list of users
         * 
         * @private
         * 
         * @param {string} action Action to apply
         * @param {User|User[]} users List of users to apply action to
         * @returns {Promise} resolves when action has been applied to all users
         */
        _applyToUsers(action, users) {
            if (!Array.isArray(users)) {
                users = [users];
            }
            return Promise.all(
                users.map((user) => forum._emit(action, {
                    roomId: this.id,
                    username: user.username
                })));
        }

        /**
         * Add a list of users to the chatroom
         *
         * @public
         *
         * @param {User|User[]} users User or Users to add to the chatroom
         * @returns {Promise} Resolves when all users have been added to the chatroom
         */
        addUsers(users) {
            return this._applyToUsers('modules.chats.addUserToRoom', users);
        }

        /**
         * Remove a list of users from the chatroom
         *
         * @public
         *
         * @param {User|User[]} users User or Users to remove from the chatroom
         * @returns {Promsie} Resos when users have been removed from the chatroom
         */
        removeUsers(users) {
            return this._applyToUsers('modules.chats.removeUserFromRoom', users);
        }

        /**
         * Leave the chatroom
         *
         * This will remove current user from the chat.
         *
         * @public
         *
         * @returns {Promise} Resolves when chatroom has been left
         */
        leave() {
            return forum._emit('modules.chats.leave', this.id);
        }

        /**
         * Rename the chat room
         *
         * @public
         *
         * @param {string} newName Name to set the chatroom to
         * @returns {Promise} Resolves when rename is complete
         */
        rename(newName) {
            return forum._emit('modules.chats.renameRoom', {
                roomId: this.id,
                newName: newName
            });
        }

        /**
         * Create a new chatroom, add a list of users to it and send a message.
         *
         * @public
         *
         * @param {User|User[]} users User or users to add to the chatroom
         * @param {string} message Message to send to the new chat room
         * @returns {Promise} Resolves once message has been sent
         */
        static create(users, message) {
            if (!Array.isArray(users)) {
                users = [users];
            }
            const rootUser = users.shift();
            const payload = {
                touid: rootUser.id
            };
            return forum._emit('modules.chats.newRoom', payload)
                .then((roomId) => ChatRoom.get(roomId))
                .then((chat) => chat.addUsers(users)
                    .then(() => chat.send(message)));
        }

        /**
         * Activate chat features. newly received chat messages will be processed
         *
         * @public
         */
        static activate() {
            forum.socket.on('event:chats.receive', handleChat);
        }

        /**
         * Deactivate the Chat features. This will stop new chat messages from being processed
         *
         * @public
         */
        static deactivate() {
            forum.socket.off('event:chats.receive', handleChat);
        }

        /**
         * Retrieve a ChatRoom by a given ID
         *
         * @public
         *
         * @param {number} roomId Id of the chatroom to retrieve
         * @returns {Promise<ChatRoom>} Resolves to the chatroom requested
         */
        static get(roomId) {
            return forum._emit('modules.chats.loadRoom', {
                roomId: roomId
            }).then((data) => ChatRoom.parse(data));
        }

        /**
         * Parse a Chatroom object from payload
         *
         * @public
         *
         * @param {string|object} payload ChatRoom Payload
         * @returns {ChatRoom} Parsed Chatroom
         */
        static parse(payload) {
            return new ChatRoom(payload);
        }
    }
    ChatRoom.Message = Message;

    /**
     * Handle Chat events from websocket
     *
     * @private
     *
     * @param {*} payload websocket event payload
     * @returns {Promise} resolves when processing has been completed for event
     */
    function handleChat(payload) {
        if (!payload.message) {
            return Promise.reject('Event payload did not include chat message');
        }
        const message = ChatRoom.Message.parse(payload.message);

        forum.emit('chatMessage', message);
        const ids = {
            post: -1,
            topic: -1,
            user: message.from.id,
            room: message.room
        };
        return forum.Commands.get(ids, message.content, (content) => message.reply(content))
            .then((command) => command.execute());
    }
    return ChatRoom;
};
