'use strict';
/**
 * Status command
 * @module status
 * @author RaceProUK
 * @license MIT
 */

const path = require('path'),
    os = require('os'),
    filesize = require('filesize'),
    shuffle = require('knuth-shuffle');

const browser = require('../browser')();

const internals = {
    uptime: uptime,
    runtime: runtime,
    platform: platform,
    cpuArch: cpuArch,
    cpuUsage: cpuUsage,
    memoryUsage: memoryUsage,
    socksFolded: socksFolded,
    splinesReticulated: splinesReticulated,
    cogsThrown: cogsThrown,
    holesDarned: holesDarned,
    starsGazed: starsGazed,
    ringsCollected: ringsCollected,
    dangersWarned: dangersWarned
};

/**
 * Name of the command
 *
 * @readonly
 * @type {string}
 */
exports.command = 'status';

/**
 * Command help string
 *
 * @readonly
 * @type {string}
 */
exports.helpText = 'my current status';

/**
 * Handle the `status` command
 *
 * @param {command} command The `status` command
 */
exports.handler = function (command) {
    const text = [
        //Serious stats
        internals.uptime(),
        internals.runtime(),
        internals.platform(),
        internals.cpuArch(),
        internals.cpuUsage(),
        internals.memoryUsage(),
        //Fun stats
        internals.socksFolded(),
        internals.splinesReticulated(),
        internals.cogsThrown(),
        internals.holesDarned(),
        internals.starsGazed(),
        internals.ringsCollected(),
        internals.dangersWarned(command.post.username)
    ];
    browser.createPost(command.post.topic_id, command.post.post_number, text.join('\n'), () => 0);
};

function uptime() {
    let raw = process.uptime();
    const milliseconds = Math.floor(1000 * (raw % 1));
    raw = Math.floor(raw);
    const seconds = Math.floor(raw % 60);
    raw = Math.floor(raw / 60);
    const minutes = Math.floor(raw % 60);
    raw = Math.floor(raw / 60);
    const hours = Math.floor(raw % 24);
    const days = Math.floor(raw / 24);
    return 'Uptime: ' + days + ' days ' + hours + ' hours ' + minutes + ' minutes '
        + seconds + ' seconds ' + milliseconds + ' milliseconds';
}

function runtime() {
    return 'Runtime: ' + path.basename(process.title) + ' ' + process.version + ' (V8 v' + process.versions.v8 + ')';
}

function platform() {
    return 'Platform: ' + os.platform() + ' ' + os.release();
}

function cpuArch() {
    return 'CPU arch: ' + os.arch() + ' ' + os.endianness();
}

function cpuUsage() {
    const data = [];
    const cpus = os.cpus();
    let overall = 0;
    const totals = {};
    data.push(cpus.length + ' cores');
    /* eslint-disable prefer-const */
    for (let i in cpus) {
        const cpu = cpus[i];
        for (let type in cpu.times) {
            overall += cpu.times[type];
            totals[type] = (totals[type] || 0) + cpu.times[type];
        }
    }
    for (let type in totals) {
        data.push(type + ' ' + Math.round(100 * totals[type] / overall) + '%');
    }
    /* eslint-enable prefer-const */
    return '<abbr title="Since system boot">CPU usage</abbr>: ' + data.join(', ');
}

function memoryUsage() {
    return 'Memory usage: ' + filesize(os.freemem()) + ' free out of ' + filesize(os.totalmem());
}

function socksFolded() {
    return 'Socks folded: ' + random(1000);
}

function splinesReticulated() {
    const real = random(20);
    const imag = random(20);
    return 'Splines reticulated: ' + real + ' + ' + imag + '[i]i[/i]';
}

function cogsThrown() {
    return 'Cogs thrown: ' + random(50);
}

function holesDarned() {
    return 'Holes darned: ' + random(500);
}

const stars = ['Polaris', 'Sirius', 'Alpha Centauri', 'Proxima Centauri',
    'Betelgeuse', 'Rigel', 'Vega', 'Pleiades', 'Antares', 'Canopus'];
function starsGazed() {
    shuffle.knuthShuffle(stars);
    return 'Stars gazed: ' + stars.slice(0, random(stars.length)).join(', ');
}

function ringsCollected() {
    return 'Rings collected: ' + random(200);
}

function dangersWarned(username) {
    return 'Warned @' + username + ' of danger ' + random(10) + ' times';
}

function random(limit) {
  return Math.floor(Math.random() * limit) + 1;
}

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.internals = internals;
}
