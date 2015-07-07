'use strict';
/**
 * Used for communicating to discourse and the web.
 * @module discourse
 * @author Accalia
 * @license MIT
 */

/**
 * Generate a type 4 UUID.
 *
 * I don't understand how this does what it does, but it works.
 * It's a lot slower than using node-uuid but i only need one
 * of these so its good enough
 * Source: http://jsperf.com/node-uuid-performance/19
 *
 * @returns {string} A type 4 UUID
 */
exports.uuid = function uuid() {

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
        function (c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
};

var fs = require('fs');
var request = require('request'),
    async = require('async'),
    xRegExp = require('xregexp').XRegExp,
    conf = require('./configuration').configuration,
    version = require('./version');
var csrf,
    jar = request.jar(),
    clientId = exports.uuid(),
    urlbase = conf.url || 'https://what.thedailywtf.com/',
    browser = request.defaults({
        rejectUnauthorized: false,
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
    /**
     * Known Post Actions
     *
     * @alias discourse.PostAction
     * @enum {number}
     */
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

/**
 * Set the bot to muted status until a time or query sleep status.
 *
 * Most actions that would create a post will fail with error 'Muted' if bot is
 * asleep
 *
 * @param {number} until Unix Timestamp representing time for the bot to unmute
 * @returns {number} current timestamp the bot is set to sleep until
 */
exports.sleep = function sleep(until) {
    if (until !== undefined) {
        sleepUntil = until;
    }
    return sleepUntil;
};

/**
 * Get the current version information
 *
 * @returns {Version} Active Version module
 */
exports.version = function () {
    return version;
};

/* eslint-disable no-console */
/**
 * Log a message to the console
 *
 * @param {*} message Message to log
 */
exports.log = function log(message) {
    console.log(addTimestamp(message));
};

/**
 * Log a warning to the console
 *
 * @param {*} message Warning to log
 */
exports.warn = function warn(message) {
    console.warn(addTimestamp(message));
};

/**
 * Log an error to the console
 *
 * @param {*} message Error to log
 */
exports.error = function error(message) {
    console.error(addTimestamp(message));
};
/* eslint-enable no-console */

/**
 * Schedule a GET request to discourse
 *
 * @param {string} url Site relative URL to fetch
 * @param {discourse~request} callback Response callback
 * @param {number} [delayAfter=0] Apply this rate limiting to requests
 */
function dGet(url, callback, delayAfter) {
    schedule(function () {
        browser.get(urlbase + url, handleResponse(callback));
    }, delayAfter);
}
exports.getForm = dGet;

/**
 * Schedule a POST request to discourse
 *
 * @param {string} url Site relative URL to post to
 * @param {Object} form Form to post
 * @param {discourse~request} callback Response callback
 * @param {number} [delayAfter=0] Apply this rate limiting to requests
 */
function dPost(url, form, callback, delayAfter) {
    schedule(function () {
        browser.post(urlbase + url, {
            form: form
        }, handleResponse(callback));
    }, delayAfter);
}
exports.postForm = dPost;

/**
 * Schedule a POST request to discourse
 *
 * @param {string} url Site relative URL to post to
 * @param {Object} form Form to post
 * @param {discourse~request} callback Response callback
 * @param {number} [delayAfter=0] Apply this rate limiting to requests
 */
function dPut(url, form, callback, delayAfter) {
    schedule(function () {
        browser.put(urlbase + url, {
            form: form
        }, handleResponse(callback));
    }, delayAfter);
}

/**
 * Schedule a DELETE request to discourse
 *
 * @param {string} url Site relative URL to post to
 * @param {Object} form Form to post
 * @param {discourse~request} callback Response callback
 * @param {number} [delayAfter=0] Apply this rate limiting to requests
 */
function dDelete(url, form, callback, delayAfter) {
    schedule(function () {
        browser.post(urlbase + url, {
            form: form
        }, handleResponse(callback));
    }, delayAfter);
}

/**
 * Issue a GET request and save result to filesystem
 *
 * @param {string} url Url to fetch
 * @param {string} filename Filename to save to
 * @param callback Completion callback
 */
exports.saveFile = function saveFile(url, filename, callback) {
    var strm = fs.createWriteStream(filename);
    strm.on('close', callback);
    browser.get(url).pipe(strm);
};

/**
 * Add timestamp to message.
 *
 * if `datestamp` configuration setting is truthy add UTC date and time, else
 * if `timestamp` configuration setting is truthy add UTC time, else
 * return message unaltered
 *
 * @param {*} message Message to timestamp
 * @returns {string} timestamped input message
 */
function addTimestamp(message) {
    var date = new Date().toISOString().replace(/\..+$/, '');
    if (conf.datestamp) {
        message = date.replace('T', ' ') + ' => ' + message;
    } else if (conf.timestamp) {
        message = date.replace(/^.+T/, '') + ' => ' + message;
    }
    return message;
}

/**
 * Apply normalization to a post.
 *
 * Add `cleaned` key that contains post raw with bbcode quotes removed
 * Alter trust_level key as follows:<br/>
 *<br/>
 * * If poster matches `admin.owner` configuration setting set TL to 9<br/>
 * * Else if poster is an admin set TL to 8<br/>
 * * Else if poster is a moderator set TL to 7<br/>
 * * Else if poster is a staff member set TL to 6<br/>
 * * Else if poster is a member of `admin.ignore` configuration list set TL to 0
 *<br/><br/>
 * add `url` and `reply_to` keys to the post
 *
 * @param {Post} post Discourse Post Object
 * @returns {CleanedPost} Cleaned Discourse Post Object
 */
function cleanPost(post) {
    if (post.raw) {
        post.cleaned = xRegExp.replace(post.raw, rQuote, '');
        post.cleaned = xRegExp.replace(post.cleaned, rCloseQuote, '');
    }
    // Don't have a choice about using non-camelcase here...
    /*eslint-disable camelcase*/
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
    /*eslint-enable camelcase*/
    return post;
}

/**
 * Schedule a task
 *
 * if `delayGroup` is provided will schedule such that tasks with the same value
 * for `delayGroup` will be executed at most once per `delayGroup` milliseconds
 *
 * @param {Function} task Task to schedule
 * @param {number} [delayGroup] Ensure task is rate limited to this rate
 *
 */
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

/**
 * Create a handler for HTTP requests
 *
 * @private
 * @param {discourse~request} callback Handler that should handle
 * @returns {discourse~request} Handler that processes response then hands
 *                              response to `callback`
 */
function handleResponse(callback) {
    /**
     * Handle response.
     *
     * Parse response body as JSON if response can be parsed as JSON
     */
    return function handleIt(err, resp, body) {
        if (!resp) {
            err = err || 'Unknown network error';
            exports.error('Critical error: ' + err);
            resp = {};
        }
        if (resp.statusCode === 429) {
            var msg = 'E429: Too Many Requests';
            if (resp.request) {
                var req = resp.request;
                if (req.method) {
                    msg += ', Method: ' + req.method;
                }
                if (request.url) {
                    msg += ', URL: ' + req.url;
                }
            }
            exports.warn(msg);
            delayUntil = new Date().getTime() + 2 * 60 * 1000;
        }
        try {
            body = JSON.parse(body);
        } catch (e) {} //eslint-disable-line no-empty
        callback(err, resp, body);
    };
}

/**
 * Log into Discourse
 *
 * Uses `username` and `password` configuration settings to login to discourse
 *
 * @param {discourse~request} callback Completion callback
 */
exports.login = function login(callback) {
    async.waterfall([
        function (next) {
            dGet('session/csrf.json', function (err, _, obj) {
                csrf = (obj || {}).csrf;
                //Turns out we sometimes have to explicity
                //re-set headers and the cookie jar
                //So we may as well do it every time!
                browser = browser.defaults({
                    rejectUnauthorized: false,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'User-Agent': version.userAgent.
                            replace('{{conf.admin.owner}}', conf.admin.owner).
                            replace('{{conf.username}}', conf.username),
                        'X-CSRF-Token': csrf
                    },
                    jar: jar
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

/**
 * Reply to a post.
 *
 * @param {Post} post Post object to reply to
 * @param {string} raw Raw post data
 * @param {discourse~request} callback Completion callback
 */
exports.reply = function reply(post, raw, callback) {
    createPost(post.topic_id, post.post_number, raw, callback);
};

/**
 * Create a post.
 *
 * @param {number} topic Id of the topic to reply to
 * @param {number} [replyTo=undefined] Post_number of the post replyied to
 * @param {string} raw Raw post data
 * @param {discourse~request} callback Completion callback
 * @param {boolean} [nomute] INTERNAL USE ONLY. Do not set!
 */
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

/**
 * Create a new private message.
 *
 * @param {string|string[]} to Username or names to create PM to
 * @param {string} title Title of the Private Message
 * @param {string} raw Raw post data
 * @param {discourse~request} callback Completion callback
 */
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

/**
 * Edit an existing post.
 *
 * @param {number} postId Id number of the post to edit
 * @param {string} raw New raw post data
 * @param {string} [editReason] Optional Edit Reason that no one ever uses
 * @param {discourse~request} callback Completion callback
 */
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

/**
 * Delete an existing post.
 *
 * @param {number} postId Id of the post to delete
 * @param {discourse~request} callback Completion callback
 */
exports.deletePost = function deletePost(postId, callback) {
    if (new Date().getTime() < sleepUntil) {
        return callback('Muted');
    }
    var form = {
        'id': postId
    };
    dDelete('posts/' + postId, form, callback, 6000);
};

/**
 * Perform a post action on a post
 *
 * @param {PostAction} action Action to perform
 * @param {number} postId Id of the post to act on
 * @param {string} [message] Content of any applicable moderation message
 * @param {discourse~request} callback Completion callback
 */
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

/**
 * Remove a post action from a post
 *
 * @param {PostAction} action Action to perform
 * @param {number} postId Id of the post to act on
 * @param {string} [message] Content of any applicable moderation message
 * @param {discourse~request} callback Completion callback
 */
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

/**
 * Read a lists of posts from a topic
 *
 * @param {number} topicId The topic the posts are from
 * @param {number[]} posts List of post_number fields from posts to read
 * @param {discourse~request} callback Completion callback
 */
exports.readPosts = function readPosts(topicId, posts, callback) {
    if (typeof posts === 'number') {
        posts = [posts];
    }
    async.whilst(function () {
        return posts.length > 0;
    }, function (next) {
        var part = [];
        while (posts.length > 0 && part.length < 200) {
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

/**
 * Get a specific post
 *
 * @param {number} postId Id of the post to retrieve
 * @param {discourse~request} callback Completion callback
 */
exports.getPost = function getPost(postId, callback) {
    dGet('posts/' + postId + '.json', function (err, resp, post) {
        callback(err, resp, cleanPost(post));
    });
};

/**
 * Get topic information
 *
 * @param {number} topicId Id of topic to get information about
 * @param {discourse~request} callback Completion callback
 */
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

/**
 * Get the last page of a topic.
 *
 * @param {number} topicId Id of topic to get information about
 * @param {discourse~singleenumeration} eachPost Callback to handle each post
 * @param {function} callback Completion callback
 */
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

/**
 * Get all posts in a topic
 *
 * @param {number} topicId Id of topic to get information about
 * @param {discourse~enumeration} eachChunk Callback to handle each chunk
 * @param {function} callback Completion callback
 */
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
                //TODO: i bet i can make this better by using Array.slice
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

/**
 * Get all topics visible to current user from /latest
 *
 * @param {discourse~enumeration} eachChunk Callback to handle each chunk
 * @param {function} callback Completion callback
 */
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

/**
 * Poll message-bus for messages
 *
 * @param {Object.<string, number>} channels Channels of interest
 * @param {discourse~request} callback Completion callback
 */
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

/**
 * Poll for notifications
 *
 * @param {discourse~request} callback Completion callback
 */
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

/**
 * Get user data for an arbitrary user. Will fail if bot is not at least
 * moderator status
 *
 * @param {string} username Target Username
 * @param {discourse~request} callback Completion callback
 */
exports.getUserData = function getUserData(username, callback) {
    username = username.toLowerCase();
    dGet('admin/users/' + username + '.json', function (err, resp, user) {
        if (err || resp.statusCode >= 300) {
            err = err || resp.statusCode + ' Error Retrieving User Info';
        }
        callback(err, user);
    });
};

/**
 * Discourse Request Callback
 * @callback discourse~request
 * @param {Exception} [err=null] Error encountered processing request
 * @param resp Raw response object from npm `request/request` package
 * @param {Object|string} body response body. If valid JSON will be parsed.
 */

/**
 * Discourse Cancellable Callback
 * @callback discourse~cancellable
 * @param {Exception} [err] Error encountered processing request
 * @param {boolean} [cancel] If truthy cancel enumeration
 */

/**
 * Discourse Single Enumeration Callback
 * @callback discourse~singleenumeration
 * @param {*} data Data item to be processed
 * @param {discourse~cancellable} callback Completion callback
 */

/**
 * Discourse List Enumeration Callback
 * @callback discourse~enumeration
 * @param {*} data Data items to be processed
 * @param {discourse~cancellable} callback Completion callback
 */
