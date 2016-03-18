'use strict';

const utils = require('./utils');

exports.bindCommands = function bindCommands(forum) {
    const handlers = {};
    class Command {
        constructor(definition, parent) {
            const values = {
                line: definition.line,
                command: definition.command,
                args: definition.args,
                mention: definition.mention,
                parent: parent,
                handler: handlers[definition.command] || defaultHandler,
                replyText: ''
            };
            utils.mapSet(this, values);
        }
        get line() {
            return utils.mapGet(this, 'line');
        }
        get command() {
            return utils.mapGet(this, 'command');
        }
        get mention() {
            return utils.mapGet(this, 'mention');
        }
        get args() {
            return utils.mapGet(this, 'args');
        }
        get parent() {
            return utils.mapGet(this, 'parent');
        }
        get replyText() {
            return utils.mapGet(this, 'replyText');
        }
        execute() {
            return utils.mapGet(this, 'handler')(this);
        }
        getPost() {
            return this.parent.getPost();
        }
        getTopic() {
            return this.parent.getTopic();
        }
        getUser() {
            return this.parent.getUser();
        }
        reply(content) {
            utils.mapSet(this, 'replyText', content);
        }
        static get(postId) {
            return forum.Post.get(postId).then(Command.parse);
        }
    }

    class Commands {
        constructor(notification, postBody) {
            const values = {
                notification: notification,
                postBody: postBody,
                commands: postBody.split('\n')
                    .map(parseLine)
                    .filter((definition) => definition)
                    .map((definition) => new Command(definition, this))
            };
            utils.mapSet(this, values);
        }
        get notification() {
            return utils.mapGet(this, 'notification');
        }
        get commands() {
            return utils.mapGet(this, 'commands');
        }
        getPost() {
            const item = utils.mapGet(this, 'post');
            if (item) {
                return Promise.resolve(item);
            }
            return forum.Post.get(this.notification.postId)
                .then((post) => {
                    utils.mapSet(this, 'post', post);
                    return post;
                });
        }
        getTopic() {
            const item = utils.mapGet(this, 'topic');
            if (item) {
                return Promise.resolve(item);
            }
            return forum.Topic.get(this.notification.topicId)
                .then((topic) => {
                    utils.mapSet(this, 'topic', topic);
                    return topic;
                });
        }
        getUser() {
            const item = utils.mapGet(this, 'user');
            if (item) {
                return Promise.resolve(item);
            }
            return forum.User.get(this.notification.userId)
                .then((user) => {
                    utils.mapSet(this, 'user', user);
                    return user;
                });
        }
        execute() {
            return Promise.all(this.commands.map((command) => command.execute))
                .then((commands) => onComplete(commands, this))
                .catch((reason) => onError(reason, this))
                .catch(() => forum.emit('logError', 'Command error occured and posting response failed.'))
                .then(() => this);
        }
        static get(notification) {
            return Promise.resolve()
                .then(() => {
                    if (notification.type === 'mention') {
                        return forum.Post.preview(notification.body);
                    }
                    return Promise.resolve(notification.body);
                })
                .then((postBody) => utils.htmlToRaw(postBody))
                .then((postBody) => new Commands(notification, postBody));
        }
    }

    function parseLine(line) {
        let args;
        if (new RegExp(`^@${forum.username}\\s\\S{3,}(\\s|$)`, 'i').test(line)) {
            args = line.split(/\s+/);
            args.shift();
            return {
                command: args.shift().toLowerCase(),
                args: args,
                line: line,
                mention: true
            };
        } else if (/^!\S{3,}(\s|$)/.test(line)) {
            args = line.split(/\s+/);
            return {
                command: args.shift().substring(1).toLowerCase(),
                args: args,
                line: line,
                mention: false
            };
        }
        return null;
    }

    function onComplete(arr, commands) {
        const content = arr.map((command) => command.replyText)
            .filter((text) => text.strip())
            .join('\n\n---\n\n');
        if (!content) {
            return Promise.resolve();
        }
        return forum.Post.reply(commands.notification.topicId,
            commands.notification.postId, content);
    }

    function onError(reason, commands) {
        return forum.Post.reply(commands.notification.topicId,
            commands.notification.postId,
            `An unexpected error \`${reason}\` occured and your commands could not be processed!`);
    }
    
    function defaultHandler(command){
        if(command.mention){
            return Promise.resolve();
        }
        command.reply(`Command \`${command.command}\` is not recognized`);
        return Promise.resolve();
    }

    return Commands;
};
