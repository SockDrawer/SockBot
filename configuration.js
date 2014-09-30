/*jslint node: true, indent: 4, unparam: true  */
(function () {
    'use strict';
    var conf = require('./SockBot.conf').config,
        def = {
            'username': 'sockbot',
            'password': 'sockbotsockbot',
            'likeBinge': true,
            'likeBingeHour': 23,
            'likeBingeMinute': 50,
            'likeBingeTopics': 1000,
            'readify': true,
            'readifyWait': 48 * 60 * 60 * 1000 // 48 hours
        };

    console.dir(conf);
    
    function merge() {
        var i = 0,
            res = {},
            obj,
            name;
        for (i = 0; i < arguments.length; i += 1) {
            obj = arguments[i];
            if (obj) {
                for (name in obj) {
                    if (obj.hasOwnProperty(name)) {
                        res[name] = obj[name];
                    }
                }
            }
        }
        return res;
    }

    exports.configuration = merge(def, conf);
}());