/*jslint node: true, indent: 4, regexp: true */
/* vim: set ts=4 et: */
'use strict';
var configuration,
    discourse;

var crypts = {
    'rot13': function(s) {
        return s.replace( /[A-Za-z]/g, function(c) {
            return String.fromCharCode(
                c.charCodeAt(0) + (c.toUpperCase() <= 'M' ? 13 : -13 ) );
        } );
    },
    'reverse': function(s) {
        return s.split('').reverse().join('');
    },
    /* must be last - prevent random from randomly calling random */
    'random': function(s) {
        var keys = Object.keys(crypts);
        var id = Math.floor((keys.length - 1) * Math.random());
        return crypts[keys[id]](s);
    }
};

exports.description = 'Encryptor';

exports.configuration = {
    enabled: false
};

exports.name = 'Crypt';

exports.priority = undefined;

exports.version = '0.1.0';

exports.onCommand = function onCommand(type, command, args, data, callback) {
    if ((!configuration.enabled || !data.post || !data.post.cleaned) ||
        (['private_message', 'mentioned', 'replied'].indexOf(type) === -1)) {
        return callback();
    }

    args.unshift(command);

    doCrypt(data.draft || data.post.cleaned, args, callback);
};

exports.onNotify = function (type, notification, topic, post, callback) {
    if ((!configuration.enabled || !post || !post.cleaned) ||
        (['private_message', 'mentioned', 'replied'].indexOf(type) === -1)) {
        return callback();
    }

    doCrypt(post.cleaned, ['random'], function(_, text) {
            discourse.createPost(notification.topic_id,
                notification.post_number, text, function() {
                    callback(true);
                });
        });

};

function doCrypt(msg, commands, callback) {
    var cleaner = /(<\/?[a-z][^>]*>)/ig;
    var text = msg.replace(cleaner, '');
    var log = [];

    commands.forEach( function(command) {
        if (crypts[command] !== undefined) {
            text = crypts[command](text);
            log.push(command);
        }
    });

    callback(null, {
        replaceMsg: true,
        msg: text,
        log: log
    });
}

exports.begin = function begin(browser, config) {
    configuration = config.modules[exports.name];
    discourse = browser;
};
