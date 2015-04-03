/*jslint node: true, indent: 4, regexp: true */
'use strict';
var spawn = require('child_process').spawn;
var configuration,
    discourse;

exports.description = 'Translate lojban text using la jbofi\'e';

exports.configuration = {
    enabled: false
};

exports.name = 'lojban';

exports.priority = undefined;

exports.version = '1.0.0';

exports.onNotify = function (type, notification, topic, post, callback) {
    if ((!configuration.enabled || !post || !post.cleaned) ||
        (['private_message', 'mentioned', 'replied'].indexOf(type) === -1)) {
        return callback();
    }
    var cleaner = /<\/?[a-z][^>]*>|\[\/?[a-z][^\]]*\]|@[a-z0-9_]+/ig;
    var text = post.cleaned.replace(cleaner, '');
    if (!text) {
        return callback();
    }

    var jbofihe = spawn('jbofihe', ['-x', '-b', '-w', '110']);
    var result = '    ';
    jbofihe.stdout.on('data', function(data) {
        result += data;
    });
    jbofihe.stderr.on('data', function(data) {
        result += data;
    });
    jbofihe.on('close', function() {
        discourse.createPost(notification.topic_id, notification.post_number,
            result.replace(/\n/g, '\n    '), function () {
                callback(true);
            });
    });
    jbofihe.stdin.write(text);
    jbofihe.stdin.end();
};

exports.begin = function begin(browser, config) {
    configuration = config.modules[exports.name];
    discourse = browser;
};
