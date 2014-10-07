/*jslint node: true, indent: 4, todo: true */
(function () {
    'use strict';

    var async = require('async'),
        xRegExp = require('xregexp').XRegExp,
        matcher = '\\b(?<num>\\d+)(d(?<sides>\\d+)|(\\s?(?<method>S|SS|Scion|W|WW|Wolf|M|MM|Mage|F|FF|Fudge|Fate|C|CC|Coin)))(t(?<target>\\d+))?(?<options>[pr]+)?\\b',
        rmatcher = xRegExp(matcher, 'i'),
        m_browser,
        m_config;

    function getDiceFromServer(num, sides, callback) {
        m_browser.getContent('http://www.random.org/integers/?num=' + num + '&min=1&max=' + sides + '&col=1&base=10&format=plain&rnd=new', function (err, res, data) {
            if (err || res >= 300) {
                callback();
            } else {
                callback(data.trim().split("\n").map(function (v) {
                    return parseInt(v, 10);
                }));
            }
        });
    }

    function getError() {
        return m_config.errors[Math.floor(Math.random() * m_config.errors.length)];
    }

    function prerollDice(num, sides) {
        var dice,
            ct = 0,
            i,
            ones = 1,
            reducer = function reducer(i, o) {
                return i + o === 1 ? 1 : 0;
            };
        while (ones > 0) {
            dice = [];
            for (i = 0; i < num; i += 1) {
                dice.push((Math.floor(Math.random() * sides)) + 1);
            }
            ones = dice.reduce(reducer, 0);
            ct += 1;
        }
        return ct;
    }

    function rollXDice(match, callback) {
        var num = parseInt(match.num, 10),
            sides = parseInt(match.sides, 10),
            result = 'Rolling ' + num + 'd' + sides + ': ';

        if (isNaN(num) || isNaN(sides)) {
            callback(result + getError());
            return;
        }
        if (num > m_config.diceMaxDice) {
            callback(result + 'Error Too many dice requested');
            return;
        }
        if (sides === 1) {
            callback(result + 'Sum : ' + num);
            return;
        }
        if (match.options && match.options.toLowerCase().indexOf('p') >= 0) {
            result += 'Prerolling ' + prerollDice(num, sides) + ' times: ';
        }
        getDiceFromServer(num, sides, function (dice) {
            var sum = dice.reduce(function (i, v) {
                return i + v;
            }, 0);
            result += dice.join(', ');
            if (isNaN(sum)) {
                result += ' ' + getError();
            } else if (num > 1) {
                result += ' Sum: ' + sum;
            }
            callback(result);
        });
    }

    function rollDice(match, callback) {
        if (match.sides) {
            rollXDice(match, callback);
        } else {
            callback('Not implemented');
        }
    }

    function rollAllDice(input, callback) {
        var match = 1,
            pos = 0,
            results = [];
        async.until(
            function () {
                return !match;
            },
            function (next) {
                match = rmatcher.xexec(input, pos);
                if (match) {
                    pos = match.index + match[0].length;
                    if (results.length >= m_config.diceMaxRolls) {
                        results.push('Reached maximum dice roll. stopping.');
                        next(true);
                    } else {
                        rollDice(match, function (line) {
                            results.push(line);
                            next();
                        });
                    }
                } else {
                    next();
                }
            },
            function (err) {
                if (err) {
                    results.push(results.pop()); // TODO: figurter noop
                }
                callback(results);
            }
        );
    }

    exports.name = "DiceMaster 1.0.0";
    exports.onNotify = function (type, notification, post, callback) {
        if (!m_config.dicemaster || !post || !post.raw || ['private_message', 'mentioned', 'replied'].indexOf(type) === -1) {
            callback();
            return;
        }

        //8 and up is success in mage
        console.log(post.raw);

        rollAllDice(post.raw, function (dice) {
            var result = dice.join("\n\n").trim();
            if (result) {
                m_browser.reply_topic(notification.topic_id, notification.post_number, result, callback);
            } else {
                callback();
            }
        });
    };
    exports.begin = function begin(browser, config) {
        m_config = config;
        m_browser = browser;
    };
}());
