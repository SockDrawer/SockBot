/**
 * @module browser
 * @class brower
 * @author Accalia
 * @license MIT
 * @overview Used for communicating to discourse and the web.
 */
'use strict';


/**
 * Generate a type 4 UUID.
 * I don't understand how this does what it does, but it works.
 * It's a lot slower than using node-uuid but i only need one
 * of these so its good enough
 * Source: http://jsperf.com/node-uuid-performance/19
 */
function uuid() {

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
        function (c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
}

var request = require('request'),
    async = require('async'),
    xRegExp = require('xregexp').XRegExp,
    conf = require('./configuration').configuration;
var version = 'SockBot 0.13.0 "Devious Daine"',
    csrf,
    jar = request.jar(),
    clientId = uuid(),
    browser = request.defaults({
        jar: jar,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': version + ' @' + conf.username
        }
    }),
    tag = '\n\n<!-- Posted by ' + version + ' on %DATE%-->',
    rQuote = xRegExp('\\[quote(?:(?!\\[/quote\\]).)*\\[/quote\\]', 'sgi'),
    rCloseQuote = xRegExp('\\[/quote\\]', 'sgi'),
    delayUntil = new Date().getTime(),
    postActionTypes = {
        'bookmark': 1,
        'like': 2,
        'off_topic': 3,
        'inappropriate': 4,
        'vote': 5,
        'notify_user': 6,
        'notify_moderators': 7,
        'spam': 8
    };


exports.log = function log(message) {
    console.log(addTimestamp(message));
};
exports.warn = function warn(message) {
    console.warn(addTimestamp(message));
};
exports.error = function error(message) {
    console.error(addTimestamp(message));
};

function dGet(url, callback) {
    var base = 'http://what.thedailywtf.com/';
    schedule(function () {
        browser.get(base + url, handleResponse(callback));
    });
}

function dPost(url, form, callback) {
    var base = 'http://what.thedailywtf.com/';
    schedule(function () {
        browser.post(base + url, {
            form: form
        }, handleResponse(callback));
    });
}

function dDelete(url, form, callback) {
    var base = 'http://what.thedailywtf.com/';
    schedule(function () {
        browser.post(base + url, {
            form: form
        }, handleResponse(callback));
    });
}


function addTimestamp(message) {
    var date = new Date().toISOString().replace(/\..+$/, '');
    if (conf.datestamp) {
        message = date.replace('T', ' ') + ' => ' + message;
    } else if (conf.timestamp) {
        message = date.replace(/^.+T/, '') + ' => ' + message;
    }
    return message;
}


function cleanPost(post) {
    if (post.raw) {
        post.cleaned = xRegExp.replace(post.raw, rQuote, '');
        post.cleaned = xRegExp.replace(post.cleaned, rCloseQuote, '');
    }
    return post;
}

function schedule(task) {
    var now = new Date().getTime();
    if (now > delayUntil) {
        delayUntil = now + 100;
        process.nextTick(task);
    } else {
        setTimeout(function () {
            schedule(task);
        }, delayUntil - now);
    }
}

function handleResponse(callback) {
    return function handleIt(err, resp, body) {
        if (!resp) {
            err = err || 'Unknown network error';
            exports.error('Critical error: ' + err);
            throw err;
        }
        if (resp.statusCode === 429) {
            exports.warn('E429: Too Many Requests');
            delayUntil = new Date().getTime() + 2 * 60 * 1000;
        }
        try {
            body = JSON.parse(body);
        } catch (e) {}
        callback(err, resp, body);
    };
}

exports.login = function login(callback) {
    async.waterfall([

        function (next) {
            dGet('session/csrf.json', function (err, resp, obj) {
                csrf = (obj || {}).csrf;
                browser = browser.defaults({
                    headers: {
                        'X-CSRF-Token': csrf
                    }
                });
                next(err);
            });
        },
        function (next) {
            dPost('session', {
                login: conf.username,
                password: conf.password
            }, function (err, resp, user) {
                conf.user = user;
                next(err, resp, user);
            });
        }
    ], callback);
};

exports.createPost = function createPost(topic, replyTo, raw, callback) {
    var form = {
        'raw': raw + tag.replace('%DATE%', new Date()),
        'topic_id': topic,
        'is_warning': false,
        'reply_to_post_number': replyTo,
        'category': '',
        'archetype': 'regular',
        'auto_close_time': ''
    };
    dPost('posts', form, function (err, resp, post) {
        post = cleanPost(post);
        callback(err, resp, post);
    });
};

exports.editPost = function editPost(postId, raw, editReason, callback) {
    if (typeof editReason === 'function') {
        callback = editReason;
        editReason = '';
    }
    var form = {
        'raw': raw,
        'edit_reason': editReason
    };
    dPost('posts/' + postId, form, function (err, resp, post) {
        post = cleanPost(post);
        callback(err, resp, post);
    });
};

exports.deletePost = function deletePost(postId, callback) {
    var form = {
        'id': postId
    };
    dDelete('posts/' + postId, form, callback);
};

exports.postAction = function postAction(action, postId, message, callback) {
    if (typeof message === 'function') {
        callback = message;
        message = '';
    }
    if (typeof action === 'string') {
        action = postActionTypes[action];
    }
    if (typeof action !== 'number') {
        callback('Action type not recognized!');
        return;
    }
    var form = {
        'id': postId,
        'post_action_type_id': action,
        'flag_topic': false,
        'message': message
    };
    dPost('post_actions', form, callback);
};

exports.deletePostAction = function deletePostAction(action,
    postId, message, callback) {
    if (typeof message === 'function') {
        callback = message;
        message = '';
    }
    if (typeof action === 'string') {
        action = postActionTypes[action];
    }
    if (typeof action !== 'number') {
        callback('Action type not recognized!');
        return;
    }
    var form = {
        'id': postId,
        'post_action_type_id': action,
        'flag_topic': false,
        'message': message
    };
    dDelete('post_actions', form, callback);
};

exports.readPosts = function readPosts(topicId, posts, callback) {
    if (typeof posts === 'number') {
        posts = [posts];
    }
    async.whilst(function () {
        return posts.length > 0;
    }, function (next) {
        var part = [];
        while (posts.length > 0 && part.length < 5) {
            part.push(posts.shift());
        }
        var form = {
            'topic_id': topicId,
            'topic_time': 4242
        };
        part.forEach(function (v) {
            form['timings[' + v + ']'] = 4242;
        });
        dPost('topics/timings', form, function (err, resp, data) {
            function doit() {
                next(err, resp, data);
            }
            if (err || posts.length === 0) {
                return doit();
            }
            return setTimeout(doit, 4242);
        });
    }, callback);
};

exports.getPost = function getPost(postId, callback) {
    dGet('posts/' + postId + '.json', function (err, resp, post) {
        callback(err, resp, cleanPost(post));
    });
};

exports.getPosts = function getPosts(topicId, start, number, callback) {
    var base = 't/' + topicId + '/posts.json';
    dGet(base + '?post_ids=0', function (err, resp, topic) {
        if (err || resp.statusCode >= 400) {
            err = err || 'Error ' + resp.statusCode;
            return callback(err, resp, topic);
        }
        var posts = topic.post_stream.stream,
            part = [],
            i;
        for (i = start - 1; i < start + number && posts[i]; i += 1) {
            part.push(posts[i]);
        }
        part = part.join('&post_ids[]=');
        dGet(base + '?post_ids[]=' + part, function (err, resp, posts) {
            if (err || resp.statusCode >= 400) {
                err = err || 'Error ' + resp.statusCode;
                return callback(err, resp, posts);
            }
            callback(null, posts.post_stream.posts.map(function (p) {
                return cleanPost(p);
            }));
        });
    });
};

exports.getAllPosts = function getAllPosts(topicId, eachChunk, complete) {
    var base = 't/' + topicId + '/posts.json?include_raw=1';
    dGet(base + '&post_ids=0', function (err, resp, topic) {
        if (err || resp.statusCode >= 400) {
            err = err || 'Error ' + resp.statusCode;
            return complete(err, resp, topic);
        }
        var posts = topic.post_stream.stream;
        async.whilst(
            function () {
                return posts.length > 0;
            },
            function (next) {
                var part = [];
                while (part.length < 200 && posts.length > 0) {
                    part.push(posts.shift());
                }
                part = part.join('&post_ids[]=');
                dGet(base + '&post_ids[]=' + part, function (err, resp, posts) {
                    if (err || resp.statusCode >= 400) {
                        err = err || 'Error ' + resp.statusCode;
                        return next(err, resp, posts);
                    }
                    eachChunk(null, posts.post_stream.posts.map(function (p) {
                        return cleanPost(p);
                    }), function () {
                        setTimeout(next, 500);
                    });
                });
            },
            complete
        );
    });
};

exports.getMessageBus = function getMessageBus(channels, callback) {
    var url = 'message-bus/' + clientId + '/poll';
    dPost(url, channels, function (err, resp, messages) {
        if (err || resp.statusCode >= 300) {
            err = err || 'Unknown message-bus error';
        }
        messages = messages || [];
        callback(err, resp, messages);
    });
};

exports.getNotifications = function getNotifications(callback) {
    dGet('notifications', function (err, resp, notifications) {
        if (err || resp.statusCode >= 300) {
            err = err || 'Unknown notifications error';
        }
        callback(err, resp, notifications);
    });
};
