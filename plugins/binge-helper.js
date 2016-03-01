'use strict';

const later = require('later');

exports.scheduleBinge = function scheduleBinge(config, bingeFn) {
    //Daily at the specified time
    const sched = later.parse.recur()
        .on(config.hour).hour()
        .on(config.minute).minute();
    return later.setInterval(bingeFn, sched);
};
exports.randomizeStart = function (config) {
    config.hour = Math.floor(Math.random() * 24);
    config.minute = Math.floor(Math.random() * 60);
};
