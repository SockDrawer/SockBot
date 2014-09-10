/*jslint node: true, indent: 4, unparam: true, sloppy: true,  */

var async = require('async'),
    request = require('request'),
    jar = request.jar(),
    browser = request.defaults({
        jar: jar,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'SockAdept 1.0.0'
        }
    });

function getContent(url, callback) {
    browser.get('http://what.thedailywtf.com/' + url, callback);
}

function postMessage(url, form, callback) {
    browser.get('http://what.thedailywtf.com/session/csrf.json',
        function (a, b, c) {
            var csrf = '';
            try {
                csrf = JSON.parse(c).csrf;
            } catch (e) {
                callback(e);
            }
            browser.post('http://what.thedailywtf.com/' + url, {
                headers: {
                    'X-CSRF-Token': csrf
                },
                form: form
            }, callback);
        });
}

function auth(username, password, callback) {
    async.waterfall([

        function (cb) {
            postMessage('session', {
                login: username,
                password: password
            }, cb);
        },
        function (req, body, cb) {
            // Not needed for authentication but registers the login
            postMessage('login', {
                username: username,
                password: password,
                redirect: 'http://what.thedailywtf.com/'
            }, cb);
        }
    ], callback);
}


function readTopic(topic_id, start_post, callback) {
    getContent('t/' + topic_id + '/' + start_post + '.json', function (err, req, contents) {
        var stream = JSON.parse(contents);
        async.eachSeries(stream.post_stream.posts, function (x, cb) {
            var form = {
                'topic_id': topic_id,
                'topic_time': 1000 // msecs passed on topic (We're pretty sure)
            };
            form['timings[' + x.post_number + ']'] = 1000; // msecs passed on post (same)
            postMessage('topics/timings', form, function () {
                setTimeout(cb, 500); // Rate limit these to better sout the occasion
            });
        }, function () {
            callback(null, stream.post_stream.posts.length);
        });
    });
}

function likeTopicPage(topic_id, start_post, callback) {
    getContent('t/' + topic_id + '/' + start_post + '.json', function (err, req, contents) {
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
            console.log('Liking Post ' + x.id + ' By `' + x.username + '`');
            postMessage('post_actions', form, function () {
                setTimeout(cb, 60000); // Rate limit these to better sout the occasion
            });
        }, function () {
            callback(null, likeables.length);
        });
    });
}

auth('sockbot', 'sockbotsockbot', function () {
    likeTopicPage(1000, 1, function (err, posts) {
        console.log(posts);
    });
});