/*jslint node: true, indent: 4, todo: true */
(function () {
    'use strict';

    var async = require('async'),
        xRegExp = require('xregexp').XRegExp,
        parser,
        m_browser,
        m_config;

    //The parse is complicated. don't let it leak
    (function () {
        var p_num = '(?<num>-?\\d+)',
            p_sides = '(?<sides>-?\\d+)',
            p_method = '(?<method>W|Wolf|F|Fate|Fudge)',
            p_target = '(?:t(?<target>\\d+))',
            p_bonus = '(?:b(?<bonus>-?\\d+))',
            p_options = '(?<options>[pfrs]+)',
            p_matcher = '\\b' + p_num + '?d(' + p_sides + '|' + p_method + ')(?<optional>' + p_target + '|' + p_bonus + '|' + p_options + ')*\\b',
            r_target = xRegExp(p_target, 'i'),
            r_bonus = xRegExp(p_bonus, 'i'),
            r_options = xRegExp(p_options, 'i'),
            r_matcher = xRegExp(p_matcher, 'i');
        parser = function parser(input, each, complete) {
            var match = 1,
                pos = 0;
            async.until(
                function () {
                    return !match;
                },
                function (next) {
                    var target,
                        bonus,
                        options,
                        inner,
                        matched = {};
                    match = r_matcher.xexec(input, pos);
                    if (match) {
                        inner = match[0] || '';
                        target = r_target.xexec(inner);
                        bonus = r_bonus.xexec(inner);
                        options = r_options.xexec(inner);

                        matched.num = match.num ? parseInt(match.num, 10) : undefined;
                        matched.sides = match.sides ? parseInt(match.sides, 10) : undefined;
                        matched.method = match.method ? match.method.toLowerCase() : undefined;
                        matched.target = (target && target.target) ? parseInt(target.target, 10) : undefined;
                        matched.options = ((options || {}).options || '').toLowerCase();
                        matched.bonus = (bonus && bonus.bonus) ? parseInt(bonus.bonus, 10) : undefined;
                        matched.reroll = matched.options.indexOf('r') !== -1;
                        matched.preroll = matched.options.indexOf('p') !== -1;
                        matched.sort = matched.options.indexOf('s') !== -1;
                        matched.fails = matched.options.indexOf('f') !== -1;
                        pos = match.index + match[0].length - 1;
                        each(matched, next);
                    } else {
                        next(true);
                    }
                },
                complete
            );

        };
    }());

    function getDiceFromServer(num, sides, rerollGreater, callback) {
        var factor = sides < 0 ? -1 : 1,
            results = [],
            sum = 0,
            toRoll;
        rerollGreater = Math.abs(rerollGreater);
        rerollGreater = isNaN(rerollGreater) ? Number.Infinity : rerollGreater;
        if (num < 0) {
            num *= -1;
        }
        if (sides < 0) {
            sides *= -1;
        }
        if (!num || !sides) {
            callback(0, [
                []
            ]);
        }
        toRoll = num;
        async.whilst(
            function () {
                return toRoll > 0;
            },
            function (next) {
                if (results.length >= (m_config.diceMaxReRolls || 20)) {
                    results.push(['Too many Rerolls. Stopping.']);
                    next(true);
                    return;
                }
                m_browser.getContent('http://www.random.org/integers/?num=' + toRoll + '&min=1&max=' + sides + '&col=1&base=10&format=plain&rnd=new', function (err, res, data) {

                    var dice;
                    if (err || res >= 300) {
                        next(true);
                    } else {
                        dice = data.trim().split("\n").map(function (v) {
                            return parseInt(v, 10);
                        });
                        toRoll = dice.reduce(function (i, v) {
                            return i + (v >= rerollGreater ? 1 : 0);
                        }, 0);
                        dice = dice.map(function (v) {
                            return v * factor;
                        });
                        sum = dice.reduce(function (i, v) {
                            return i + v;
                        }, sum);
                        results.push(dice);
                        next();
                    }
                });
            },
            function () {
                callback(sum, results);
            }
        );

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
        num = Math.abs(num);
        sides = Math.abs(sides);
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

    function rollWolfDice(match, callback) {
        var criticals;
        if (match.reroll) {
            criticals = 10;
        }
        if (!match.num) {
            match.num = 10;
        }
        if (!match.target) {
            match.target = 8;
        }
        getDiceFromServer(match.num, 10, criticals, function (sum, dice) {
            var result = sum,
                successes = 0,
                mapper = function mapper(v) {
                    if (v >= match.target) {
                        successes += 1;
                        return v.toString() + 'S';
                    }
                    return v.toString();
                };
            result = 'Rolling ' + match.num + 'd10 Target: ' + match.target + ': ';
            if (match.options.indexOf('p') >= 0) {
                result += 'Prerolling ' + prerollDice(match.num, 10) + ' times: ';
            }
            result += dice.shift().map(mapper).join(', ');
            if (dice.length > 0) {
                dice.forEach(function (d) {
                    result += '\nRerolling ' + d.length + 'd10: ';
                    result += d.map(mapper).join(', ');
                });
                result += '\n';
            }
            if (match.bonus) {
                result += ' Bonus: ' + match.bonus;
                successes += match.bonus;
            }
            result += ' Successes: ' + successes;
            callback(result);
        });
    }

    function rollFudgeDice(match, callback) {
        if (!match.num) {
            match.num = 4;
        }
        var result = 'Rolling ' + match.num + ' dice of Fate: ';
        if (isNaN(match.num) || match.num < 1) {
            callback(result + getError());
            return;
        }
        if (match.num > (m_config.diceMaxDice || 20)) {
            callback(result + 'Error Too many dice requested');
            return;
        }
        getDiceFromServer(match.num, 6, undefined, function (sum, dice) {
            var total = sum;
            total = dice[0].reduce(function (i, v) {
                if (v < 3) {
                    return i - 1;
                }
                if (v > 4) {
                    return i + 1;
                }
                return i;

            }, 0);
            dice = dice[0].map(function (v) {
                if (v < 3) {
                    return '-';
                }
                if (v > 4) {
                    return '+';
                }
                return '0';

            });
            result += dice.join('');
            if (match.bonus) {
                total += match.bonus;
                result += ' Bonus: ' + match.bonus;
            }
            result += 'Total: ' + total;
            callback(result);
        });
    }


    function rollXDice(match, callback) {
        var num = match.num,
            sides = match.sides,
            crit,
            result;

        if (num === undefined) {
            num = 1;
        }
        result = 'Rolling ' + num + 'd' + sides + ': ';
        if (isNaN(num) || isNaN(sides) || !num) {
            callback(result + getError());
            return;
        }
        if (num > (m_config.diceMaxDice || 20)) {
            callback(result + 'Error Too many dice requested');
            return;
        }
        if (sides === 1) {
            callback(result + 'Sum : ' + num);
            return;
        }
        if (match.options && match.options.indexOf('p') >= 0) {
            result += 'Prerolling ' + prerollDice(num, sides) + ' times: ';
        }
        if (match.options && match.options.indexOf('r') >= 0) {
            crit = sides;
        }
        getDiceFromServer(num, sides, crit, function (sum, dice) {
            var d = dice.shift();

            result += d.join(', ');
            if (dice.length > 0) {
                dice.forEach(function (d) {
                    result += '\nRerolling ' + d.length + ' Crits:' + d.join(', ');
                });
                result += '\n';
            }
            if (isNaN(sum)) {
                result += ' ' + getError();
            } else if (Math.abs(num) > 1) {
                if (match.bonus) {
                    sum += match.bonus;
                    result += ' Bonus: ' + match.bonus;
                }
                result += ' Sum: ' + sum * (num < 0 ? -1 : 1);
            }
            callback(result);
        });
    }

    function rollDice(match, callback) {
        if (!match.method) {
            rollXDice(match, callback);
        } else if (match.method[0] === 'f') {
            rollFudgeDice(match, callback);
        } else if (match.method[0] === 'w') {
            rollWolfDice(match, callback);
        } else {
            callback('Not implemented');
        }
    }

    function rollAllDice(input, callback) {
        var results = [];
        parser(input,
            function (match, next) {
                if (results.length >= (m_config.diceMaxRolls || 6)) {
                    results.push('Reached maximum dice roll. stopping.');
                    next(true);
                } else {
                    rollDice(match, function (line) {
                        results.push(line);
                        next();
                    });
                }
            },
            function () {
                callback(results);
            });
    }

    exports.name = "DiceMaster 1.0.0";
    exports.onNotify = function (type, notification, post, callback) {
        if (!m_config.dicemaster || !post || !post.cleaned || ['private_message', 'mentioned', 'replied'].indexOf(type) === -1) {
            callback();
            return;
        }

        rollAllDice(post.cleaned, function (dice) {
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
