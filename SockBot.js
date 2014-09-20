/*jslint node: true, indent: 4, unparam: true, sloppy: true,  */

var async = require('async'),
    browser = require('./browser'),
    queue = require('./queue'),
    likes = require('./likes');



function readTopic(topic_id, start_post, callback) {
    browser.getContent('t/' + topic_id + '/' + start_post + '.json', function (err, req, contents) {
        var stream = JSON.parse(contents);
        async.eachSeries(stream.post_stream.posts, function (x, cb) {
            var form = {
                'topic_id': topic_id,
                'topic_time': 1000 // msecs passed on topic (We're pretty sure)
            };
            form['timings[' + x.post_number + ']'] = 1000; // msecs passed on post (same)
            browser.postMessage('topics/timings', form, function () {
                setTimeout(cb, 500); // Rate limit these to better sout the occasion
            });
        }, function () {
            callback(null, stream.post_stream.posts.length);
        });
    });
}

function likeTopicPage(topic_id, start_post, callback) {
    browser.getContent('t/' + topic_id + '/' + start_post + '.json', function (err, req, contents) {
        var stream = JSON.parse(contents),
            likeables = stream.post_stream.posts.filter(function (x) {
                var action = x.actions_summary.filter(function (y) {
                    return y.id === 2;
                });
                return action && action[0].can_act;
            });
        async.eachSeries(likeables, function (x, cb) {
            var form = {
                'id': x.id,
                'post_action_type_id': 2,
                'flag_topic': false
            };
            console.log('Liking Post ' + x.post_number + '(#' + x.id + ') By `' + x.username + '`');
            browser.postMessage('post_actions', form, function () {
                setTimeout(cb, 300000); // Rate limit these to better sout the occasion
            });
        }, function () {
            callback(null, likeables.length);
        });
    });
}

browser.auth('sockbot', 'sockbotsockbot', function () {
    likes.likeThread(browser, 1000);
});