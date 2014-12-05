'use strict';
var regexp = require('xregexp').XRegExp,
    async = require('async'),
    fs = require('fs');
var sockModules,
    adminModules,
    conf,
    discourse,
    parser,
    commands;

exports.description = 'Admin Module';
exports.name = 'Admin';
exports.configuration = {
    enabled: true
};
exports.version = '1.0.0';

(function () {
    var exp = regexp('^> (?<command>\\S+)(?<arguments>( +\\S+)+)?$', 'mn'),
        splitter = regexp('\\s+');
    parser = function parser(input, each, complete) {
        var match = 1,
            pos = 0;
        async.forever(
            function (next) {
                match = exp.xexec(input, pos);
                if (!match) {
                    return next(true);
                }
                if (match.arguments) {
                    match.arguments = match.arguments.split(splitter);
                    match.arguments.shift();
                }
                if (!match.arguments) {
                    match.arguments = [];
                }

                pos = match.index + match[0].length - 1;
                each(match, next);
            },
            function () {
                complete();
            });
    };
}());

function help(args, callback) {
    var res = [],
        names = [];
    for (var name in commands) {
        names.push(name);
    }
    names.sort();
    for (var i = 0; i < names.length; i += 1) {
        var cmd = commands[names[i]];
        res.push(names[i] + ':\t(TL' + cmd.trustLevel + '+) ' +
            cmd.description);
    }
    callback(null, '```text\n' + res.join('\n') + '\n```');
}
help.command = 'help';
help.description = 'List commands that are available';
help.trustLevel = 1;
help.muteable = false;
help.prefix = false;

function info(args, callback) {
    var ret = discourse.version(),
        sleepy = new Date(discourse.sleep()),
        now = new Date();
    ret += '\nCurrent time:\t' + now.toUTCString();
    if (now < sleepy) {
        ret += '\nMuted until:\t' + sleepy.toUTCString();
    }
    ret += '\nOwned by:\t<a class="mention" href="/users/' + conf.admin.owner +
        '">@' + conf.admin.owner + '</a>\nActive modules:\n';
    sockModules.forEach(function (mod) {
        ret += '\t' + mod.name + '(v' + mod.version + '): ' +
            mod.description + '\n';
    });
    callback(null, '<pre>\n' + ret + '\n</pre>');
}
info.command = 'info';
info.description = 'Show info on the bot';
info.trustLevel = 1;
info.muteable = false;
info.prefix = false;


function handleCommand(post, match, callback) {
    if (!commands[match.command]) {
        return callback('Unrecognized command `' + match.command + '`');
    }
    var cmd = commands[match.command];
    if (post.trust_level < cmd.trustLevel) {
        return callback('Unauthorized command `' + match.command + '`');
    }
    cmd(match.arguments, function (err, msg) {
        if (err) {
            return callback('Error executing `' + match.command + '`');
        }
        if (cmd.prefix) {
            msg = '> ' + match.command + ': ' + msg;
        }
        callback(msg, cmd.muteable);
    });
}

exports.onNotify = function notify(type, notification, topic, post, callback) {
    discourse.log('Notification ' + type + ' from ' +
        notification.data.display_username + ' in "' +
        notification.data.topic_title + '"');
    if (post && post.raw) {
        discourse.log('\t' + (post.raw || '').split('\n')[0]);
    }
    if (type !== 'private_message') {
        return callback();
    }
    var res = [],
        muteable = true;
    parser(post.raw, function (match, flow) {
        handleCommand(post, match, function (msg, ismuteable) {
            if (ismuteable === undefined) {
                ismuteable = true;
            }
            muteable = muteable && ismuteable;
            if (msg) {
                res.push(msg);
            }
            flow();
        });
    }, function () {
        if (res.length > 0) {
            return discourse.createPost(notification.topic_id,
                notification.post_number, res.join('\n'),
                function () {
                    callback(true);
                }, !muteable);
        }
        callback();
    });
};

function addCommand(fn) {
    if (typeof fn === 'function' &&
        typeof fn.command === 'string') {
        if (isNaN(fn.trustLevel)) {
            fn.trustLevel = 9;
        } else if (fn.trustLevel < 1) {
            fn.trustLevel = 1;
        }
        if (fn.prefix === undefined) {
            fn.prefix = true;
        }
        if (fn.muteable === undefined) {
            fn.muteable = true;
        }
        commands[fn.command] = fn;
    }
}
exports.load = function (callback) {
    async.waterfall([
        function (cb) {
            fs.readdir('./admin_modules/', cb);
        },
        function (files, cb) {
            adminModules = [];
            files.filter(function (name) {
                return name[0] !== '.' && /[.]js$/.test(name);
            }).forEach(function (name) {
                var module = require('./admin_modules/' + name);
                adminModules.push(module);
            });
            adminModules.sort();
            commands = {};
            adminModules.forEach(function (module) {
                console.log('Loaded admin module: ' +
                    module.name + ' v' + module.version);
                for (var name in module) {
                    addCommand(module[name]);
                }
            });
            addCommand(help);
            addCommand(info);
            cb();
        }
    ], function () {
        callback();
    });
};
exports.setModules = function setModules(modules) {
    sockModules = modules;
};

exports.begin = function begin(browser, config) {
    conf = config;
    discourse = browser;
    adminModules.forEach(function (module) {
        module.begin(browser, config);
    });
};
