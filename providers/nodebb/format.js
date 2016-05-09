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
 * @param {string} topicSlug Slug of the topic to url
 * @param {number} postIndex Index of the post to url to in topic
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
