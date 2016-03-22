'use strict';

const utils = require('./utils');

exports.bindCommands = function bindCommands(forum) {
    const handlers = {
        help: {
            help: 'print command help listing',
            handler: cmdHelp
        }
    };
    const helpTopics = {};
    class Command {
        constructor(definition, parent) {
            const values = {
                line: definition.line,
                command: definition.command,
                args: definition.args,
                mention: definition.mention,
                parent: parent,
                handler: (handlers[definition.command] || {}).handler || defaultHandler,
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
            return Promise.all(this.commands.map((command) => command.execute()))
                .then(() => onComplete(this))
                .catch((reason) => {
                    return onError(reason, this);
                })
                .catch(() => forum.emit('logError', 'Command error occured and posting response failed.'))
                .then(() => this);
        }
        static get(notification) {
            return notification.getText()
                .then((postBody) => utils.htmlToRaw(postBody))
                .then((postBody) => new Commands(notification, postBody));
        }
        static add(command, helpText, handler) {
            handlers[command] = {
                help: helpText,
                handler: handler
            };
            return Promise.resolve(this);
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

    function onComplete(commands) {
        const content = commands.commands.map((command) => command.replyText)
            .filter((text) => (text || '').trim())
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

    function defaultHandler(command) {
        if (command.mention) {
            return Promise.resolve();
        }
        command.reply(`Command \`${command.command}\` is not recognized`);
        return Promise.resolve();
    }

    /**
     * Reply with help to the command !help
     *
     * @param {command} command help command
     */
    function cmdHelp(command) {
        let ext = '';
        if (command.args && command.args.length > 0) {
            ext = command.args.join(' ');
        }
        if (ext && helpTopics[ext]) {
            const txt = `Help topic for \`${ext}\`\n\n${helpTopics[ext]}` +
                '\n\nIssue the `help` command without any parameters to see all available commands';
            command.reply(txt);

        } else {
            const help = `${getCommandHelps()}\n\n\* Help topic available.\n\nIssue the \`help\` command with an ` +
                'available help topic as a parameter to read additonal help';
            command.reply(help);
        }
        return Promise.resolve();
    }

    function getCommandHelps() {
        const cmds = {},
            topics = {},
            result = ['Registered commands:'];
        let keys = {};
        Object.keys(handlers).map((key) => {
            keys[key] = 1;
        });
        Object.keys(helpTopics).map((key) => {
            keys[key] = 1;
        });
        Object.keys(keys).map((key) => {
            if (handlers[key]) {
                cmds[key] = handlers[key].help;
                if (helpTopics[key]) {
                    cmds[key] += ' *';
                }
            } else {
                topics[key] = 'Extended help topic';
            }
        });
        keys = Object.keys(cmds);
        keys.sort();
        keys.forEach((cmd) => result.push(`${cmd}: ${cmds[cmd]}`));
        keys = Object.keys(topics);
        if (keys.length) {
            result.push('');
            result.push('Help Topics:');
            keys.sort();
            keys.forEach((topic) => result.push(`${topic}: ${topics[topic]}`));
        }
        return result.join('\n');
    }

    /* istanbul ignore else */
    if (typeof GLOBAL.describe === 'function') {
        exports.internals = {
            handlers: handlers,
            helpTopics: helpTopics,
            Commands: Commands,
            Command: Command,
            parseLine: parseLine,
            getCommandHelps: getCommandHelps,
            cmdHelp: cmdHelp,
            defaultHandler: defaultHandler,
            onError: onError,
            onComplete: onComplete
        };
    }

    return Commands;
};


/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    exports.internals = {};
}