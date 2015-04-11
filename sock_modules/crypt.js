/*jslint node: true, indent: 4, regexp: true */
/* vim: set ts=4 et: */
'use strict';
var discourse;

exports.description = 'Encryptor';

exports.configuration = {
    enabled: false
};

exports.name = 'Crypt';

exports.priority = undefined;

exports.version = '0.1.0';

exports.commands = {
    rot13: {
        handler: cryptCmd(function(s, payload, callback) {
            callback(null,
                s.replace( /[A-Za-z]/g, function(c) {
                    return String.fromCharCode(c.charCodeAt(0)
                        + (c.toUpperCase() <= 'M' ? 13 : -13 ));
                })
            );
        }),
        defaults: {},
        params: [],
        description: 'Rot13 encoding.'
    },
    reverse: {
        handler: cryptCmd(function(s, payload, callback) {
            callback(null, s.split('').reverse().join(''));
        }),
        defaults: {},
        params: [],
        description: 'Reverse input.'
    },
    xorbc: {
        handler: cryptCmd(function(s, payload, callback) {
            var key = payload.key,
                iv = 0;
            callback(null,
                s.replace( /./g, function(c, _, i) {
                    var k = key.charCodeAt(i % key.length) ^ iv;
                    iv = c.charCodeAt(0);
                    return String.fromCharCode(iv ^ k);
                }),
                payload.$command + '(' + key + ')'
            );
        }),
        defaults: {key: '42'},
        params: ['[key'],
        description: 'XOR with block chaining.'
    },
    rxorbc: {
        handler: cryptCmd(function(s, payload, callback) {
            var key = payload.key,
                iv = 0;
            callback(null,
                s.replace( /./g, function(c, _, i) {
                    var k = key.charCodeAt(i % key.length) ^ iv;
                    iv = c.charCodeAt(0) ^ k;
                    return String.fromCharCode(iv);
                }),
                payload.$command + '(' + key + ')'
            );
        }),
        defaults: {key: '42'},
        params: ['[key'],
        description: 'reverse XOR with block chaining.'
    },
    /* must be last - prevent random from randomly calling random */
    random: {
        handler: function(payload, callback) {
            var keys = Object.keys(exports.commands);
            var id = Math.floor((keys.length - 1) * Math.random());
            payload.$command = 'random(' + keys[id] + ')';
            exports.commands[keys[id]].handler(payload, callback);
        },
        defaults: {},
        params: [],
        description: 'Random encryption.'
    }
};

exports.onNotify = function (type, notification, topic, post, callback) {
    if (!post || !post.cleaned ||
        ['private_message', 'mentioned', 'replied'].indexOf(type) === -1) {
        return callback();
    }
    discourse.log('Randomly encrypting post\n');

    exports.commands.random.handler({
        $post: post,
        $type: type,
        $command: 'random'
    }, function(_, msg) {
        var text = msg.msg + '\n\n<small>Filed under: ' + msg.log.join(' → ');
        discourse.createPost(notification.topic_id,
            notification.post_number, text, function() {
                callback(true);
            });
    });
};

function cryptCmd(handler) {
    return function(payload, callback) {
        discourse.log('Encrypt ' + (payload.$draft ? 'draft' : 'post')
                + ' with ' + payload.$command);
        handler(payload.$draft || payload.$post.cleaned,
                payload,
                function(err, msg, log) {
                    callback(err, {
                        replaceMsg: true,
                        msg: msg,
                        log: [log || payload.$command]
                    });
                });
    };
}

exports.begin = function begin(browser) {
    discourse = browser;
};
