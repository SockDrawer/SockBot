'use strict';
var math = require('mathjs'),
    async = require('async');
var errors;

exports.name = 'Math';
exports.version = '0.1.3';
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
    math.config({
        number: 'bignumber',
        precision: 4096
    });
};

function calc(payload, callback) {
    async.series([function (cb) {
            var args = payload.$arguments;
            args.unshift(payload.expression);
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
        callback(err, results);
    });
}
