/**
 * Mathematriculator module. Responsible for automatically performing mathematical operations and unit conversions
 * @module mathematriculator
 */
'use strict';
var math = require('mathjs'),
    async = require('async');
var errors;

/** Name of the module */
exports.name = 'Math';

/** Module version */
exports.version = '0.2.0';

/** Description of the module */
exports.description = 'Do mathematics!';

/** 
 * Configuration properties.
 * @property enabled - Whether to use Markov or not. Defaults to false.
 */
exports.configuration = {
    enabled: false
};

/**
 * Respond to commands.
 * @param {string} command - The command issued
 * @param {array} args - A list of arguments for the command
 * @param {function} callback - The callback to use once the action is complete
 */
exports.onCommand = function onCommand(_, command, args, __, callback) {
    if (command.toLowerCase() !== 'calc'){
        args.unshift(command);
    }
    calc(args, callback);
};

/**
 * Bootstrap the module.
 * @param {object} config - The SockBot config object
 */
exports.begin = function begin(_, config) {
    errors = config.errors;
    math.config({
        number: 'bignumber',
        precision: 4096
    });
};

/**
 * Bootstrap the module.
 * @param {array} args - A list of arguments to combine into an evaluateable expression
 * @param {function} callback - The callback to use once the action is complete
 */
function calc(args, callback) {
    async.series([function (cb) {
            var realExpression = args.join(' ');
            try {
                var result = math.eval(realExpression);
                var message = [
                    'Expression: ',
                    realExpression.trim(),
                    '\nResult: ',
                    result,
                    ''
                ];
                cb(null, message.join('\n'));
            } catch (e) {
                var error = [
                    'Unable to evaluate expression ' + realExpression,
                    errors[Math.floor(Math.random() * errors.length)],
                    ''
                ];
                cb(null, error.join('\n'));
            }
        }
    ],
    function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results[0]);
        }
    });
}
