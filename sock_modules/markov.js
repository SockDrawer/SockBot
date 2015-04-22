/**
 * Markov Chain module. Responsible for automatically replying to summons and replies by using a Markov chain to generate content
 * @module markov
 */
'use strict';
var fs = require('fs');
var accepted = ['private_message', 'mentioned', 'replied'],
    isReady = false,
    discourse,
    configuration,
    corpus,
    dictionary;

/** Name of the module */
exports.name = 'Markov';

/** Priority of the module */
exports.priority = undefined;

/** Module version */
exports.version = '0.1.0';

/** Description of the module */
exports.description = 'Generate a response using a Markov chain';

/** 
 * Configuration properties.
 * @property enabled - Whether to use Markov or not. Defaults to false.
 * @property corpus - The location of the corpus file to use; must be a plan text file. Defaults to markov/corpus.txt; note that this file is part of the GitHub repo, and is liable to be replaced if you pull changes.
 */
exports.configuration = {
    enabled: false,
    corpus: 'markov/corpus.txt'
};

/**
 * Bootstrap the module.
 * @param {object} browser - The Discourse interface object
 * @param {object} config - The SockBot config object
 */
exports.begin = function (browser, config) {
    discourse = browser;
    configuration = config.modules[exports.name];
    if (configuration.corpus === null) {
        configuration.enabled = false;
    } else {
        loadCorpus();
    }
};

/**
 * Handle received notifications.
 * @param {object} type - The type of notification received
 * @param {object} notification - An object representing the notification that was received
 * @param {object} topic - An object representing the topic that the notification was about
 * @param {object} post - An object representing the post that the notification was about
 * @param {function} callback - The callback to use once the action is complete
 */
exports.onNotify = function(type, notification, topic, post, callback) {
    if (!isReady || !configuration.enabled || accepted.indexOf(type) === -1) {
        callback();
    } else {
        discourse.createPost(notification.topic_id,
            notification.post_number, markovPost(), function() {
                callback(true);
            });
    }
};

/**
 * Load the corpus to use.
 */
function loadCorpus() {
    isReady = false;
    fs.readFile(configuration.corpus, function (err, data) {
        if (err) {
            discourse.error(err);
            return;
        }
        corpus = data.toString().split(/\s/);
        if (corpus.length < 3) {
            discourse.warn('Corpus must contain at least three words');
            return;
        }
        dictionary = {};
        for (var i = 0; i < corpus.length - 2; i++) {
            var key = [corpus[i], corpus[i + 1]];
            var value = corpus[i + 2];
            if (dictionary[key] === undefined) {
                dictionary[key] = [value];
            } else {
                dictionary[key].push(value);
            }
        }
        isReady = true;
    });
}

/**
 * Generate post content using the Markov chain.
 * @returns {string} The post content
 */
function markovPost() {
    var length = randomIntFromInterval(10, 100);
    var seed = randomIntFromInterval(0, corpus.length - 3);

    //Build the string backwards
    var post = [corpus[seed + 1], corpus[seed]];
    while (post.length < length) {
        var key = [post[1], post[0]];
        var candidates = dictionary[key];
        var index = randomIntFromInterval(0, candidates.length - 1);
        post.unshift(candidates[index]);
    }
    return post.reverse().join(' ');
}

/**
 * Generate a random number in the specified range.
 * @param {number} min - The lower bound of the range
 * @param {number} max - The upper bound of the range
 * @returns {number} The generated number
 */
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
