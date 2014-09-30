/*jslint node: true, indent: 4, unparam: true  */
(function () {
    'use strict';
    var async = require('async'),
        config = require('./configuration').configuration;

    function post_topic(browser, category, title, content, callback) {
        var form = {
            raw: content,
            is_warning: false,
            category: category,
            archetype: 'regular',
            title: title,
            auto_close_time: ''
        };
        browser.postMessage('/posts', form, function (a, b, c) {
            console.log(c);
            callback();
        });
    }
    exports.post_topic = post_topic;

    function reply_topic(browser, topic, reply_to, content, callback) {
        var form = {
            raw: content,
            topic_id: topic,
            is_warning: false,
            reply_to_post_number: reply_to,
            category: '',
            archetype: 'regular',
            auto_close_time: ''
        };
        browser.postMessage('/posts', form, function (a, b, c) {
            console.log(c);
            callback();
        });
    }
    exports.reply_topic=reply_topic
}());