'use strict';
var async = require('async');
var discourse,
    configuration;

exports.description = 'Read All The Things!';

exports.configuration = {
    enabled: false,
    readWait: 3 * 24 * 60 * 60 * 1000
};

exports.name = 'Readify';

exports.priority = undefined;

exports.version = '0.12.0';


function readify(callback) {
    discourse.getAllTopics(function (topics, next) {
        async.eachSeries(topics, function (topic, flow) {
            discourse.log('Reading topic `' + topic.slug + '`');
            readTopic(topic.id, flow);
        }, next);
    }, function (err) {
        if (err) {
            discourse.warn('Read ended with error: ' + err);
        }
        callback();
    });
}

function readTopic(topic, callback) {
    var now = new Date().getTime() - configuration.readWait;
    discourse.getAllPosts(topic, function (err, posts, next) {
        posts = posts.filter(function (post) {
            return !post.read &&
                Date.parse(post.created_at) < now;
        });
        if (!posts) {
            return next();
        }
        discourse.readPosts(topic, posts.map(function (p) {
            return p.post_number;
        }), next);
    }, callback);
}

exports.begin = function begin(browser, config) {
    discourse = browser;
    configuration = config.modules[exports.name];

    if (configuration.enabled) {
        async.forever(function (next) {
            readify(function () {
                setTimeout(next, 24 * 60 * 60 * 1000);
            });
        });
    }
};
