'use strict';

exports.name = 'Todo';
exports.version = '0.5.0';
exports.description = 'Keep a Todo list for you';
exports.configuration = {
    enabled: false
};

var XRegExp = require('xregexp').XRegExp,
    async = require('async');
var database = require('../database');
var discourse,
    db,
    trigger,
    ready = false;

exports.begin = function begin(browser, config) {
    discourse = browser;
    database.getDatabase(exports.name, function (err, data) {
        ready = !err;
        db = data;
        db.createIndex({
            modified: -1,
            owner: 1
        });
        if (err) {
            discourse.warn('ToDo Startup Error: ' + err);
        }
    });
    trigger = new XRegExp('^@' + config.username +
        '\\s+([$](?<category>\\S+)\\s+)?(?<title>\\S.+)$', 'im');
};

exports.additionalHelp = function additionalHelp() {
    var text = [];
    text.push('To create a new task: @todo [description]');
    text.push('To create a new categorised task: @todo $[category] [description]');
    return text.join('\n');
}

exports.commands = {
    list: {
        handler: makeSafe(listTasks),
        defaults: {
            user: null,
            category: null,
            limit: 10
        },
        params: ['[category]', '[limit=10]'],
        description: 'List of your recent tasks in a category.'
    },
    type: {
        handler: manipulateTask(function (payload, doc, callback) {
            doc.type = payload.type;
            addComment(payload, doc, callback);
        }),
        defaults: {},
        params: ['key', 'type'],
        description: 'Set Task Type'
    },
    rename: {
        handler: manipulateTask(function (payload, doc, callback) {
            doc.title = payload.title;
            addComment(payload, doc, callback);
        }),
        defaults: {},
        params: ['key', 'title'],
        description: 'Set Task Title'
    },
    resolve: {
        handler: manipulateTask(function (payload, doc, callback) {
            doc.resolved = true;
            addComment(payload, doc, callback);
        }),
        defaults: {},
        params: ['key'],
        description: 'Resolve task'
    },
    reopen: {
        handler: manipulateTask(function (payload, doc, callback) {
            doc.resolved = false;
            addComment(payload, doc, callback);
        }),
        defaults: {},
        params: ['key'],
        description: 'Reopen task'
    },
    comment: {
        handler: manipulateTask(function (payload, doc, callback) {
            var txt = payload.$post.cleaned.trim();
            if (txt) {
                payload.$arguments.push('\n' + txt);
            }
            addComment(payload, doc, callback);
        }),
        defaults: {},
        params: ['key'],
        description: 'Comment on task'
    },
    category: {
        handler: manipulateTask(function (payload, doc, callback) {
            doc.category = payload.category || 'uncategorized';
            addComment(payload, doc, callback);
        }),
        defaults: {},
        params: ['key', 'category'],
        description: 'Set the task category'
    },
    describe: {
        handler: manipulateTask(function (payload, doc, callback) {
            var txt = payload.$post.cleaned.trim();
            if (txt) {
                payload.$arguments.push('\n' + txt);
            }
            doc.description = payload.$arguments.join(' ');
            payload.$arguments = [];
            addComment(payload, doc, callback);
        }),
        defaults: {},
        params: ['key'],
        description: 'Set Task Description'
    },
    parent: {
        handler: manipulateTask(function (payload, doc, callback) {
            payload.key = payload.parent;
            getTask(function (_, parent, innercallback) {
                if (parent.parent) {
                    return innercallback(null, 'Cannot assign a child task ' +
                        'as a parent task. Aborting!');
                }
                doc.parent = parent.key;
                addComment(payload, doc, innercallback);
            })(payload, callback);
        }),
        defaults: {},
        params: ['key', 'parent'],
        description: 'Assign task to a parent task'
    },
    details: {
        handler: getTask(function (_, doc, callback) {
            callback(null, getDetails(doc));
        }),
        defaults: {},
        params: ['key'],
        description: 'Display task details'
    },
    remind: {
        handler: manipulateTask(function (payload, doc, callback) {
            doc.remind = true;
            payload.$arguments = ['Set Reminder Flag'];
            addComment(payload, doc, callback);
        }),
        defaults: {},
        params: ['key'],
        description: 'Set task to remind via PM once.'
    },
    nag: {
        handler: manipulateTask(function (payload, doc, callback) {
            doc.remind = 2;
            payload.$arguments = ['Set Repeating Reminder Flag'];
            addComment(payload, doc, callback);
        }),
        defaults: {},
        params: ['key'],
        description: 'Set task to remind via PM daily.'
    },
    unremind: {
        handler: manipulateTask(function (payload, doc, callback) {
            doc.remind = false;
            payload.$arguments = ['Unset Reminder Flag'];
            addComment(payload, doc, callback);
        }),
        defaults: {},
        params: ['key'],
        description: 'Remove all PM reminders.'
    }
};

function addComment(payload, doc, callback) {
    doc.modified = payload.$post.created_at;
    if (payload.$arguments) {
        doc.comments = doc.comments || [];
        doc.comments.push({
            user: payload.$post.username,
            time: payload.$post.created_at,
            comment: payload.$arguments.join(' '),
            post: payload.$post.url
        });
    }
    callback(null, getSummary(doc));
}

function makeSafe(fn) {
    return function (type, command, args, data, callback) {
        if (!ready) {
            return callback();
        }
        fn(type, command, args, data, callback);
    };
}

exports.onNotify = function onNotify(_, __, topic, post, callback) {
    if (!ready || !post) {
        return callback();
    }
    var doc = createDocument(post, topic);
    if (!doc) {
        return callback();
    }
    db.save(doc, function (err, result) {
        var reply;
        if (err) {
            reply = 'An error occured: ' + err;
        } else {
            reply = getSummary(result);
        }
        discourse.reply(post, reply, callback);
    });
};

function getSummary(task) {
    return format('%type% [%slug%](%post%), (%owner%:%category%) %title%',
        task);
}

function getDetails(task) {
    try {
        var res = [
            format('**%type%:** %slug% [%title%](%post%)', task),
            format('**Category:** %category%', task),
            format('**Owner:** %owner%', task),
            format('**Created:** %created%', task),
            format('**Modified:** %modified%', task),
            format('**Resolved:** %resolved%', task),
            task.parent ? format('**Parent:** %parent%\n', task) : '',
            format('%description%', task),
            '', '---', (task.comments || []).filter(function (comment) {
                return (comment.comment || '').trim().length > 0;
            }).map(function (comment) {
                return format('[%user%@%time%](%post%): %comment%', comment);
            })
        ];
        return res.join('\n');
    } catch (e) {
        return e.message;
    }
}

function createDocument(post, topic) {
    var match = trigger.xexec(post.cleaned);
    if (!match) {
        return null;
    }
    var uuid = discourse.uuid(),
        ref = post.reply_to !== topic.url ? [post.reply_to] : null;
    return {
        type: 'Todo',
        owner: post.username,
        created: post.created_at,
        modified: post.created_at,
        topic: topic.url,
        post: post.url,
        parent: null,
        comments: [],
        references: ref,
        title: match.title,
        category: match.category || 'uncategorized',
        description: post.cleaned.replace(match[0], '').trim(),
        key: uuid,
        slug: uuid.split('-')[0],
        resolved: false
    };
}


function format(str, obj) {
    return str.replace(/%(\w+)%/g, function (match, p1) {
        return obj.hasOwnProperty(p1) ? obj[p1] : match;
    });
}

function getTask(operator) {
    return function action(payload, callback) {
        if (!ready) {
            return callback(null, null);
        }
        var query = {
            owner: payload.$post.username,
            $or: [{
                key: new RegExp('^' + payload.key, 'i')
            }, {
                title: new RegExp('^' + payload.key, 'i')
            }]
        };
        db.find({
            $query: query
        }, {
            limit: 2
        }).toArray(function (err, docs) {
            if (err) {
                return callback(err, null);
            } else if (!docs[0]) {
                return callback(null, 'No Tasks Found for Key `' + payload.key +
                    '`! Aborting');
            } else if (docs.length > 1) {
                return callback(null, 'Key `' + payload.key +
                    '` Matched Multiple Tasks! Aborting');
            }
            operator(payload, docs[0], function (err2, result) {
                return callback(err2, result);
            });
        });
    };
}

function manipulateTask(manipulator) {
    return getTask(function action(payload, doc, callback) {
        manipulator(payload, doc, function (err, result) {
            if (err) {
                return callback(err, null);
            }
            db.save(doc, function (err2) {
                callback(err2, result);
            });
        });
    });
}

function getDocuments(query, limit, each, finished) {
    db.find({
        $query: query
    }, {
        limit: limit,
        sort: [
            ['modified', 'desc']
        ]
    }).each(function (err, result) {
        if (err) {
            finished(err, null);
        } else if (result) {
            each(result);
        } else {
            finished(null, null);
        }
    });
}

function listTasks(payload, callback) {
    var res = ['Active ToDo List for ' + payload.$post.username],
        query = {
            resolved: false,
            owner: payload.$post.username
        };
    if (payload.category) {
        query.category = payload.category;
    }
    getDocuments(query, payload.limit, function (document) {
        res.push(getSummary(document));
    }, function (err) {
        if (res.length === 1) {
            res.push('[No Tasks Found]');
        }
        callback(err, res.join('\n'));
    });
}

function reminders(callback) {
    var query = {
        resolved: false,
        $or: [{
            remind: true
        }, {
            remind: 2
        }]
    };
    db.find({
        $query: query
    }, {
        limit: 2
    }).toArray(function (err, docs) {
        if (err) {
            return callback();
        }
        async.each(docs, function (document, next) {
            var txt = getDetails(document),
                payload = {
                    '$post': {
                        'created_at': new Date()
                    }
                };
            if (document.remind === true) {
                document.remind = false;
                payload.$arguments = [
                    'Sent Scheduled Reminder and Unset Reminder Flag'
                ];
            } else {
                payload.$arguments = ['Sent Scheduled Reminder'];
            }
            addComment(payload, document, function () {
                discourse.createPrivateMessage(document.owner,
                    'Reminder For: ' + document.title, txt,
                    function () {
                        setTimeout(next, 5.1 * 1000);
                    });
            });
        }, function () {
            callback();
        });
    });
}

function scheduleReminders() {
    async.forever(function (next) {
        var now = Date.now(),
            utc = new Date();
        utc.setUTCHours(0);
        utc.setUTCMinutes(0);
        utc.setUTCSeconds(0);
        utc.setMilliseconds(0);
        utc = utc.getTime() + 24 * 60 * 60 * 1000;
        setTimeout(function () {
            reminders(next);
        }, utc - now);
    });
}

scheduleReminders();
