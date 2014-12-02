'use strict';

var discourse, config;
exports.name = 'Base';
exports.version = '0.0.1';
exports.description = 'Base Admin Modules';

exports.begin = function begin(browser, configuration) {
    discourse = browser;
    config = configuration;
};

exports.echo = function echo(args, callback) {
    callback(null, args.join(' '));
};
exports.echo.command = 'echo';
exports.echo.description = 'Echo the arguments back to the summoner.';
exports.echo.trustLevel = 1;
exports.echo.prefix = false;

exports.status = function status(args, callback) {
    callback(null, 'online');
};
exports.status.command = 'status';
exports.status.description = 'Print "online" to the summoner';
exports.status.trustLevel = 1;

exports.nap = function nap(args, callback) {
    var until = (new Date().getTime()) + 30 * 60 * 1000;
    discourse.sleep(until);
    callback(null, config.user.user.username +
        ' is set to nap for the next 30 minutes');
};
exports.nap.command = 'nap';
exports.nap.description = 'Send the bot into the timeout corner for a bit';
exports.nap.trustLevel = 3;
exports.nap.muteable = false;

exports.sleep = function sleep(args, callback) {
    var until = (new Date().getTime()) + 2 * 60 * 60 * 1000;
    discourse.sleep(until);
    callback(null, config.user.user.username +
        ' is set to nap for the two hours');
};
exports.sleep.command = 'sleep';
exports.sleep.description = 'Send the bot into the timeout corner for a while';
exports.sleep.trustLevel = 3;
exports.sleep.muteable = false;

exports.mute = function mute(args, callback) {
    discourse.sleep(Number.MAX_SAFE_INTEGER);
    callback(null, config.user.user.username +
        ' is set to nap for the two hours');
};
exports.mute.command = 'mute';
exports.mute.description = 'Muzzle the bot until further notice';
exports.mute.trustLevel = 4;
exports.mute.muteable = false;

exports.unmute = function unmute(args, callback) {
    discourse.sleep(new Date().getTime() - 1);
    callback(null, config.user.user.username +
        ' is unmuted');
};
exports.unmute.command = 'unmute';
exports.unmute.description = 'Unmute the bot. ' +
    'Undoes `nap`, `sleep`, and `mute`';
exports.unmute.trustLevel = 4;
