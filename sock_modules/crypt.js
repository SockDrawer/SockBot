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

    doCrypt(data.post, args, callback);
};

exports.onNotify = function (type, notification, topic, post, callback) {
    if ((!configuration.enabled || !post || !post.cleaned) ||
        (['private_message', 'mentioned', 'replied'].indexOf(type) === -1)) {
        return callback();
    }

    doCrypt(post, ['random'], function(_, text) {
            discourse.createPost(notification.topic_id,
                notification.post_number, text, function() {
                    callback(true);
                });
        });

};

function doCrypt(post, commands, callback) {
    var cleaner = /(<\/?[a-z][^>]*>)/ig;
    var text = post.cleaned.replace(cleaner, '');
    var log = '\n\n→ clean → ';

    commands.forEach( function(command) {
        if (crypts[command] !== undefined) {
            text = crypts[command](text);
            log += command + ' → ';
        }
    });

    text += log;

    callback(null, text);
}

exports.begin = function begin(browser, config) {
    configuration = config.modules[exports.name];
    discourse = browser;
};
