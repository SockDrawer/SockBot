'use strict';

exports.randomizeStart = function (config) {
    config.hour = Math.floor(Math.random() * 24);
    config.minute = Math.floor(Math.random() * 60);
};
