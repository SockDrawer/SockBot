'use strict';
/**
 * Command Parser for SockBot2.0
 * @module commands
 * @author Accalia
 * @license MIT
 */

const config = require('./config');

const internals = {
    mention: null,
    parseShortCommand: parseShortCommand,
    parseMentionCommand: parseMentionCommand
};
/**
 * Parsed Command Data
 *
 * @name command
 * @typedef {object}
 * @param {string} input Raw Command Input
 * @param {string} command Command name
 * @param {string[]} args Command arguments
 * @param {string} mention Mention text that was included in command
 */

/**
 * Perpare the command parser
 *
 * Needs to be called to set the internals of the parser after reading config file.
 *
 * @param {completedCallback} callback Completion callback
 */
exports.prepareParser = function prepareParser(callback) {
    internals.mention = new RegExp('^@' + config.core.username + '\\s\\S{3,}(\\s|$)', 'i');
    callback(null);
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
        command = args.shift().substring(1);
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
        command = args.shift();
    return {
        input: ('!' + command + ' ' + args.join(' ')).replace(/\s+$/, ''),
        command: command,
        args: args,
        mention: mention
    };
}

/**
 * Completion Callback
 *
 * @param {Exception} [err=null] Error encountered processing request
 */
function completedCallback(err) {} //eslint-disable-line handle-callback-err, no-unused-vars

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.internals = internals;
    exports.stubs = {
        completedCallback: completedCallback
    };
}
