'use strict';
var async = require('async'),
    fs = require('fs');
var sockModules,
    adminModules,
    conf,
    discourse,
    commands;

exports.description = 'Admin Module';
exports.name = 'Admin';
exports.configuration = {
    enabled: true
};
exports.version = '1.0.0';

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


function handleCommand(post, command, args, callback) {
    if (!commands[command]) {
        return callback('Unrecognized command `' + command + '`');
    }
    var cmd = commands[command];
    if (post.trust_level < cmd.trustLevel) {
        return callback('Unauthorized command `' + command + '`');
    }
    cmd(args, function (err, msg) {
        if (err) {
            return callback('Error executing `' + command + '`');
        }
        if (cmd.prefix) {
            msg = '> ' + command + ': ' + msg;
        }
        callback(msg, cmd.muteable);
    });
}

exports.onCommand = function onCommand(type, command, args, data, callback) {
    if (type !== 'private_message'){
        return callback();
    }
    handleCommand(data.post, command, args, function(msg, muteable){
        callback(null, msg, !muteable);
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
                try {
                    var module = require('./admin_modules/' + name);
                    adminModules.push(module);
                } catch (e) {
                    var msg = e.message;
                    /* eslint-disable no-console */
                    console.log('Error in Admin Module' + name + ': ' + msg);
                    /* eslint-enable no-console */
                    return;
                }
            });
            adminModules.sort();
            commands = {};
            adminModules.forEach(function (module) {
                /* eslint-disable no-console */
                console.log('Loaded admin module: ' +
                    module.name + ' v' + module.version);
                /* eslint-enable no-console */
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
        module.begin(browser, config.admin.modules[module.name]);
    });
};

exports.onMessage = function onMessage(message, post, callback) {
    async.each(adminModules, function (mod, next) {
        if (typeof mod.onMessage === 'function') {
            return mod.onMessage(message, post, next);
        }
        next();
    }, function (err) {
        callback(err);
    });
};

exports.registerListeners = function registerListeners(callback) {
    var listen = [];
    async.each(adminModules, function (mod, next) {
        if (typeof mod.registerListeners === 'function') {
            return mod.registerListeners(function (err, items) {
                if (!err && items) {
                    listen = listen.concat(items);
                }
                next(err);
            });
        }
        next(null);
    }, function (err) {
        callback(err, listen);
    });
};


exports.getConfig = function getConfig() {
    var c = {};
    adminModules.forEach(function (mod) {
        c[mod.name] = mod.configuration || {};
    });
    return c;
};
