//'use strict';
//var fs = require('fs'),
//    path = require('path'),
//    async = require('async'),
//    nodehun = require('nodehun'),
//    spellcheck = require('nodehun-sentences');
//var discourse,
//    configuration,
//    dictionary,
//    username,
//    spellcheckerActive = false,
//    spellardSig = "<!-- Spellar'd by";

//exports.description = 'Automaticly trak adn corect speling misteaks';

//exports.configuration = {
//    enabled: false,
//    checkOwnPosts: false,
//    baseDictLocation: 'dictionaries',
//    baseDictName: 'en_US',
//    extraDictLocation: 'dictionaries',
//    extraDictNames: [],
//};

//exports.name = 'Spellar';
//exports.priority = undefined;
//exports.version = '0.1.0';

//exports.begin = function begin(browser, config) {
//    discourse = browser;
//    configuration = config.modules[exports.name];
//    username = config.username;
    
//    if (configuration.enabled) {
//        initialiseDictionary();
//    }
//}

//function initialiseDictionary() {
//    fs.readFile(path.join(configuration.baseDictLocation, configuration.baseDictName + '.aff'), function (err, data) {
//        if (err) {
//            discourse.error(err);
//            return;
//        }
//        var aff = data;
//        fs.readFile(path.join(configuration.baseDictLocation, configuration.baseDictName + '.dic'), function (err, data) {
//            if (err) {
//                discourse.error(err);
//                return;
//            }
//            var dic = data;
//            nodehun.createNewNodehun(aff, dic, function (err, dict) {
//                if (err) {
//                    discourse.error(err);
//                    return;
//                }
//                dictionary = dict;
//                spellcheckerActive = true;
//                discourse.log("Laoded dictonary " + configuration.baseDictName);
//                discourse.log("Spellar iz aktiv");
//                loadAddtitionalDictionaries();
//            });
//        });
//    });
//}

//function loadAddtitionalDictionaries() {
//    var dicts = configuration.extraDictNames;
//    if (Array.isArray(dicts)) {
//        async.eachSeries(dicts, function (dict, flow) {
//            fs.readFile(path.join(configuration.extraDictLocation, dict + '.dic'), function (err, data) {
//                if (err) {
//                    discourse.error(err);
//                } else {
//                    dictionary.addDictionary(data);
//                    discourse.log("Laoded dictonary " + dict);
//                }
//                flow(err);
//            });
//        }, function () {
//            discourse.log("Al dictonaries laoded");
//        });
//    }
//}

//exports.registerListeners = function registerListeners(callback) {
//    if (configuration.enabled && configuration.checkOwnPosts) {
//        callback(null, ['/latest']);
//    } else {
//        callback();
//    }
//}

//exports.onMessage = function onMessage(message, post, callback) {
//    if (message.data && message.data.topic_id && message.data.message_type === 'latest') {
//        discourse.getLastPosts(message.data.topic_id, function (post, flow) {
//            if (configuration.checkOwnPosts && post.yours && post.raw.indexOf(spellardSig) < 0) {
//                spellCheckPost(post, flow);
//                flow(null, true);
//            }
//            else {
//                flow();
//            }
//        }, function () {
//            callback();
//        });
//    } else {
//        callback();
//    }
//};

//function spellCheckPost(post, callback) {
//    discourse.log("Spellaring psot " + post.id);
//    spellcheck(dictionary, post.raw, function (err, typos) {
//        if (err) {
//            discourse.error(err);
//            callback();
//        }
//        // `typos` is an array of all typos, each one an object containing:
//        //   - `word`: the word which was considered a typo (string)
//        //   - `suggestions`: list of suggestions (array of strings)
//        //   - `positions`: list of positions where the typo was found (array of objects)
//        typos.forEach(function (typo) {
//            // Each entry in `typo.positions` contains the following keys:
//            //   - `from`: The start offset for the typo within the text (integer)
//            //   - `to`: The end offset for the typo within the text (integer)
//            //   - `length`: Word length (integer)
//        });
//        discourse.log("Psot " + post.id + " spellard");
        
//        //Sign the post so we don't spellar it again
//        post.raw += "\n\n" + spellardSig + " " + exports.name + " " + exports.version + "-->";
//        discourse.editPost(post.id, post.raw, "Spellard", callback);
//    });
//};