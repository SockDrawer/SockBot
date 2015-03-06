'use strict';

exports.name = 'Todo';
exports.version = '0.5.0';
exports.description = 'Keep a Todo list for you';
exports.configuration = {
    enabled: false
};

var XRegExp = require('xregexp').XRegExp;
var db = require('../persist');
var discourse,
    trigger;

exports.begin = function begin(browser, config){
    discourse = browser;
    trigger = new XRegExp('^@'+config.username+'\\s+(\\w.+)$','im');
};

exports.onNotify = function onNotify(type, notification, topic, post, callback){
    var title = trigger.exec(post.cleaned);
    if (!title){
        return callback();
    }
    discourse.reply(notification, title[1], callback);
};