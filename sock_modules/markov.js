'use strict';
var fs = require('fs');
var accepted = ['private_message', 'mentioned', 'replied'],
    isReady = false,
    discourse,
    configuration,
    corpus,
    dictionary;

exports.name = 'Markov';
exports.priority = undefined;
exports.version = '0.1.0';
exports.description = 'Generate a response using a Markov chain';
exports.configuration = {
    enabled: false,
    corpus: 'markov/corpus.txt'
};

exports.begin = function (browser, config) {
    discourse = browser;
    configuration = config.modules[exports.name];
    if (configuration.corpus === null) {
        configuration.enabled = false;
    } else {
        loadCorpus();
    }
};

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

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
