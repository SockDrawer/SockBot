/*jslint node: true, indent: 4, unparam: true, sloppy: true,  */

var async = require('async'),
    browser = require('./browser'),
    likes = require('./likes'),
    config = require('./configuration').configuration;



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

browser.auth(config.username, config.password, function () {
    console.log(config);
    if (config.likeBinge) {
        likes.likeThread(browser, config.likeBingeTopics);
    }
});