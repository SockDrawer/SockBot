'use strict';

const utils = require('../../lib/utils');

exports.bindChat = function bindChat(forum) {
    class Message {
        constructor(payload) {
            payload = utils.parseJSON(payload);
            const values = {
                markup: payload.content,
                content: utils.htmlToRaw(payload.content),
                id: payload.messageId,
                room: payload.roomId,
                from: forum.User.parse(payload.fromUser),
                sent: new Date(payload.timestamp),
                self: payload.self === 0
            };
            utils.mapSet(this, values);
        }
        get id() {
            return utils.mapGet(this, 'id');
        }
        get room() {
            return utils.mapGet(this, 'room');
        }
        get from() {
            return utils.mapGet(this, 'from');
        }
        get self() {
            return utils.mapGet(this, 'self');
        }
        get content() {
            return utils.mapGet(this, 'content');
        }
        get sent() {
            return utils.mapGet(this, 'sent');
        }
        markup() {
            return Promise.resolve(utils.mapGet(this, 'markup'));
        }
        reply(content) {
            return forum._emit('modules.chats.send', {
                roomId: this.room,
                message: content
            });
        }
        static parse(payload) {
            return new Message(payload);
        }
    }
    class ChatRoom {
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
        get id() {
            return utils.mapGet(this, 'id');
        }
        get name() {
            return utils.mapGet(this, 'name');
        }
        get users() {
            return utils.mapGet(this, 'users').map((user) => forum.User.parse(user));
        }
        get participants() {
            return utils.mapGet(this, 'users').length;
        }
        get owner() {
            const ownerId = utils.mapGet(this, 'owner');
            const owner = utils.mapGet(this, 'users').filter((user) => user.uid === ownerId)[0];
            return forum.User.parse(owner);
        }
        url() {
            return Promise.resolve(`${forum.url}/chats/${this.id}`);
        }
        send(content) {
            return forum._emit('modules.chats.send', {
                roomId: this.id,
                message: content
            });
        }
        addUsers(users) {
            if (!Array.isArray(users)) {
                users = [users];
            }
            return Promise.all(
                users.map((user) => forum._emit('modules.chats.addUserToRoom', {
                    roomId: this.id,
                    username: user.username
                })));
        }
        removeUsers(users) {
            if (!Array.isArray(users)) {
                users = [users];
            }
            return Promise.all(
                users.map((user) => forum._emit('modules.chats.removeUserFromRoom', {
                    roomId: this.id,
                    username: user.username
                })));
        }
        leave() {
            return forum._emit('modules.chats.leave', this.id);
        }
        rename(newName) {
            return forum._emit('modules.chats.renameRoom', {
                roomId: this.id,
                newName: newName
            });
        }
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
        static activate() {
            forum.socket.on('event:chats.receive', handleChat);
        }
        static deactivate() {
            forum.socket.off('event:chats.receive', handleChat);
        }
        static get(roomId) {
            return forum._emit('module.chats.loadRoom', {
                roomId: roomId
            }).then((data) => ChatRoom.parse(data));
        }
        static parse(content) {
            return new ChatRoom(content);
        }
    }
    ChatRoom.Message = Message;

    function handleChat(payload) {
        if (!payload.message) {
            return;
        }
        const message = ChatRoom.Message.parse(payload.message);
        forum.Commands.get({
            post: -1,
            topic: -1,
            user: message.user.id,
            room: message.room
        }, message.content, (content) => message.reply(content));
        forum.emit('chatMessage', message);
    }
    return ChatRoom;
};
