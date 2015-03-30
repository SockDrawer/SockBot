'use strict';
var math = require('mathjs');

exports.name = 'Mathematriculator';
exports.version = '0.1.0';
exports.description = 'Do mathematics!';
exports.configuration = {
    enabled: false
};

exports.commands = {
    domath: {
        handler: doMath,
        defaults: {},
        params: ['expression'],
        description: 'The mathematical expression to calculate.'
    }
};

exports.begin = function begin() { };

function doMath(expression) {
    try {
        return math.parse(expression);
    } catch (e) {
        return e.message;
    }
}
