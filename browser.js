'use strict';
/**
 * Webbrowser abstraction for communicating with discourse
 * @module browser
 * @license MIT
 */

const request = require('request'),
    async = require('async');

const utils = require('./utils');

/**
 * BBcode Quote Tag Parsing/Stripping Regexp
 *
 * Contributed by Flabdablet
 *
 * A BBCode quote tag is like
 *     [quote]
 * or
 *     [quote=anything-that-isn't-a-closing-bracket]
 *
 * and the regex uses (=[^\]]*)? to deal with the difference. The section that matches the closing tag \[\/quote] is
 * straightforward.
 *
 * The regex is supposed to match only the innermost of any nested BBCode quotes, so between the matching parts for
 * opening and closing tags, it matches only text that doesn't contain the sequence [quote= or [quote].
 *
 * This is done by a *? lazy-repeat match on
 *
 * (        a group containing
 *
 * [^\[]    anything that isn't a [
 * |        or
 *     (        a group containing
 *     \[       an opening square bracket followed by
 *     [^q]     anything that isn't a q
 *     |        or
 *         (        a group containing
 *         q        a q followed by
 *         [^u]     anything that isn't a u
 * ...
 *
 * The net effect is to match on text made of chunks that can be [quote as long as that isn't part of [quote= or
 * [quote], or [quot that isn't part of [quote, or [quo that isn't part of [quot, and so on all the way back to single
 * characters that aren't [.
 *
 * And just for icing on the line noise cake, all groups are specified as non-capturing (?: for speed.
 */
const rQuote = /\[quote(?:=[^\]]*)?](?:[^\[]|\[(?:[^q]|q(?:[^u]|u(?:[^o]|o(?:[^t]|t(?:[^e]|e[^=\]]))))))*?\[\/quote]/ig;
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
        defaults: defaults,
        rQuote: rQuote,
        rCode: /^```.*\n(?:.*\n)*?```\n/gm,
        rNewLine: /\r\n/g
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
 * Strip [quote] tags from input
 *
 * @param {string} input Input string to strip
 * @returns {string} Input after stripping [quote] tags
 */
function stripQuotes(input) {
    /*
    let result;
    while ((result = input.replace(internals.rQuote, '')) !== input) {
        input = result;
    }
    return result;
    */
    // Generate a string with no chance of pre-existing in the text.
    const placeholder = utils.uuid();

    // Repeatedly remove regex matches until nothing matches it
    // any more, thereby stripping out BBCode quotes from the most
    // deeply nested outward. Dump a placeholder into the text
    // to mark each edit.
    let edited;
    while ((edited = input.replace(internals.rQuote, placeholder)) !== input) {
        input = edited;
    }

    // Now strip out all the placeholders along with any unbalanced
    // quote tags that lead them.
    const garbage = new RegExp(
        '(?:\\[quote(?:=[^\\]]*)?][^]*?)?' + placeholder,
        'ig'
    );
    return edited.replace(garbage, '');
}
internals.stripQuotes = stripQuotes;

/**
 * Strip GFM fenced code blocks from input
 *
 * @param {string} input Input string to strip
 * @returns {string} Input after stripping GFM code blocks tags
 */
function stripCode(input) {
    input = input + '\n';
    const result = input.replace(internals.rCode, '');
    return result.replace(/\n$/m, '');
}
internals.stripCode = stripCode;

/**
 * Clean post raw
 *
 * @param {external.module_discourse.Post} post Post to clean
 * @param {string} post.raw Raw text of the post to clean
 * @returns {external.module_discourse.CleanedPost} input post with cleaned raw
 */
function cleanPost(post) {
    let text = post.raw || '';
    text = text.replace(internals.rNewLine, '\n');
    text = stripCode(text);
    text = stripQuotes(text);
    post.cleaned = text;
    return post;
}
internals.cleanPost = cleanPost;

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
