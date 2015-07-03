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
 * Brief description of this module for Help Docs
 */
exports.description = 'Allow bot to play with dice';

/**
 * Default Configuration settings for this sock_module
 */
exports.configuration = {
    enabled: false,
    maxDice: 20,
    maxRolls: 6,
    maxReRolls: 10
};

/**
 * The name of this sock_module
 */
exports.name = 'DiceMaster';

/**
 * If defined by a sock_module it is the priority of
 * the module with respect to other modules.
 *
 * sock_modules **should not** define modules with negative permissions.
 * Default value is 50 with lower numbers being higher priority. 
 */
exports.priority = undefined;

/**
 * The version of this sock_module
 */
exports.version = '1.5.0';

/**
 * Roll the actual dice. Uses random.org as a source of random numbers.
 * Calls back with the following parameters:
 *  - sum: the total sum of dice rolled
 *  - results: the array of arrays of dice rolled (int[][])
 */
exports.roll = function(num, sides, rerollGreater, callback) {
    var factor = sides < 0 ? -1 : 1,
        results = [],
        sum = 0,
        toRoll;
		
	rerollGreater = rerollGreater || Number.Infinity;
    rerollGreater = Math.abs(rerollGreater);
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
            if (results.length >= (exports.configuration.maxReRolls || 20)) {
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
 * Pre-roll dice. To get bad streaks out early :)
 * @param  {number} num The number of dice to roll
 * @param  {number} sides The size of dice to roll
 * @return {number} How many dice were rolled
 */
exports.prerollDice = function(num, sides) {
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
 * @param  {string} match.preroll Whether to preroll
 * @param  {number} match.bonus The bonus to add
 * @param  {Function} callback The callback to call when complete
 * Will receive the following parameters:
 * - Result: the string response to return
 */
exports.rollWolfDice = function(match, callback) {
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
    if (match.num > (exports.configuration.maxDice || 20)) {
        callback(result + 'Error Too many dice requested');
        return;
    }
    exports.roll(match.num, 10, criticals, function (sum, dice) {
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
            result += 'Prerolling ' + exports.prerollDice(match.num, 10) + ' times: ';
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
exports.rollFudgeDice = function(match, callback) {
    if (!match.num) {
        match.num = 4;
    }
    var result = 'Rolling ' + match.num + ' dice of Fate: ';
    if (isNaN(match.num) || match.num < 1) {
        callback(result + getError());
        return;
    }
    if (match.num > (exports.configuration.maxDice || 20)) {
        callback(result + 'Error Too many dice requested');
        return;
    }
    exports.roll(match.num, 6, undefined, function (sum, dice) {
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
 * Bootstrap the module
 * @param  {string} browser - discourse.
 * @param  {object} config - The configuration to use
 */
exports.begin = function begin(browser, config) {
    configuration = config.modules[exports.name];
    conf = config;
    discourse = browser;
};
