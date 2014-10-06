//http://www.random.org/integers/?num=5&min=1&max=100&col=1&base=10&format=plain&rnd=new
/*jslint node: true, indent: 4 */
(function () {
    'use strict';

    var async = require('async'),
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

    function rollDnD(num, sides, callback) {
        if (isNaN(num) || isNaN(sides)) {
            callback(null);
            return;
        }
        if (num > m_config.diceMaxDice) {
            callback(null, 'Refusing to roll ' + num + 'd' + sides + ': Too many dice requested');
            return;
        }
        if (sides === 1) {
            callback(null, 'Rolling ' + num + 'd1: Sum : ' + num);
            return;
        }
        getDiceFromServer(num, sides, function (dice) {
            if (num > 1) {
                callback(null, 'Rolling ' + num + 'd' + sides + ': ' + dice.join(', ') + ' Sum: ' + dice.reduce(function (i, v) {
                    return i + v;
                }, 0));
            } else {
                callback(null, 'Rolling ' + num + 'd' + sides + ': ' + dice[0]);
            }
        });
    }

    function doDnD(post, callback) {
        var format = /\b(\d+)d(\d+)\b/gi,
            result = '';
        result = post.raw.match(format).map(function (r) {
            return r.split('d');
        });
        async.map(result, function (roll, complete) {
            rollDnD(parseInt(roll[0], 10), parseInt(roll[1], 10), complete);
        }, function (err, result) {
            if (err) {
                callback();
                return;
            }
            callback(result.join('\n\n'));
        });
    }

    exports.name = "DiceMaster 1.0.0";
    exports.onNotify = function (type, notification, post, callback) {
        if (!m_config.dicemaster || !post || !post.raw || ['private_message', 'mentioned', 'replied'].indexOf(type) === -1) {
            callback();
            return;
        }

        //8 and up is success in mage
        console.log(post.raw);

        doDnD(post, function (dice) {
            if (dice) {
                m_browser.reply_topic(notification.topic_id, notification.post_number, dice, callback);
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