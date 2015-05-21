'use strict';
var regexp = require('xregexp').XRegExp,
    async = require('async');

var discourse,
    spaces = '[ \f\r\t\v\u00a0\u1680\u180e\u2000-\u200a' +
    '\u2028\u2029\u202f\u205f\u3000]+',
    parser = regexp('^!(?<mod>\\w+)' + spaces + '(?<cmd>\\S+)(?<args>(' +
        spaces + '\\S+)+)?\\s*$', 'mng'),
    splitter = regexp(spaces),
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
        var name = module.name.toLowerCase();
        if (module.commands) {
            sockModules[name] =
                commandHelper(module.commands, module.additionalHelp);
        } else if (typeof module.onCommand === 'function') {
            sockModules[name] = module.onCommand;
        }
    });
};

exports.onNotify = function notify(type, notification, topic, post, callback) {
    if (!post || !post.raw ||
        ['private_message', 'mentioned', 'replied'].indexOf(type) === -1) {
        return callback();
    }
    var cmds = parseCommands(post.cleaned),
        response = [],
        log = [],
        muted = discourse.sleep() > Date.now();
    post.cleaned = post.cleaned.replace(parser, '');
    async.each(cmds, function (command, next) {
        discourse.log('Processing command ' + command.cmd
            + '(' + command.args + ')');

        sockModules[command.mod](type, command.cmd, command.args, {
            notification: notification,
            topic: topic,
            post: post,
            draft: response.join('\n')
        }, function (err, msg, forcePost) {
            if (err) {
                discourse.warn('Command error in `' + command.mod + '`: '
                    + err);
            } else if (msg && (!muted || forcePost)) {
                if (typeof msg == 'string') {
                    response.push(msg);
                } else {
                    if (msg.replaceMsg) {
                        response = [msg.msg];
                    } else {
                        response.push(msg.msg);
                    }
                    if (msg.log) {
                        log = log.concat(msg.log);
                    }
                }
            }
            next();
        });
    }, function () {
        if (response.length > 0) {
            if (log.length > 0) {
                response.push('\n<small>Filed under: ' + log.join(' → '));
            }
            return discourse.createPost(notification.topic_id,
                notification.post_number, response.join('\n'),
                function () {
                    callback(true);
                }, !muted);
        }
        callback();
    });
};

exports.begin = function begin(browser) {
    discourse = browser;
};

function makeHelp(definition, additionalHelp) {
    var help = [],
        cmd, keys = Object.keys(definition);
    keys.push('help');
    keys.sort();
    keys.forEach(function (key) {
        if (key === 'help') {
            help.push('help: List All Available Commands');
        } else if (key[0] !== '_') {
            cmd = definition[key];
            help.push(key + ' ' + cmd.params.join(' ') +
                ': ' + cmd.description);
        }
    });
    help.unshift('```text');
    help.unshift('Available Commands:');
    help.push('```');
    if (additionalHelp && typeof additionalHelp === 'function') {
        help.push('Additional Info:');
        help.push(additionalHelp());
    }
    return help.join('\n');
}

function commandHelper(definition, additionalHelp) {
    return function runCommand(type, command, args, data, callback) {
        if (command === 'help') {
            callback(null, makeHelp(definition, additionalHelp));
        } else if (!definition[command]) {
            callback('Unknown Command: ' + command);
        } else {
            var cmd = definition[command],
                payload = JSON.parse(JSON.stringify(cmd.defaults));
            payload.$type = type;
            payload.$command = command;
            cmd.params.forEach(function (n) {
                if (args.length <= 0) {
                    return;
                }
                var name = /\[?(\S+)/.exec(n)[1];
                payload[name] = args.shift();
            });
            payload.$arguments = args;
            payload.$notification = data.notification;
            payload.$topic = data.topic;
            payload.$post = data.post;
            payload.$draft = data.draft;
            cmd.handler(payload, callback);
        }
    };
}
