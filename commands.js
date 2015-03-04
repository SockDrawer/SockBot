'use strict';
var regexp = require('xregexp').XRegExp,
    async = require('async');

var discourse,
    parser = regexp('^!(?<mod>\\w+)\\s+(?<cmd>\\w+)(?<args>(\\s+\\w+)+)?$',
        'mn'),
    splitter = regexp('\\s+'),
    sockModules = {};

exports.description = 'The Command Parser Module';
exports.name = 'CommandParser';
exports.configuration = {
    enabled: true
};
exports.version = '1.0.0';

function parseCommands(input) {
    var parts = [];
    parser.forEach(input, function (match) {
        match.mod = match.mod.toLowerCase();
        match.cmd = match.cmd.toLowerCase();
        if (match.args) {
            match.args = match.args.split(splitter);
            match.args.shift();
        }
        if (!match.args) {
            match.args = [];
        }
        if (sockModules.hasOwnProperty(match.mod)) {
            parts.push(match);
        }
    });
    return parts;
}

exports.loadModules = function loadModules(modules) {
    modules.forEach(function (module) {
        if (typeof module.onCommand === 'function') {
            sockModules[module.name.toLowerCase()] = module.onCommand;
        }
    });
};

exports.onNotify = function notify(type, notification, topic, post, callback) {
    if (!post || !post.raw) {
        return callback();
    }
    var cmds = parseCommands(post.raw),
        response = [],
        muted = discourse.sleep() > Date.now();
    async.each(cmds, function (command, next) {
        sockModules[command.mod](type, command.cmd, command.args, {
            notification: notification,
            topic: topic,
            post: post
        }, function (err, msg, forcePost) {
            if (err) {
                discourse.warn('Command error in `' + command.mod + '` ' + msg);
            } else if (msg && (!muted || forcePost)) {
                response.push(msg);
            }
            next();
        });
    }, function () {
        if (response.length > 0) {
            return discourse.createPost(notification.topic_id,
                notification.post_number, response.join('\n'),
                function () {
                    callback(true);
                }, !muted);
        }
        callback();
    });
};

exports.begin = function begin(browser){
    discourse = browser;
};
