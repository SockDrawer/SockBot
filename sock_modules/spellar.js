'use strict';
var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    nodehun = require('nodehun'),
    spellcheck = require('nodehun-sentences');
var discourse,
    configuration,
    dictionary,
    baseDictLocation,
    baseDictName,
    extraDictLocation,
    extraDictNames,
    spellcheckerActive = false,
    spellardSig = '<!-- Spellar\'d by';

exports.description = 'Automaticly trak adn corect speling misteaks';

exports.configuration = {
    enabled: false,
    checkOwnPosts: false,
    baseDictLocation: 'dictionaries',
    baseDictName: 'en_US',
    extraDictLocation: 'dictionaries',
    extraDictNames: []
};

exports.name = 'Spellar';
exports.priority = undefined;
exports.version = '0.1.0';

var fullName = exports.name + ' ' + exports.version;

exports.begin = function begin(browser, config) {
    discourse = browser;
    configuration = config.modules[exports.name];
    baseDictLocation = configuration.baseDictLocation;
    baseDictName = configuration.baseDictName;
    extraDictLocation = configuration.extraDictLocation;
    extraDictNames = configuration.extraDictNames;
    if (configuration.enabled) {
        initialiseDictionary();
    }
};

function initialiseDictionary() {
    var affFile = path.join(baseDictLocation, baseDictName + '.aff');
    var dicFile = path.join(baseDictLocation, baseDictName + '.dic');
    fs.readFile(affFile, function (err, data) {
        if (err) {
            discourse.error(err);
            return;
        }
        var aff = data;
        fs.readFile(dicFile, function (err2, data2) {
            if (err2) {
                discourse.error(err2);
                return;
            }
            nodehun.createNewNodehun(aff, data2, function (err3, dict) {
                if (err3) {
                    discourse.error(err3);
                    return;
                }
                dictionary = dict;
                spellcheckerActive = true;
                discourse.log('Laoded dictonary ' + baseDictName);
                discourse.log('Spellar iz aktiv');
                loadAddtitionalDictionaries();
            });
        });
    });
}

function loadAddtitionalDictionaries() {
    if (Array.isArray(extraDictNames)) {
        async.eachSeries(extraDictNames, function (dict, flow) {
            var dicFile = path.join(extraDictLocation, dict + '.dic');
            fs.readFile(dicFile, function (err, data) {
                if (err) {
                    discourse.error(err);
                } else {
                    dictionary.addDictionary(data);
                    discourse.log('Laoded dictonary ' + dict);
                }
                flow(err);
            });
        }, function () {
            discourse.log('Al dictonaries laoded');
        });
    }
}

exports.registerListeners = function registerListeners(callback) {
    if (configuration.enabled && configuration.checkOwnPosts) {
        callback(null, ['/latest']);
    } else {
        callback();
    }
};

exports.onMessage = function onMessage(message, post, callback) {
    if (spellcheckerActive && message.data && message.data.topic_id
        && message.data.message_type === 'latest') {
        discourse.getLastPosts(message.data.topic_id, function (post2, flow) {
            if (configuration.checkOwnPosts && post2.yours
                && post2.raw.indexOf(spellardSig) < 0) {
                spellCheckPost(post2, flow);
            } else {
                flow();
            }
        }, function () {
            callback();
        });
    } else {
        callback();
    }
};

/*TODO: actually spellar psots */
/*eslint-disable no-unused-vars*/
function spellCheckPost(post, callback) {
    discourse.log('Spellaring psot ' + post.id);
    var raw = post.raw;
    spellcheck(dictionary, raw, function (err, typos) {
        if (err) {
            discourse.error(err);
            callback();
        }
        // `typos` is an array, each one containing:
        // - `word`: the typo (string)
        // - `suggestions`: list of suggestions (string[])
        // - `positions`: list of positions (object[])
        typos.forEach(function (typo) {
            // `typo.positions` contains:
            // - `from`: start offset (int)
            // - `to`: end offset (int)
            // - `length`: length (int)
        });
        discourse.log('Psot ' + post.id + ' spellard');

        //Sign the post so we don't spellar it again
        raw += '\n\n' + spellardSig + ' ' + fullName + '-->';
        discourse.editPost(post.id, raw, fullName, function () {
            callback(null, true);
        });
    });
}
/*eslint-enable no-unused-vars*/
