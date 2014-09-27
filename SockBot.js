/*jslint node: true, indent: 4, unparam: true, sloppy: true,  */

var async = require('async'),
    browser = require('./browser'),
    likes = require('./likes'),
    reader = require('./reader'),
    config = require('./configuration').configuration;


browser.auth(config.username, config.password, function () {
    if (config.likeBinge) {
        likes.likeThread(browser, config.likeBingeTopics);
    }
    if (config.readify){
        reader.readAllTheThings(browser);
    }
});