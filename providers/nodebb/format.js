'use strict';

/**
 * Generate a permalink for a post
 *
 * @param {!number} postId Id or the post to url
 * @returns {string} Absolute URL for post
 */
exports.urlForPost = function postLink(postId) {
    return `/post/${postId}`;
};

/**
 * Generate a link for a topic
 *
 * @param {!number} topicId Id of the topic to url
 * @param {string} [topicSlug] Slug of the topic to url
 * @param {number} [postIndex] Index of the post to url to in topic
 * @returns {string} Absolute URL for topic
 */
exports.urlForTopic = function linkTopic(topicId, topicSlug, postIndex) {
    if (typeof topicSlug === 'number' && !postIndex) {
        // No slug provided. i can deal with that
        postIndex = topicSlug;
        topicSlug = 'topic';
    }
    if (!postIndex) {
        postIndex = '';
    }
    if (!topicSlug) {
        topicSlug = '';
    }
    const url = `/topic/${topicId}/${topicSlug}/${postIndex}`;
    return url.replace(/\/*$/, '');
};

/**
 * Turn input text into a forum quote
 *
 * @param {!string} text Text to quote
 * @param {string} [quotedUser] User who said the quote
 * @param {string} [contextUrl] Url to the quoted post
 * @param {string} [contextTitle] Title of the quote context link
 * @returns {string} quoted text, with attribution if username provided
 */
exports.quoteText = function quoteText(text, quotedUser, contextUrl, contextTitle) {
    const parts = text.split(/\n/).map((line) => `> ${line}`);
    if (quotedUser) {
        let attribution = `@${quotedUser}`;
        if (contextUrl) {
            if (contextTitle) {
                attribution += ` said in [${contextTitle}](${contextUrl}):`;
            } else {
                attribution += ` [said](${contextUrl}):`;
            }
        } else {
            attribution += ' said:';
        }
        parts.unshift(attribution);
    }
    return parts.join('\n');
};
