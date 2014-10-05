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

    function doDnD(post, callback) {
        var format = /\b(\d+)d(\d+)\b/gi,
            result = '';
        result = post.raw.match(format).map(function (r) {
            return r.split('d');
        });
        async.map(result, function (roll, complete) {
            getDiceFromServer(roll[0], roll[1], function (dice) {
                complete(null, [roll, dice]);
            });
        }, function (err, result) {
            if (err) {
                callback();
                return;
            }
            var str = '';
            result.forEach(function (f) {
                var sum = f[1].reduce(function (i, v) {
                    return i + v;
                }, 0);
                str += 'Rolling ' + f[0][0] + 'd' + f[0][1] + ': ' + f[1].join(', ') + ' Sum: ' + sum + '\n\n';
            });
            callback(str);
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