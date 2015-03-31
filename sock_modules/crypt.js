/*jslint node: true, indent: 4, regexp: true */
'use strict';
var async = require('async'),
    request = require('request');
var configuration,
    discourse,
    errors;
    
var crypts = {
    'rot13': function(s) {
        return s.replace( /[A-Za-z]/g, function(c) {
            return String.fromCharCode( c.charCodeAt(0) + (c.toUpperCase() <= "M" ? 13 : -13 ) );
        } );
    },
    'reverse': function(s) {
        return s.split("").reverse().join("");
    }
};

exports.description = 'Encryptor';

exports.configuration = {
    enabled: false
};

exports.name = 'Crypt';

exports.priority = undefined;

exports.version = '0.1.0';

function randCrypt() {
    var keys = Object.keys(crypts);
    return crypts[keys[Math.floor(keys.length * Math.random())]];
}

exports.onNotify = function (type, notification, topic, post, callback) {
    if ((!configuration.enabled || !post || !post.cleaned) ||
        (['private_message', 'mentioned', 'replied'].indexOf(type) === -1)) {
        return callback();
    }
    var cleaner = /(<\/?[a-z][^>]*>)/ig;
    var text = post.cleaned.replace(cleaner, '');
    var crypt = randCrypt()(text);
    
    discourse.createPost(notification.topic_id,
        notification.post_number, crypt, function() {
            callback(true);
        });
};

exports.begin = function begin(browser, config) {
    configuration = config.modules[exports.name];
    errors = config.errors;
    discourse = browser;
};
