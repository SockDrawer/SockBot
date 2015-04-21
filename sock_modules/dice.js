/*jslint node: true, indent: 4, todo: true */

'use strict';
/**
 * Dice module. Responsible for rolling dice in PMs.
 * @module dice
 */

var async = require('async'),
    xRegExp = require('xregexp').XRegExp,
    request = require('request');
var parser,
    discourse,
    conf,
    configuration;

/**
 * @var {string} description Brief description of this module for Help Docs
 */
exports.description = 'Allow bot to play with dice';

/**
 * @var {object} configuration Default Configuration settings for this
 * sock_module
 */
exports.configuration = {
    enabled: false,
    maxDice: 20,
    maxRolls: 6,
    maxReRolls: 10
};

/**
 * @var {string} name The name of this sock_module
 */
exports.name = 'DiceMaster';

/**
 * @var {number} priority If defined by a sock_module it is the priority of
 * the module with respect to other modules.
 *
 * sock_modules **should not** define modules with negative permissions.
 * Default value is 50 with lower numbers being higher priority.
 */
exports.priority = undefined;

/**
 * @var {string} version The version of this sock_module
 */
exports.version = '1.5.0';

//The parse is complicated. don't let it leak
(function () {
    var pNum = '(?<num>-?\\d+)',
        pSides = '(?<sides>-?\\d+)',
        pMethod = '(?<method>W|Wolf|F|Fate|Fudge)',
        pTarget = '(?:t(?<target>\\d+))',
        pBonus = '(?:b(?<bonus>-?\\d+))',
        pOptions = '(?<options>[pfrs]+)',
        pMatcher = '\\b' + pNum + '?d(' + pSides + '|' + pMethod +
        ')(?<optional>' + pTarget + '|' + pBonus + '|' + pOptions +
        ')*\\b',
        rTarget = xRegExp(pTarget, 'i'),
        rBonus = xRegExp(pBonus, 'i'),
        rOptions = xRegExp(pOptions, 'i'),
        rMatcher = xRegExp(pMatcher, 'i');
    parser = function parser(input, each, complete) {
        var match = 1,
            pos = 0;
        async.until(
            function () {
                return !match;
            },
            function (next) {
                match = rMatcher.xexec(input, pos);
                if (match) {
                    var inner = match[0] || '',
                        target = rTarget.xexec(inner),
                        bonus = rBonus.xexec(inner),
                        options = rOptions.xexec(inner) || {},
                        matched = {
                            num: match.num ?
                                parseInt(match.num, 10) : undefined,
                            sides: match.sides ?
                                parseInt(match.sides, 10) : undefined,
                            method: match.method ?
                                match.method.toLowerCase() : undefined,
                            target: (target && target.target) ?
                                parseInt(target.target, 10) : undefined,
                            options: (options.options || '').toLowerCase(),
                            bonus: (bonus && bonus.bonus) ?
                                parseInt(bonus.bonus, 10) : undefined
                        };
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
            if (results.length >= (configuration.maxReRolls || 20)) {
                results.push(['Too many Rerolls. Stopping.']);
                next(true);
                return;
            }
            request.get('http://www.random.org/integers/?num=' + toRoll +
                '&min=1&max=' + sides +
                '&col=1&base=10&format=plain&rnd=new',
                function (err, res, data) {
                    var dice;
                    if (err || res >= 300) {
                        next(true);
                    } else {
                        dice = data.trim().split('\n').map(function (v) {
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

/**
 * Get a random error message. Adds quirkiness to the bot.
 * @return {string} The error string.
 */
function getError() {
    return conf.errors[Math.floor(Math.random() * conf.errors.length)];
}

/**
 * Pre-roll dice. To get bad streaks out early :)
 * @param  {number} num The number of dice to roll
 * @param  {number} sides The size of dice to roll
 * @return {number} How many dice were rolled
 */
function prerollDice(num, sides) {
    var dice,
        ct = 0,
        i,
        ones = 1,
        reducer = function reducer(a, o) {
            return a + o === 1 ? 1 : 0;
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

/**
 * Roll White Wolf-style dice
 * @param  {object} match Information about how to match
 * @param  {string} match.reroll Whether to reroll 10s (exploding dice)
 * @param  {number} match.num How many dice to roll. Defaults to ten.
 * @param  {number} match.target The target number for the roll
 * @param  {Function} callback The callback to call when complete
 */
function rollWolfDice(match, callback) {
    var criticals,
        result;
    if (match.reroll) {
        criticals = 10;
    }
    if (!match.num) {
        match.num = 10;
    }
    if (!match.target) {
        match.target = 8;
    }
    result = 'Rolling ' + match.num + 'd10 Target: ' + match.target + ': ';
    if (match.num > (configuration.maxDice || 20)) {
        callback(result + 'Error Too many dice requested');
        return;
    }
    getDiceFromServer(match.num, 10, criticals, function (sum, dice) {
        var successes = sum,
            mapper = function mapper(v) {
                if (v >= match.target) {
                    successes += 1;
                    return v.toString() + 'S';
                }
                return v.toString();
            };
        successes = 0; // reset successes
        if (match.preroll) {
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

/**
 * Roll Fudge dice
 * @param  {object} match Information about how to match
 * @param  {number} match.num How many dice to roll. Defaults to four
 * @param  {Function} callback The callback to call when complete
 */
function rollFudgeDice(match, callback) {
    if (!match.num) {
        match.num = 4;
    }
    var result = 'Rolling ' + match.num + ' dice of Fate: ';
    if (isNaN(match.num) || match.num < 1) {
        callback(result + getError());
        return;
    }
    if (match.num > (configuration.maxDice || 20)) {
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

/**
 * Roll arbitrary d20-style dice
 * @param  {object} match Information about how to match
 * @param  {number} match.sides What size dice to roll
 * @param  {number} match.num How many dice to roll
 * @param  {Function} callback The callback to call when complete
 */
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
        return callback(result + getError());
    }
    if (num > (configuration.maxDice || 20)) {
        return callback(result + 'Error Too many dice requested');
    }
    if (sides === 1) {
        return callback(result + 'Sum : ' + num);
    }
    if (match.preroll) {
        result += 'Prerolling ' + prerollDice(num, sides) + ' times: ';
    }
    if (match.reroll) {
        crit = sides;
    }
    getDiceFromServer(num, sides, crit, function (sum, dice) {
        var d = dice.shift();

        result += d.join(', ');
        if (dice.length > 0) {
            dice.forEach(function (d2) {
                result += '\nRerolling ' + d2.length;
                result += ' Crits:' + d2.join(', ');
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

/**
 * Determine what dice to roll and outsource the logic
 * @param  {object} match Information about how to roll
 * @param  {string} match.method What method to use to roll dice
 * @param  {Function} callback The callback to call when complete.
 */
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

/**
 * Roll as many dice as can be parsed. 
 * @param  {string} input The input string to parse
 * @param  {Function} callback The callback to call when complete
 */
function rollAllDice(input, callback) {
    var results = [];
    parser(input,
        function (match, next) {
            if (results.length >= (configuration.maxRolls || 6)) {
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

/**
 * Runs on notification. If the dice module is not enabled or is not triggered via PM, 
 * it early aborts. Otherwise, it tries to respond with the result of the dice roll.
 * @param {string} type - The type of event. Only responds if this is 'private_message'
 * @param {string} notification - The notification to respond to
 * @param {string} topic - Unused. PM-only.
 * @param {string} post - The post the notification was for
 * @param {function} callback - The callback to notify when processing is complete.
 */
exports.onNotify = function (type, notification, topic, post, callback) {
    if (!configuration.enabled || !post || !post.cleaned) {
        return callback();
    }
    if (['private_message', 'replied'].indexOf(type) === -1) {
        return callback();
    }

    rollAllDice(post.cleaned, function (dice) {
        var result = dice.join('\n\n').trim();
        if (result) {
            discourse.createPost(notification.topic_id,
                notification.post_number, result,
                function () {
                    callback(true);
                });
        } else {
            callback();
        }
    });
};

/**
 * Bootstrap the module
 * @param  {string} browser - discourse.
 * @param  {object} config - The configuration to use
 */
exports.begin = function begin(browser, config) {
    configuration = config.modules[exports.name];
    conf = config;
    discourse = browser;
};
