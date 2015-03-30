'use strict';
var math = require('mathjs');
var errors;

exports.name = 'Math';
exports.version = '0.1.0';
exports.description = 'Do mathematics!';
exports.configuration = {
    enabled: false
};

exports.commands = {
    domath: {
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
    try {
        var args = payload.$arguments;
        args.unshift(payload.expression);
        var realExpression = args.join(' ');
        var result = math.eval(realExpression);
        var message = [
            'Expression: ',
            realExpression.trim(),
            '\nResult: ',
            result
        ];
        callback(null, message.join('\n'));
    } catch (e) {
        callback(null, errors[Math.floor(Math.random() * errors.length)]);
    }
}
