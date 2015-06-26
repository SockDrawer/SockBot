'use strict';
/**
 * Webbrowser abstraction for communicating with discourse
 * @module browser
 * @license MIT
 */

const request = require('request'),
    async = require('async');

const defaults = {
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
        defaults: defaults
    };

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
 * Clean post raw
 *
 * Provided and commented by flabdablet
 *
 * @param {external.module_posts.Post} post Post to clean
 * @param {string} post.raw Raw text of the post to clean
 * @returns {external.module_posts.CleanedPost} input post with cleaned raw
 */
function cleanPostRaw(post) {
    let text = post.raw || '',
        // Normalize newlines
        edited = text.
    replace(/\r\n?/g, '\n').

    // Remove low-ASCII control chars except \t (\x09) and \n (\x0a)
    replace(/[\x00-\x08\x0b-\x1f]/g, '').

    // Remove GFM-fenced code blocks
    replace(/^````.*\n(?:.*\n)*```(?:\n|$)/gm, '').
    replace(/^```.*\n(?:.*\n)*?```(?:\n|$)/gm, '').

    // Disable bbcode tags inside inline code blocks
    replace(/(`+)[^`][^]*?\1/, code => code.replace(/\[/g, '[\x10')). //DLE

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
    // adjacent backticks into bogus GFM fence markers
    replace(/^(`+)\x1a`/gm, '$1 `').

    // Remove leftover control characters
    replace(/[\x00-\x08\x0b-\x1f]/g, '');

    return post;
}
internals.cleanPostRaw = cleanPostRaw;

/**
 * Browser Request Callback
 *
 * @param {Exception} [err=null] Error encountered processing request
 * @param {Object} body JSON parsed response body. If invalid JSON will be `undefined`
 */
function requestComplete(err, body) {} //eslint-disable-line handle-callback-err, no-unused-vars
internals.requestComplete = requestComplete;

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.internals = internals;
}
