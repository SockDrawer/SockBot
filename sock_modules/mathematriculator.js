'use strict';
var math = require('mathjs'),
    async = require('async');
var errors;

exports.name = 'Math';
exports.version = '0.1.1';
exports.description = 'Do mathematics!';
exports.configuration = {
    enabled: false
};

exports.commands = {
    calc: {
        handler: calc,
        defaults: {},
        params: ['expression'],
        description: 'The mathematical expression to calculate.'
    }
};

exports.begin = function begin(_, config) {
    errors = config.errors;
};

function calc(payload, callback) {
    async.series([function () {
            try {
                var args = payload.$arguments;
                args.unshift(payload.expression);
                var realExpression = args.join(' ');
                var result = math.eval(realExpression);
                var message = [
                    'Expression: ',
                    realExpression.trim(),
                    '\nResult: ',
                    result,
                    ''
                ];
                callback(null, message.join('\n'));
            } catch (e) {
                var error = errors[Math.floor(Math.random() * errors.length)];
                callback(null, error);
            }
        }
    ]);
}
