/*jslint node: true, indent: 4, regexp: true */
'use strict';
var async = require('async'),
    request = require('request');
var configuration,
    discourse,
    errors;

exports.description = 'Translate things... Badly';

exports.configuration = {
    enabled: false,
    translations: 10,
    randomizeOrder: true
};

exports.name = 'BadTranslator';

exports.priority = undefined;

exports.version = '1.13.0';

function randomize() {
    return Math.floor(Math.random() * 3) - 1;
}

function guessLanguage(text, callback) {
    var key = 'b9f08badbbd87567f65d97538a0838aa';
    request.post({url: 'http://ws.detectlanguage.com/0.2/detect',
            form: {'q': escape(text), 'key': key}},
            function (err, resp, body) {
                if (err || resp.statusCode >= 300) {
                    return callback(err || 'error response');
                }
                var lang = (JSON.parse(body)).data.detections[0];
                callback(lang);
            });
}

function loadLanguages(callback) {
    request.get('http://ackuna.com/cjs/badtranslator.js',
        function (err, resp, body) {
            if (err || resp.statusCode >= 300) {
                return callback(err || 'error response');
            }
            var lanRegExp = /languages\.push\((\{[^}]+\})\)/g,
                kvRegExp = /([^{,:]+)\:([^,}]+)/g,
                match,
                languages = [];
            match = lanRegExp.exec(body);
            while (match) {
                var lang = JSON.parse(match[1].replace(kvRegExp, '\"$1\":$2'));
                languages.push(lang);
                match = lanRegExp.exec(body);
            }
            callback(null, languages);
        });
}

function getTranslator() { //languages) {
    return 'Bing';
    /*var translators = [],
        bad = ['name', 'SDL', 'Babelfish'],
        name;
    for (name in languages[0]) {
        if (languages[0].hasOwnProperty(name) && bad.indexOf(name) === -1) {
            translators.push(name);
        }
    }
    translators.sort(randomize);
    return translators[0];*/
}

function getLanguages(languages, detected, num, translator) {
    var english,
        first,
        langs = languages.filter(function (v) {
            if (v[translator] === detected.language) {
                first = JSON.parse(JSON.stringify(v));
                first.name += '(Confidence: ' + detected.confidence + ' )';
            }
            if (v[translator] === 'en') {
                english = v;
            }

            return v[translator] !== detected.language &&
                    v[translator] !== 'en' &&
                    v[translator];
        }),
        i;

    var res = [first || english];

    if (configuration.randomizeOrder) {
        langs.sort(randomize);
    }
    for (i = 0; i < num && langs.length > 0; i += 1) {
        res.push(langs.pop());
    }

    res.push(english);
    return res;
}

function translate(text, languages, translator, callback) {
    var path = [],
        num = languages.length - 2,
        prev = languages.shift(),
        next;
    path.push(prev.name);
    async.whilst(function () {
        return languages.length > 0;
    }, function (nextStep) {
        next = languages.shift();
        request.get('http://ackuna.com/pages/ajax_translate?type=' +
            translator.toLowerCase() + '&text=' + encodeURIComponent(text) +
            '&src=' + prev[translator] + '&dst=' + next[translator],
            function (err, resp, body) {
                if (err || resp.statusCode >= 300) {
                    return nextStep(err || 'error response');
                }
                if (!body) {
                    text = errors[Math.floor(Math.random() * errors.length)];
                    path.push('Error');
                } else {
                    text = body;
                    path.push(next.name);
                }
                prev = next;
                nextStep();
            });
    }, function (err) {
        if (err) {
            return callback(err);
        }
        callback(null, 'After ' + num + ' translations ' + translator +
            ' says: ' + text + '\n\n<small>Filed under: ' + path.join(' -> '));
    });
}


exports.onNotify = function (type, notification, topic, post, callback) {
    if ((!configuration.enabled || !post || !post.cleaned) ||
        (['private_message', 'mentioned', 'replied'].indexOf(type) === -1)) {
        return callback();
    }
    var cleaner = /(<\/?[a-z][^>]*>)/ig;
    var text = post.cleaned.replace(cleaner, '').substring(0, 250);
    guessLanguage(text, function(detectedLanguage){
        loadLanguages(function (err, languages) {
            if (err) {
                return callback();
            }
            var trans = getTranslator(languages),
                langs = getLanguages(languages, detectedLanguage,
                    configuration.translations, trans);
            translate(text, langs, trans, function (err2, result) {
                if (err2) {
                    discourse.log(err2);
                    return callback();
                }
                discourse.createPost(notification.topic_id,
                    notification.post_number, result, function () {
                        callback(true);
                    });
            });
        });
    });
};

exports.begin = function begin(browser, config) {
    configuration = config.modules[exports.name];
    errors = config.errors;
    discourse = browser;
};
