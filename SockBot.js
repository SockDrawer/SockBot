/*jslint node: true, indent: 4, unparam: true, sloppy: true,  */

var async = require('async'),
    browser = require('./browser'),
    queue = require('./queue'),
    likes = require('./likes'),
    reader = require('./reader'),
    config = require('./configuration').configuration;


browser.auth(config.username, config.password, function () {
    if (config.likeBinge) {
        likes.likeThread(config.likeBingeTopics);
    }
    if (config.readify) {
        reader.readAllTheThings(browser);
    }
    queue.begin(browser);

});