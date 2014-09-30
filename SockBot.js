/*jslint node: true, indent: 4, unparam: true, sloppy: true,  */

var async = require('async'),
    browser = require('./browser'),
    queue = require('./queue'),
    likes = require('./likes'),
    reader = require('./reader'),
    poster = require('./poster'),
    config = require('./configuration').configuration;


browser.auth(config.username, config.password, function () {
    if (config.likeBinge) {
        likes.likeThread(browser, config.likeBingeTopics);
    }
    if (config.readify){
        reader.readAllTheThings(browser);
    }
    queue.begin(browser);
    //poster.reply_topic(browser, 3547, '', 'can i reply to the topic?', function(){});
});