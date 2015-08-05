'use strict';
/**
 * Data structure to manage post merging to prevent spamming
 * @module PostBuffer
 * @license MIT
 */

function PostBuffer(delay, callback) {
    if (!delay || typeof delay !== 'number') {
        throw 'delay must be supplied';
    }
    if (!callback || typeof callback !== 'function') {
        throw 'callback must be supplied';
    }
    this.buckets = [];
    this.delay = delay;
    this.callback = callback;
}

/**
 * Add details of a post to buffer
 *
 * @param {number} topicId Topic to post to
 * @param {number} [replyTo] Post Number in topic that this post is in reply to
 * @param {string} content Post Contents to post
 * @param {postedCallback} callback Completion callback
 */
PostBuffer.prototype.add = (topicId, replyTo, content, callback) => {
    const ctx = this;
    const key = {topicId: topicId, replyTo: replyTo};
    const keyString = 'T' + topicId + 'P' + replyTo; //Required for bucket labelling
    const value = {content: content, callback: callback};
    //Get or create bucket
    const bucket = ctx.buckets[keyString] || {};
    const values = bucket.values || [];
    bucket.values = values;
    ctx.buckets[keyString] = bucket;
    //Fill bucket
    clearTimeout(bucket.timer);
    values.push(value);
    bucket.timer = setTimeout(() => {
            ctx.callback(key, bucket.values);
            delete ctx.buckets[keyString];
        }, ctx.delay);
};

module.exports = PostBuffer;
