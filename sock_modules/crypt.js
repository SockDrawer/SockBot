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

/* Each command is an encryption mechanism and has the following properties:
 * - handler:        The encryption function.
 * - defaults:       Default values of parameters
 * - params:         Named parameters for this function
 * - randomPickable: If true, random encryption can select this function.
 *                   NOTE: random currently does not support parameters.
 * - description:    A description of this function for the help
 */
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
        randomPickable: true,
        description: 'Rot13 encoding.'
    },
    reverse: {
        handler: cryptCmd(function(s, payload, callback) {
            callback(null, s.split('').reverse().join(''));
        }),
        defaults: {},
        params: [],
        randomPickable: true,
        description: 'Reverse input.'
    },
    xorbc: {
        handler: cryptCmd(xorbc(false)),
        defaults: {key: '42', iv: false},
        params: ['[key', '[iv'],
        description: 'XOR with block chaining.'
    },
    rxorbc: {
        handler: cryptCmd(xorbc(true)),
        defaults: {key: '42', iv: false},
        params: ['[key', '[iv'],
        description: 'reverse XOR with block chaining.'
    },
    random: {
        handler: function(payload, callback) {
            var keys = Object.keys(exports.commands).filter(function(k) {
                return exports.commands[k].randomPickable;
            });
            var id = Math.floor(keys.length * Math.random());
            payload.$command = 'random:' + keys[id];
            exports.commands[keys[id]].handler(payload, callback);
        },
        defaults: {},
        params: [],
        description: 'Random encryption.'
    }
};

/* Helper to chain encryptions */
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

/* xorbc implementatioon. Homegrown and weak as shit but who cares */
function xorbc(decrypt) {
    return function(s, payload, callback) {
        /* Key is always passed as argument. */
        var key = toCharCodes(payload.key);
        /* IV is passed, or zero */
        var iv = payload.iv ? toCharCodes(payload.iv) : zeroArray(key.length);
        if (key.length !== iv.length) {
            return callback('Key and IV must be the same length');
        }
        var log = payload.$command + '(key: ' + JSON.stringify(key)
                + ', iv: ' + JSON.stringify(iv) + ')';
        callback(null,
            toCharCodes(s).map( function(c, i) {
                /* Calculate key for this byte */
                var o = i % key.length,
                    k = key[o] ^ iv[o];
                /* Next block IV is this block's plaintext */
                if (decrypt) {
                    iv[o] = c ^ k;
                    return iv[o];
                } else {
                    iv[o] = c;
                    return iv[o] ^ k;
                }
            }).map( function(c) {
                return String.fromCharCode(c);
            }).join(''),
            log
        );
    };
}

/* Convert string to array of character codes */
function toCharCodes(s) {
    return s.split('').map(function(c) {
        return c.charCodeAt(0);
    });
}

/* Create array with constant value */
function zeroArray(l) {
    var a = [];
    for (var i = 0; i < l; i++) {
        a.push(0);
    }
    return a;
}

/* Use a random encryption when PMed/mentioned/replied without command */
exports.onNotify = function (type, notification, topic, post, callback) {
    if (!post || !post.cleaned ||
        ['private_message', 'mentioned', 'replied'].indexOf(type) === -1) {
        return callback();
    }
    discourse.log('Randomly encrypting post');

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

exports.begin = function begin(browser) {
    discourse = browser;
};
