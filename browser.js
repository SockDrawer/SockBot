'use strict';
/**
 * Webbrowser abstraction for communicating with discourse
 * @module browser
 * @license MIT
 */

const config = require('./config');

const request = require('request'),
    async = require('async');

const signature = '\n\n<!-- Posted by a clever robot -->',
    defaults = {
        rejectUnauthorized: false,
        jar: request.jar(),
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'SockBot 2.0.x Angelic Ariel'
        }
    },
    internals = {
        request: request.defaults(defaults),
        queue: async.queue(queueWorker, 1),
        queueWorker: queueWorker,
        defaults: defaults,
        setTrustLevel: setTrustLevel,
        setPostUrl: setPostUrl,
        cleanPostRaw: cleanPostRaw,
        cleanPost: cleanPost,
        signature: signature,
        getCSRF: getCSRF
    },
    /**
     * SockBot Virtual Trust Levels
     *
     * @readonly
     * @enum
     */
    trustLevels = {
        /** Bot Owner Trust Level */
        owner: 9,
        /** Forum Admin Trust Level */
        admin: 8,
        /** Forum Moderator Trust Level */
        moderator: 7,
        /** Forum Staff Trust Level */
        staff: 6,
        /** Discourst trust_level 4 Trust Level */
        tl4: 4,
        /** Discourst trust_level 3 Trust Level */
        tl3: 3,
        /** Discourst trust_level 2 Trust Level */
        tl2: 2,
        /** Discourst trust_level 1 Trust Level */
        tl1: 1,
        /** Discourst trust_level 0 Trust Level */
        tl0: 0,
        /** Ignored User Trust Level */
        ignored: 0
    };
exports.trustLevels = trustLevels;

/**
 * Process browser tasks with rate limiting
 *
 * @param {object} task Task configuration
 * @param {string} [task.method=GET] HTTP method to request
 * @param {string} task.url Site relative URL to request
 * @param {object} [task.form] HTTP form to use in HTTP request
 * @param {browser~requestComplete} [task.callback] Callback toprovide request results to
 * @param {Number} [task.delay=0] Seconds to delay callback after request for additional rate limiting
 * @param {Function} callback Queue task complete callback
 */
function queueWorker(task, callback) {
    if (task.url && task.url[0] === '/') {
        task.url = config.core.forum + task.url;
    }
    internals.request({
        url: task.url,
        method: task.method || 'GET',
        form: task.form
    }, (e, _, body) => {
        try {
            body = JSON.parse(body);
        } catch (ignore) {} //eslint-disable-line no-empty
        if (task.callback && typeof task.callback === 'function') {
            setTimeout(() => task.callback(e, body), task.delay || 0);
        }
        setTimeout(callback, 5000);
    });
}

/**
 * Post content to an existing content
 *
 * @param {number} topicId Topic to post to
 * @param {number} [replyTo] Post Number in topic that this post is in reply to
 * @param {string} content Post Contents to post
 * @param {postedCallback} callback Completion callback
 */
exports.createPost = function createPost(topicId, replyTo, content, callback) {
    if (callback === undefined) {
        callback = content;
        content = replyTo;
        replyTo = undefined;
    }
    if (typeof callback !== 'function') {
        throw new Error('callback must be supplied');
    }
    internals.queue.push({
        method: 'POST',
        url: '/posts',
        form: {
            raw: content + internals.signature,
            'topic_id': topicId,
            'is_warning': false,
            'reply_to_post_number': replyTo,
            category: '',
            archetype: 'regular',
            'auto_close_time': ''
        },
        callback: (err, body) => {
            if (err) {
                return callback(err);
            }
            callback(null, cleanPost(body));
        }
    });
};

/**
 * Create a new private message.
 *
 * @param {string|string[]} to Username or names to create PM to
 * @param {string} title Title of the Private Message
 * @param {string} content Private Message contents
 * @param {postedCallback} callback Completion callback
 */
exports.createPrivateMessage = function createPrivateMessage(to, title, content, callback) {
    if (typeof callback !== 'function') {
        throw new Error('callback must be supplied');
    }
    internals.queue.push({
        method: 'POST',
        url: '/posts',
        form: {
            raw: content + internals.signature,
            'is_warning': false,
            'archetype': 'private_message',
            'title': title,
            'target_usernames': to
        },
        callback: (err, body) => {
            if (err) {
                return callback(err);
            }
            callback(null, cleanPost(body));
        }
    });
};

/**
 * Edit an existing post.
 *
 * @param {number} postId Id number of the post to edit
 * @param {string} content New post content
 * @param {string} [editReason] Optional Edit Reason that no one ever uses
 * @param {postedCallback} callback Completion callback
 */
exports.editPost = function editPost(postId, content, editReason, callback) {
    if (callback === undefined) {
        callback = editReason;
        editReason = '';
    }
    if (typeof callback !== 'function') {
        throw new Error('callback must be supplied');
    }
    internals.queue.push({
        method: 'PUT',
        url: '/posts/' + postId,
        form: {
            post: {
                raw: content + internals.signature,
                'edit_reason': editReason
            }
        },
        callback: (err, body) => {
            if (err) {
                return callback(err);
            }
            callback(null, cleanPost(body));
        }
    });
};

/**
 * get a CSRF token from discourse
 *
 * @param {completedCallback} callback Completion callback
 */
function getCSRF(callback) {
    if (typeof callback !== 'function') {
        throw new Error('callback must be supplied');
    }
    internals.queue.push({
        method: 'GET',
        url: '/session/csrf.json',
        callback: (err, data) => {
            if (err) {
                return callback(err);
            }
            const csrf = (data || {}).csrf;
            defaults.headers['X-CSRF-Token'] = csrf;
            internals.request = internals.request.defaults(defaults);
            callback(null);
        }
    });
}

/**
 * construct direct post link and direct in reply to link
 *
 * @see {@link ../external/posts/#external.module_posts.Post|Post}
 * @see {@link ../external/posts/#external.module_posts.CleanedPost|CleanedPost}
 *
 * @param {external.module_posts.Post} post Post to generate links for
 * @param {number} post.topic_id Topic Id that the input post belongs to
 * @param {string} post.topic_slug URL slug of the topic
 * @param {number} post.post_number Ordinal of the input post in topic.
 * @param {number} post.reply_to_post_number The post_number the input post is a reply to
 * @returns {external.module_posts.CleanedPost} input post with urls set
 */
function setPostUrl(post) {
    post.url = config.core.forum + '/t/' + post.topic_slug + '/' + post.topic_id + '/';
    // not using camelcase for consistency with discourse
    post.reply_to = post.url + (post.reply_to_post_number || ''); //eslint-disable-line camelcase
    post.url += post.post_number;
    return post;
}


/**
 * Normalize discourse trust level to SockBot Virtual Trust Level
 *
 * @see {@link ../external/posts/#external.module_posts.Post|Post}
 * @see {@link ../external/posts/#external.module_posts.CleanedPost|CleanedPost}
 *
 * @param {external.module_posts.Post} post Post to normalize trust levels on
 * @param {string} post.username Username of the post owner
 * @param {Number} post.trust_level Trust level of the post owner
 * @param {boolean} post.moderator Flags whether post owner has moderator powers
 * @param {boolean} post.admin Flags whether post owner has admin powers
 * @param {boolean} post.staff Flags whether post owner has staff powers
 * @returns {external.module_posts.CleanedPost} input post with normalized trust_level
 */
function setTrustLevel(post) {
    // Don't have a choice about using non-camelcase here...
    /*eslint-disable camelcase*/
    if (post.username === config.core.owner) {
        post.trust_level = trustLevels.owner;
    } else if (post.admin) {
        post.trust_level = trustLevels.admin;
    } else if (post.moderator) {
        post.trust_level = trustLevels.moderator;
    } else if (post.staff) {
        post.trust_level = trustLevels.staff;
    } else if (config.core.ignoreUsers.indexOf(post.username) >= 0) {
        post.trust_level = trustLevels.ignored;
    }
    /*eslint-enable camelcase*/
    return post;
}


/**
 * Clean post raw
 *
 * Provided and commented by flabdablet
 *
 * @see {@link ../external/posts/#external.module_posts.CleanedPost|CleanedPost}
 *
 * @param {external.module_posts.Post} post Post to clean
 * @param {string} post.raw Raw text of the post to clean
 * @returns {external.module_posts.CleanedPost} input post with cleaned raw
 */
function cleanPostRaw(post) {
    function hidetags(code) {
        return code.replace(/\[(?!\x10)/g, '[\x10'); //DLE
    }

    // Regexes to match various kinds of code block
    const fencedgreedy = /^````.*\n(?:.*\n)*```(?:\n|$)/gm;
    const fencedlazy = /^```(?:[^`\n].*)?\n(?:.*\n)*?```(?:\n|$)/gm;
    const inline = /(`+)[^]*?\1/g;


    let text = post.raw || '',
        // Normalize newlines
        edited = text.
    replace(/\r\n?/g, '\n').

    // Remove low-ASCII control chars except \t (\x09) and \n (\x0a)
    replace(/[\x00-\x08\x0b-\x1f]/g, '').

    // Disable bbcode tags inside all code blocks
    replace(fencedgreedy, hidetags).
    replace(fencedlazy, hidetags).
    replace(inline, hidetags).

    // Ease recognition of bbcode [quote] and
    // [quote=whatever] start tags
    replace(/\[quote(?:=[^[\]]*)?]/ig, '\x02$&'). //STX

    // Ease recognition of bbcode [/quote] end tags
    replace(/\[\/quote]/ig, '$&\x03'); //ETX

    // Repeatedly strip non-nested quoted blocks until
    // no more remain; this removes nested blocks from
    // the innermost outward. Leave markers in places
    // where blocks were removed.
    do {
        text = edited;
        edited = text.replace(/\x02[^\x02\x03]*\x03/g, '\x1a'); //SUB
    } while (edited !== text);

    // Remove any leftover unbalanced quoted text,
    // treating places where blocks were removed
    // as if they were the missing end tags
    post.cleaned = text.
    replace(/\x02[^\x1a]*\x1a/g, '\x1a').

    // Ensure that quote stripping never coalesces
    // adjacent backticks into new GFM fence markers
    replace(/^(`+)\x1a`/gm, '$1 `').

    // Remove leftover control characters
    replace(/[\x00-\x08\x0b-\x1f]/g, '').

    // Remove GFM-fenced code blocks
    replace(fencedgreedy, '').
    replace(fencedlazy, '');
    return post;
}

/**
 * Clean discourse post for processing
 *
 * @see {@link ../external/posts/#external.module_posts.Post|Post}
 * @see {@link ../external/posts/#external.module_posts.CleanedPost|CleanedPost}
 *
 * @param {external.posts.Post} post Input Post
 * @returns {external.posts.CleanedPost} Cleaned Post
 */
function cleanPost(post) {
    cleanPostRaw(post);
    setTrustLevel(post);
    setPostUrl(post);
    return post;
}

/**
 * Browser Request Callback
 *
 * @param {Exception} [err=null] Error encountered processing request
 * @param {Object} body JSON parsed response body. If invalid JSON will be `undefined`
 */
function requestComplete(err, body) {} //eslint-disable-line handle-callback-err, no-unused-vars

/**
 * Post Request Callback
 *
 * @see {@link ../external/posts/#external.module_posts.CleanedPost|CleanedPost}
 *
 * @param {Exception} [err=null] Error encountered processing request
 * @param {external.posts.CleanedPost} post Cleaned post
 */
function postedCallback(err, post) {} //eslint-disable-line handle-callback-err, no-unused-vars

/**
 * Completion Callback
 *
 * @param {Exception} [err=null] Error encountered processing request
 */
function completedCallback(err) {} //eslint-disable-line handle-callback-err, no-unused-vars

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.internals = internals;
    exports.stubs = {
        requestComplete: requestComplete,
        postedCallback: postedCallback,
        completedCallback: completedCallback
    };
}
