'use strict';
/**
 * NodeBB provider module User class
 * @module sockbot.lib.commands
 * @author Accalia
 * @license MIT
 */

const debug = require('debug')('sockbot:commands');
const utils = require('./utils');

/**
 * Create a Commands class and bind it to a forum instance.
 *
 * @param {Provider} forum A forum Provider instance to bind to constructed Commands class
 * @returns {Commands} A Commands class bound to the provided `forum` instance
 */
exports.bindCommands = function bindCommands(forum) {
    /**
     * Command Handlers
     *
     * @default
     */
    const handlers = {
            help: {
                help: 'print command help listing',
                handler: cmdHelp
            }
        },

        /**
         * Shadow Command Handlers
         *
         * @default
         */
        shadowHandlers = {},

        /**
         * Commands forbidden by the forum provider
         *
         * @default
         */
        forbiddenCmds = {},

        /**
         * Extended help topics
         *
         */
        helpTopics = {};

    /**
     * Command Class. Represents a single command within a post
     *
     * @inner
     */
    class Command {
        /**
         * Create a Command from a defintiton
         *
         * @public
         * @class
         *
         * @param {object} definition Parsed Command defintition
         * @param {Commands} parent Commands instnace that created this Command
         */
        constructor(definition, parent) {
            let handler = (handlers[definition.command] || {}).handler;
            handler = handler || shadowHandlers[definition.command];
            const values = {
                line: definition.line,
                command: definition.command,
                commandText: definition.commandText,
                args: definition.args,
                mention: definition.mention,
                parent: parent,
                handler: handler || defaultHandler,
                replyText: ''
            };
            values.executable = !values.mention || values.handler !== defaultHandler;
            utils.mapSet(this, values);
        }

        /**
         * Full Command line definition
         *
         * @public
         *
         * @type {string}
         */
        get line() {
            return utils.mapGet(this, 'line');
        }

        /**
         * Normalized command name
         *
         * @public
         *
         * @type {string}
         */
        get command() {
            return utils.mapGet(this, 'command');
        }

        /**
         * Unnormalized command name
         *
         * @public
         *
         * @type {string}
         */
        get commandText() {
            return utils.mapGet(this, 'commandText');
        }

        /**
         * Is Command a mention command?
         *
         * @public
         *
         * @type {boolean}
         */
        get mention() {
            return utils.mapGet(this, 'mention');
        }

        /**
         * Command arguments
         *
         * @public
         *
         * @type {Array<string>}
         */
        get args() {
            return utils.mapGet(this, 'args');
        }

        /**
         * Parent Commands object
         *
         * @public
         *
         * @type {Commands}
         */
        get parent() {
            return utils.mapGet(this, 'parent');
        }

        /**
         * Text to post as a reply to the command
         *
         * @public
         *
         * @type {string}
         */
        get replyText() {
            return utils.mapGet(this, 'replyText');
        }

        /**
         * Indicates if this command will execute any handler
         *
         * @public
         *
         * @type {boolean}
         */
        get executable() {
            return utils.mapGet(this, 'executable');
        }

        /**
         * Execute the command handler for this command
         *
         * @public
         *
         * @returns {Promise} Resolves when command has fully executed
         */
        execute() {
            if (!this.executable) {
                return Promise.resolve();
            }
            debug(`executing command "${this.commandText}"`);
            return utils.mapGet(this, 'handler')(this);
        }

        /**
         * Get Full Post the command refers to
         *
         * @public
         *
         * @returns {Promise<Post>} Resolves to retrieved Post
         */
        getPost() {
            return this.parent.getPost();
        }

        /**
         * Get Topic command was posted to
         *
         * @public
         *
         * @returns {Promise<Topic>} Resolves to retrieved Topic
         */
        getTopic() {
            return this.parent.getTopic();
        }

        /**
         * Get User who posted the command
         *
         * @public
         *
         * @returns {Promise<User>} Resolved to retrieved User
         */
        getUser() {
            return this.parent.getUser();
        }

        /**
         * Get PrivateMessage who posted the command
         *
         * @public
         *
         * @returns {Promise<PrivateMessage>} Resolved to retrieved PrivateMessage
         */
        getPM() {
            return this.parent.getPM();
        }

        /**
         * Reply to command with content
         *
         * @public
         *
         * @param {string} content Content to reply with
         */
        reply(content) {
            utils.mapSet(this, 'replyText', content);
        }

        /**
         * Append content to the reply of command
         *
         * @public
         *
         * @param {string} content Content to append to reply
         */
        appendReply(content) {
            let reply = utils.mapGet(this, 'replyText') || '';
            if (reply) {
                reply += '\n\n';
            }
            utils.mapSet(this, 'replyText', reply + content);
        }
    }

    /**
     * Commands class. Represents all commands for a Notification
     *
     * @public
     */
    class Commands {
        /**
         * Reply Handler
         *
         * @function
         * @typedef {ReplyHandler}
         *
         * @param {string} content Text to reply with
         * @returns Promise Resolves when reply is completed
         *
         */
        /**
         * Construct a Commands object from notification
         *
         * @public
         * @class
         *
         * @param {Ids} ids Useful Ids
         * @param {string} postBody Raw Content of post containing commands
         * @param {ReplyHandler} handler Reply handler
         */
        constructor(ids, postBody, handler) {
            const values = {
                ids: ids,
                postBody: postBody,
                _replyFn: handler,
                commands: postBody.split('\n')
                    .map(parseLine)
                    .filter((definition) => definition)
                    .map((definition) => new Command(definition, this))
                    .filter((command) => command.executable)
            };
            utils.mapSet(this, values);
        }

        /**
         * Object Ids
         *
         * @typedef {Ids}
         * @property {number} post Post Id
         * @property {number} topic Topic Id
         * @property {number} user User Id
         * @property {number} room Chat Room Id
         */
        /**
         * Ids relevant to this Commands object
         *
         * @public
         *
         * @type {Ids}
         */
        get ids() {
            return utils.mapGet(this, 'ids');
        }

        /**
         * Commands contained in this Commands object
         *
         * @public
         *
         * @type {Array<Command>}
         */
        get commands() {
            return utils.mapGet(this, 'commands');
        }

        /**
         * Text this Commands object parsed
         *
         * @public
         *
         * @type {string}
         */
        get text() {
            return utils.mapGet(this, 'postBody');
        }

        /**
         * Reply function for these commands
         *
         * @private
         *
         * @type {ReplyHandler}
         */
        get _replyFn() {
            return utils.mapGet(this, '_replyFn');
        }

        /**
         * Get an item from cache or retrieve from server if not cached
         *
         * @private
         *
         * @param {string} name Name to cache results under
         * @param {number} id Object id to retrieve
         * @param {object} obj Forum object that has a `get` function that will accept `id` to retrieve item
         * @returns {Promise<*>} Resolves to requested item
         */
        _getItem(name, id, obj) {
            const item = utils.mapGet(this, name);
            if (item) {
                return Promise.resolve(item);
            }
            return obj.get(id)
                .then((thing) => {
                    utils.mapSet(this, name, thing);
                    return thing;
                });
        }

        _setItem(name, obj) {
            const item = utils.mapGet(this, name);
            if (item) {
                throw new Error('E_ALREADY_SET');
            }
            utils.mapSet(this, name, obj);
        }

        /**
         * Get the Post this Commands object referrs to
         *
         * @public
         *
         * @returns {Promise<Post>} Resolves to the retrieved Post
         */
        getPost() {
            return this._getItem('post', this.ids.post, forum.Post);
        }

        /**
         * Set the Post this Commands object refers to
         *
         * @public
         *
         * @param {Post} post The Post to cache
         */
        setPost(post) {
            this._setItem('post', post);
        }

        /**
         * Get the Topic this Commands object referrs to
         *
         * @public
         *
         * @returns {Promise<Topic>} Resolves to the retrieved Topic
         */
        getTopic() {
            return this._getItem('topic', this.ids.topic, forum.Topic);
        }

        /**
         * Set the Topic this Commands object refers to
         *
         * @public
         *
         * @param {Topic} topic The Topic to cache
         */
        setTopic(topic) {
            this._setItem('topic', topic);
        }

        /**
         * Get the PrivateMessage this Commands object referrs to
         *
         * @public
         *
         * @returns {Promise<ChatRoom>} Resolves to the retrieved ChatRoom
         */
        getPM() {
            return this._getItem('pm', this.ids.pm, forum.PrivateMessage);
        }

        /**
         * Set the PrivateMessage this Commands object refers to
         *
         * @public
         *
         * @param {PrivateMessage} pm The pm to cache
         */
        setPM(pm) {
            this._setItem('pm', pm);
        }

        /**
         * Get the user who sent these commands
         *
         * @public
         *
         * @returns {Promise<User>} Resolved to the retrieved User
         */
        getUser() {
            return this._getItem('user', this.ids.user, forum.User);
        }

        /**
         * Set the User this Commands object refers to
         *
         * @public
         *
         * @param {User} user The User to cache
         */
        setUser(user) {
            this._setItem('user', user);
        }

        /**
         * Execute the commands this object contains
         *
         * @public
         *
         * @returns {Promise<Commands>} Resolves to self when all commands have been processed
         */
        execute() {
            const cmds = this.commands.slice();
            if (cmds.length > 10) {
                forum.emit('logError', `Refusing to execute ${cmds.length}, over limit.`);
                return onLimitCommands(this).then(() => this);
            }
            const exec = () => {
                const cmd = cmds.shift();
                if (!cmd) {
                    return Promise.resolve();
                }
                return cmd.execute().then(exec);
            };
            return exec()
                .then(() => onComplete(this))
                .catch((reason) => {
                    return onError(reason, this);
                })
                .catch(() => forum.emit('logError', 'Command error occured and posting response failed.'))
                .then(() => this);
        }

        /**
         * Get Commands from a notification
         *
         * @public
         * @static
         *
         * @param {Notification} notification Notification to get commands for
         * @param {string} postBody Post Body to parse for commands
         * @param {ReplyHandler} handler Reply function for commands
         * @returns {Promise<Commands>} Resolves to parsed commands
         */
        static get(notification, postBody, handler) {
            return new Promise((resolve) => {
                const rawData = utils.htmlToRaw(postBody);
                resolve(new Commands(notification, rawData, handler));
            });
        }

        /**
         * Command Handler
         *
         * @typedef {CommandHandler}
         * @function
         *
         * @param {Command} command Command to handle
         * @returns {Promise} Resolves when command is processed
         */

        /**
         * Add a command to this forum instance
         *
         * @public
         * @static
         *
         * @param {string} command Command to be added
         * @param {string} helpText Short help text for command
         * @param {CommandHandler} handler Function to handle the command
         * @returns {Promise} Resolves when command has been added
         */
        static add(command, helpText, handler) {
            return new Promise((resolve, reject) => {
                debug(`Registering command: ${command}`);
                const cmd = command.toLowerCase(),
                    shadowingMsg = 'will override alias.',
                    conflictMsg = 'cannot override existing command.',
                    forbiddenMsg = 'not allowed by the active forum provider.';
                checkAvailable(shadowHandlers, cmd, 'log', shadowingMsg);
                if (!checkAvailable(handlers, cmd, 'error', conflictMsg)) {
                    return reject(new Error('E_ALREADY_REGISTERED'));
                }
                if (!checkAvailable(forbiddenCmds, cmd, 'error', forbiddenMsg)) {
                    return reject(new Error('E_FORBIDDEN_COMMAND'));
                }
                handlers[cmd] = {
                    commandText: command,
                    help: helpText,
                    handler: handler
                };
                return resolve(this);
            });
        }

        /**
         * Add a command alias to this forum instance
         *
         * @public
         * @static
         *
         * @param {string} command Command alias to be added
         * @param {CommandHandler} handler Function to handle the command
         * @returns {Promise} Resolves when command has been added
         */
        static addAlias(command, handler) {
            return new Promise((resolve, reject) => {
                debug(`Registering command alias: ${command}`);
                const cmd = command.toLowerCase(),
                    shadowedMsg = 'existing command will override.',
                    shadowConflict = 'cannot override existing alias.',
                    forbiddenMsg = 'not allowed by the active forum provider.';
                checkAvailable(handlers, cmd, 'log', shadowedMsg);
                if (!checkAvailable(shadowHandlers, cmd, 'error', shadowConflict)) {
                    return reject(new Error('E_ALREADY_REGISTERED'));
                }
                if (!checkAvailable(forbiddenCmds, cmd, 'error', forbiddenMsg)) {
                    return reject(new Error('E_FORBIDDEN_COMMAND'));
                }
                shadowHandlers[cmd] = handler;
                return resolve(this);
            });
        }

        /**
         * Add an extended help message for a command
         *
         * @param {string} command The command to add help text to
         * @param {string} text The help text to add for a command
         * @returns {Promise} Resolves when help message has been added
         *
         */
        static addExtendedHelp(command, text) {
            return new Promise((resolve, reject) => {
                const ext = command.replace(/\s+/g, ' ');
                if (!ext || !text || /^\s*$/.test(ext) || /^\s*$/.test(text)) {
                    return reject(new Error('E_INVALID_HELP_TOPIC'));
                }
                helpTopics[ext] = text;
                return resolve(this);
            });
        }

        /**
         * Forbid a command from being registered.
         *
         * This is to allow a provider the ability to prevent commands from being registered or triggered that
         * would be problematic or prone to being accidentally triggered on the target system.
         *
         * @param {string} command The forbidden command
         * @returns {boolean} True if the command was already forbidden, false otherwise.
         *
         */
        static forbidCommand(command) {
            command = command.toLowerCase();
            const forbidden = Boolean(forbiddenCmds[command]);
            forbiddenCmds[command] = 1;
            return forbidden;
        }
    }

    /**
     * Parse command definitions from a line of text
     *
     * @private
     *
     * @param {string} line Text to parse
     * @returns {object} Parsed command definition
     */
    function parseLine(line) {
        let args, mention, commandText;
        if (new RegExp(`^@${forum.username}\\s\\S{3,}(\\s|$)`, 'i').test(line)) {
            args = line.split(/\s+/);
            args.shift();
            commandText = args.shift();
            mention = true;
        } else if (/^!\S{3,}(\s|$)/.test(line)) {
            args = line.split(/\s+/);
            commandText = args.shift().substring(1);
            mention = false;
        }
        if (commandText) {
            return {
                commandText: commandText,
                command: commandText.toLowerCase(),
                args: args,
                line: line,
                mention: mention
            };
        }
        return null;
    }

    /**
     * Handle Commands object once execution is complete.
     *
     * Post a reply if `replyText` of any contained command is non empty
     *
     * @private
     *
     * @param {Commands} commands Commands that have completed execution
     * @returns {Promise} Resolves when after execution processing is complete
     */
    function onComplete(commands) {
        const content = commands.commands.map((command) => command.replyText)
            .filter((text) => (text || '').trim())
            .join('\n\n---\n\n');
        if (!content) {
            return Promise.resolve();
        }
        return commands._replyFn(content);
    }

    /**
     * Handle Commands object that error'd durring execution
     *
     * Post an error message in reply to post
     *
     * @private
     *
     * @param {string} reason Error Reason
     * @param {Commands} commands Commands that errored
     * @returns {Promise} Resolves after onError steps have completed
     */
    function onError(reason, commands) {
        if (typeof reason !== 'string' && typeof reason.message === 'string') {
            reason = reason.message;
        }
        return commands._replyFn(`An unexpected error \`${reason}\` occured and your commands could not be processed!`);
    }

    /**
     * Handle Commands object that refused execution due to antispam protection
     *
     * Post an error message in reply to post
     *
     * @private
     *
     * @param {Commands} commands Commands that errored
     * @returns {Promise} Resolves after onError steps have completed
     */
    function onLimitCommands(commands) {
        debug(`refusing to execute ${commands.commands.length} commands, Limit is 10 commands`);
        return commands._replyFn('Your request contained too many commands to process.\n' +
            '\nPlease try again with fewer commands.');
    }

    /**
     * Default Handler for unknown commands
     *
     * Post an error reply only if command is not a mention command
     *
     * @private
     *
     * @param {Command} command Unknown Command
     * @returns {Promise} Resolves after action is taken
     */
    function defaultHandler(command) {
        debug(`executing default handler for unrecognized command ${command.commandText}`);
        if (!command.mention) {
            command.reply(`Command \`${command.command}\` is not recognized`);
        }
        return Promise.resolve();
    }

    /**
     * Reply with help to the command !help
     *
     * @private
     *
     * @param {command} command help command
     * @returns {Promise} Resolves after help text is generated
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
            const help = `${getCommandHelps()}\n\n\\* Help topic available.\n\nIssue the \`help\` command with an ` +
                'available help topic as a parameter to read additonal help';
            command.reply(help);
        }
        return Promise.resolve();
    }

    /**
     * Get help text for commands
     *
     * @private
     *
     * @returns {string} Command help text
     */
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

    /**
     * Check the availability of a command
     *
     * @param {object} map A map of commands to check availability against
     * @param {string} command Name of command to check
     * @param {string} logType Type of log to log if command isn't available
     * @param {string} logMsg Message to log if command is not available
     * @returns {boolean} True if available, false otherwise
     */
    function checkAvailable(map, command, logType, logMsg) {
        if (map[command]) {
            const prefix = logType === 'error' ? 'ERROR' : 'WARNING';
            forum.emit(logType, `${prefix}, ${command} is already registered: ${logMsg}`);
            return false;
        }
        return true;
    }

    /* istanbul ignore else */
    if (typeof global.describe === 'function') {
        exports.internals = {
            handlers: handlers,
            shadowHandlers: shadowHandlers,
            forbiddenCmds: forbiddenCmds,
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
if (typeof global.describe === 'function') {
    exports.internals = {};
}
