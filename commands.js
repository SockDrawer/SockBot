'use strict';
/**
 * Command Parser for SockBot2.0
 * @module commands
 * @author Accalia
 * @license MIT
 */

const config = require('./config'),
    utils = require('./utils'),
    browser = require('./browser');

const internals = {
    mention: null,
    parseShortCommand: parseShortCommand,
    parseMentionCommand: parseMentionCommand,
    registerCommand: registerCommand,
    events: null,
    commandProtect: commandProtect,
    getCommandHelps: getCommandHelps,
    cmdError: cmdError,
    cmdHelp: cmdHelp,
    commands: {}
};

/**
 * Perpare the command parser
 *
 * Needs to be called to set the internals of the parser after reading config file.
 *
 * @param {EventEmitter} events EventEmitter that will be core comms for SockBot
 * @param {completedCallback} callback Completion callback
 */
exports.prepareCommands = function prepareCommands(events, callback) {
    internals.mention = new RegExp('^@' + config.core.username + '\\s\\S{3,}(\\s|$)', 'i');
    internals.events = events;
    events.on('command#ERROR', cmdError);
    events.onCommand = registerCommand;
    events.on('newListener', commandProtect);
    events.onCommand('help', 'print command help listing', cmdHelp, callback);
};

/**
 * Parse a short command from input line
 *
 * @param {string} line Input line to parse
 * @returns {command} Parsed command
 */
function parseShortCommand(line) {
    if (!/^!\S{3,}(\s|$)/.test(line)) {
        return null;
    }
    const args = line.split(/\s+/),
        command = args.shift().substring(1).toLowerCase();
    return {
        input: line,
        command: command,
        args: args,
        mention: null
    };
}

/**
 * Parse a mention command from input line
 *
 * @param {string} line Input line to parse
 * @returns {command} Parsed command
 */
function parseMentionCommand(line) {
    if (!internals.mention.test(line)) {
        return null;
    }
    const args = line.split(/\s+/),
        mention = args.shift(),
        command = args.shift().toLowerCase();
    return {
        input: ('!' + command + ' ' + args.join(' ')).replace(/\s+$/, ''),
        command: command,
        args: args,
        mention: mention
    };
}

/**
 * Parse commands from post and emit command events
 *
 * @param {external.posts.CleanedPost} post Post to parse commands from
 * @param {parseCallback} callback CompletionCallback
 */
exports.parseCommands = function parseCommands(post, callback) {
    if (typeof callback !== 'function') {
        throw new Error('callback must be supplied');
    }
    if (!post || !post.raw) {
        callback(null, []);
        return;
    }
    const commands = post.raw.split('\n').map((line) => line.replace(/\s+$/, '')).map((line) => {
        if (line[0] === '!') {
            return internals.parseShortCommand(line);
        } else {
            return internals.parseMentionCommand(line);
        }
    }).filter((command) => !!command);
    commands.forEach((command) => {
        setImmediate(() => {
            command.post = post;
            const handled = internals.events.emit('command#' + command.command, command);
            if (!handled && !command.mention) {
                if (!internals.events.emit('command#ERROR', command)) {
                    internals.events.emit('error', new Error('command `' + command.command + '` was unhandled.'));
                }
            }
        });
    });
    callback(null, commands);
};

/**
 * Get a list of commands that are registered withg the bot
 *
 * @returns {string} command list for posting
 */
function getCommandHelps() {
    const cmds = Object.keys(internals.commands),
        result = ['Registered commands:'];
    cmds.sort();
    cmds.forEach((cmd) => result.push(cmd + ': ' + internals.commands[cmd].help));
    return result.join('\n');
}

/**
 * Replies on unhandled command with helptext
 *
 * @param {command} command Unhandled command
 */
function cmdError(command) {
    if (!command.post) {
        return;
    }
    const err = 'Command `' + command.command + '` is not recognized\n\n' + internals.getCommandHelps();
    browser.createPost(command.post.topic_id, command.post.post_number, err, () => 0);
}

/**
 * Reply with help test top the command !help
 *
 * @param {command} command help command
 */
function cmdHelp(command) {
    if (!command.post) {
        return;
    }
    const help = internals.getCommandHelps() + '\n\nMore details may be available by passing `help` as ' +
        'the first parameter to a command';
    browser.createPost(command.post.topic_id, command.post.post_number, help, () => 0);
}

/**
 * Register a command
 *
 * will be added to core EventEmitter as .onCommand()
 *
 * @param {string} command Command to handle
 * @param {string} helpstring One line helpstring describing command
 * @param {commandHandler} handler Function to handle the command
 * @param {completedCallback} callback Completion callback
 * @returns {undefined} No return value
 */
function registerCommand(command, helpstring, handler, callback) {
    if (!callback || typeof callback !== 'function') {
        throw new Error('callback must be provided');
    }
    if (!command || typeof command !== 'string') {
        return callback(new Error('command must be provided'));
    }
    if (!helpstring || typeof helpstring !== 'string') {
        return callback(new Error('helpstring must be provided'));
    }
    if (!handler || typeof handler !== 'function') {
        return callback(new Error('handler must be provided'));
    }
    command = command.toLowerCase();
    while (internals.commands[command]) {
        command = '_' + command;
    }
    internals.commands[command] = {
        help: helpstring,
        handler: handler
    };
    internals.events.on('command#' + command, handler);
    utils.log('Command Registered: ' + command + ': ' + helpstring);
    return callback();
}

/**
 * Watch for unauthorized commands and reject them
 *
 * @param {string} event Event that is registered
 * @param {function} handler Event Handler
 * @returns {boolean} Flag wether event was of intrest to function
 */
function commandProtect(event, handler) {
    if (!/^command#./.test(event)) {
        return false;
    }
    const command = event.replace(/^command#/, '');
    if (!internals.commands[command] || internals.commands[command].handler !== handler) {
        utils.warn('Invalid command (' + command + ') registered! must register commands with onCommand()');
        internals.events.removeListener(event, handler);
    }
    return true;
}


/**
 * Parsed Command Data
 *
 * @name command
 * @typedef {object}
 * @param {string} input Raw Command Input
 * @param {string} command Command name
 * @param {string[]} args Command arguments
 * @param {string} mention Mention text that was included in command
 * @param {external.posts.CleanedPost} post Post that triggered the command
 */

/**
 * Completion Callback
 *
 * @callback
 * @name completedCallback
 * @param {Exception} [err=null] Error encountered processing request
 */

/**
 * Parse Completion Callback
 *
 * @callback
 * @name parseCallback
 * @param {Exception} [err=null] Error encountered processing request
 * @param {command[]} commands Parsed Commands
 */

/**
 * Command handler
 *
 * @callback
 * @name commandHandler
 * @param {command} command Command to handle
 */

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.internals = internals;
}
