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
exports.uuid = uuid;

var fs = require('fs');
var request = require('request'),
    async = require('async'),
    xRegExp = require('xregexp').XRegExp,
    conf = require('./configuration').configuration,
    version = require('./version');
var csrf,
    jar = request.jar(),
    clientId = uuid(),
    urlbase = conf.url || 'http://what.thedailywtf.com/',
    browser = request.defaults({
        jar: jar,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': version.userAgent.
                replace('{{conf.admin.owner}}', conf.admin.owner).
                replace('{{conf.username}}', conf.username)
        }
    }),
    tag = version.signature.replace('{{conf.admin.owner}}', conf.admin.owner),
    rQuote = xRegExp('\\[quote(?:(?!\\[/quote\\]).)*\\[/quote\\]', 'sgi'),
    rCloseQuote = xRegExp('\\[/quote\\]', 'sgi'),
    delayUntil = new Date().getTime(),
    sleepUntil = new Date().getTime() - 1,
    postActionTypes = {
        'bookmark': 1,
        'like': 2,
        'off_topic': 3,
        'inappropriate': 4,
        'vote': 5,
        'notify_user': 6,
        'notify_moderators': 7,
        'spam': 8
    },
    notificationLevels = {
        'muted': 0,
        'regular': 1,
        'tracking': 2,
        'watching': 3
    },
    delays = {};

exports.sleep = function sleep(until) {
    if (until !== undefined) {
        sleepUntil = until;
    }
    return sleepUntil;
};

exports.version = function () {
    return version;
};

/* eslint-disable no-console */
exports.log = function log(message) {
    console.log(addTimestamp(message));
};
exports.warn = function warn(message) {
    console.warn(addTimestamp(message));
};
exports.error = function error(message) {
    console.error(addTimestamp(message));
};
/* eslint-enable no-console */

function dGet(url, callback, delayAfter) {
    schedule(function () {
        browser.get(urlbase + url, handleResponse(callback));
    }, delayAfter);
}
exports.getForm = dGet;

function dPost(url, form, callback, delayAfter) {
    schedule(function () {
        browser.post(urlbase + url, {
            form: form
        }, handleResponse(callback));
    }, delayAfter);
}
exports.postForm = dPost;

function dPut(url, form, callback, delayAfter) {
    schedule(function () {
        browser.put(urlbase + url, {
            form: form
        }, handleResponse(callback));
    }, delayAfter);
}
exports.putForm = dPut;

function dDelete(url, form, callback, delayAfter) {
    schedule(function () {
        browser.post(urlbase + url, {
            form: form
        }, handleResponse(callback));
    }, delayAfter);
}
exports.deleteForm = dDelete;

exports.saveFile = function saveFile(url, filename, callback) {
    var strm = fs.createWriteStream(filename);
    strm.on('close', callback);
    browser.get(url).pipe(strm);
};

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
    // Don't have a choice about using non-camelcase here...
    /*eslint-disable camelcase, max-depth */
    if (post.username === conf.admin.owner) {
        post.trust_level = 9;
    } else if (post.admin) {
        post.trust_level = 8;
    } else if (post.moderator) {
        post.trust_level = 7;
    } else if (post.staff) {
        post.trust_level = 6;
    } else if (conf.admin.ignore.indexOf(post.username) >= 0) {
        post.trust_level = 0;
    }

    post.url = urlbase + 't/' + post.topic_slug + '/' + post.topic_id + '/';
    post.reply_to = post.url + (post.reply_to_post_number || '');
    post.url += post.post_number;
    /*eslint-enable camelcase, max-depth */
    return post;
}

function schedule(task, delaygroup) {
    var now = new Date().getTime();
    if (delaygroup) {
        var delay = delays['g' + delaygroup] || now - 1;
        if (now < delay) {
            return setTimeout(function () {
                schedule(task, delaygroup);
            }, delayUntil - now);
        }
        delays['g' + delaygroup] = now + delaygroup;
    }
    if (now > delayUntil) {
        delayUntil = now + 100;
        process.nextTick(task, delaygroup);
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
        } catch (e) {} //eslint-disable-line no-empty
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


exports.reply = function reply(post, raw, callback) {
    createPost(post.topic_id, post.post_number, raw, callback);
};

function createPost(topic, replyTo,
    raw, callback, nomute) {
    if (!nomute && new Date().getTime() < sleepUntil) {
        return callback('Muted');
    }
    var form = {
        'raw': raw + tag,
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
    }, 6000);
}
exports.createPost = createPost;

exports.createPrivateMessage = function createPrivateMessage(to, title,
    raw, callback) {
    var form = {
        'raw': raw + tag,
        'is_warning': false,
        'archetype': 'private_message',
        'title': title,
        'target_usernames': to
    };
    dPost('posts', form, function (err, resp, post) {
        post = cleanPost(post);
        callback(err, resp, post);
    }, 6000);
};

exports.editPost = function editPost(postId, raw, editReason, callback) {
    if (new Date().getTime() < sleepUntil) {
        return callback('Muted');
    }
    if (typeof editReason === 'function') {
        callback = editReason;
        editReason = '';
    }
    var form = {
        'post': {
            'raw': raw,
            'edit_reason': editReason
        }
    };
    dPut('posts/' + postId, form, function (err, resp, post) {
        post = cleanPost(post);
        callback(err, resp, post);
    }, 6000);
};

exports.deletePost = function deletePost(postId, callback) {
    if (new Date().getTime() < sleepUntil) {
        return callback('Muted');
    }
    var form = {
        'id': postId
    };
    dDelete('posts/' + postId, form, callback, 6000);
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
        dGet(base + '?post_ids[]=' + part, function (err2, resp2, posts2) {
            if (err2 || resp2.statusCode >= 400) {
                err2 = err2 || 'Error ' + resp2.statusCode;
                return callback(err2, resp2, posts2);
            }
            callback(null, posts2.post_stream.posts.map(function (p) {
                return cleanPost(p);
            }));
        });
    });
};

exports.getTopic = function getTopic(topicId, callback) {
    dGet('t/' + topicId + '.json?include_raw=1', function (err, resp, topic) {
        if (err || resp.statusCode >= 400) {
            err = err || 'Error ' + resp.statusCode;
        }
        delete topic.post_stream;
        delete topic.details.links;
        delete topic.details.participants;
        delete topic.details.suggested_topics;
        // Don't have a choice about using non-camelcase here...
        /*eslint-disable camelcase */
        topic.details.notification_level_text = 'unknown';
        /*eslint-enable camelcase */
        for (var type in notificationLevels) {
            if (notificationLevels[type] === topic.details.notification_level) {
                // Don't have a choice about using non-camelcase here...
                /*eslint-disable camelcase */
                topic.details.notification_level_text = type;
                /*eslint-enable camelcase */
            }
        }
        topic.url = urlbase + 't/' + topic.slug + '/' + topic.id;
        return callback(err, resp, topic);
    });
};

exports.getLastPosts = function getLastPosts(topicId, eachPost, complete) {
    var url = 't/' + topicId + '/last.json?include_raw=1&track_visit=true';
    dGet(url, function (err, resp, topic) {
        if (err || resp.statusCode >= 400) {
            err = err || 'Error ' + resp.statusCode;
        }
        //Reverse posts so the most recent ones are first
        var posts = topic.post_stream.posts.reverse();
        async.eachSeries(posts, function (post, flow) {
            eachPost(post, function (err2, handled) {
                //Stop processing posts if the caller flags it handled
                flow(err2 || handled);
            });
        }, complete);
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
                dGet(base + '&post_ids[]=' + part,
                    function (err2, resp2, posts2) {
                        if (err2 || resp2.statusCode >= 400) {
                            err2 = err2 || 'Error ' + resp2.statusCode;
                            return next(err2, resp2, posts);
                        }
                        eachChunk(null,
                            posts2.post_stream.posts.map(function (p) {
                                return cleanPost(p);
                            }),
                            function (err3) {
                                setTimeout(function () {
                                    next(err3);
                                }, 500);
                            });
                    });
            },
            complete
        );
    });
};

exports.getAllTopics = function getAllTopics(eachChunk, complete) {
    var url = '/latest.json?no_definitions=true';
    async.whilst(function () {
        return url;
    }, function (next) {
        dGet(url, function (err, resp, latest) {
            if (err || resp.statusCode >= 300) {
                return next(err ||
                    'Non success status code provided:' + resp.statusCode);
            }
            url = latest.topic_list.more_topics_url;
            eachChunk(latest.topic_list.topics, next);
        });
    }, complete);
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
        dPost('notifications/reset-new', '', function (err2) {
            callback(err || err2, resp, notifications);
        });
    });
};

exports.getUserData = function getUserData(username, callback) {
    username = username.toLowerCase();
    dGet('admin/users/' + username + '.json', function (err, resp, user) {
        if (err || resp.statusCode >= 300) {
            err = err || resp.statusCode + ' Error Retrieving User Info';
        }
        callback(err, user);
    });
};
