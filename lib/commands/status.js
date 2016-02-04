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
    dangersWarned: dangersWarned,
    showPlugins: showPlugins,
    plugins: {}
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
        internals.showPlugins,
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

/**
 * Handles registering new plugins to the plugin list
 *
 * @param {string} name Plugin Name
 */
exports.loadPlugin = function loadPlugin(name) {
    internals.plugins[name] = 1;
};

/**
 * Bot uptime broken down into days, hours, minutes, seconds, and milliseconds
 *
 * @returns {string} Bot uptime as a pre-formatted string
 */
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
    return ('Uptime: ' + days + ' days ' + hours + ' hours ' + minutes + ' minutes ' + seconds + ' seconds ') +
        milliseconds + ' milliseconds';
}

/**
 * Runtime name and version, and V8 version
 *
 * @returns {string} Runtime details as a pre-formatted string
 */
function runtime() {
    return 'Runtime: ' + path.basename(process.title) + ' ' + process.version + ' (V8 v' + process.versions.v8 + ')';
}

/**
 * Operating system type and version
 *
 * @returns {string} OS details as a pre-formatted string
 */
function platform() {
    return 'Platform: ' + os.platform() + ' ' + os.release();
}

/**
 * CPU architecture and endianness
 *
 * @returns {string} CPU details as a pre-formatted string
 */
function cpuArch() {
    return 'CPU arch: ' + os.arch() + ' ' + os.endianness();
}

/**
 * CPU usage since system boot
 *
 * @returns {string} CPU usage as a pre-formatted string
 */
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

/**
 * Current memory usage
 *
 * @returns {string} Memory usage as a pre-formatted string
 */
function memoryUsage() {
    return 'Memory usage: ' + filesize(os.freemem()) + ' free out of ' + filesize(os.totalmem());
}


/**
 * Currently loaded plugins
 *
 * @returns {string} List of loaded plugins
 */
function showPlugins() {
    const plugins = Object.keys(internals.plugins);
    if (plugins.length < 1) {
        return '';
    }
    plugins.sort();
    return 'Loaded Plugins:\n\n' + plugins.map(p => '- ' + p).join('\n') + '\n';
}

/**
 * 'Socks folded' fun stat; random number between 1 and 1000
 *
 * @returns {string} Socks folded as a pre-formatted string
 */
function socksFolded() {
    return 'Socks folded: ' + random(1000);
}

/**
 * 'Splines reticulated' fun stat; random complex number between 1 + 1*i* and 20 + 20*i*
 *
 * @returns {string} Splines reticulated as a pre-formatted string
 */
function splinesReticulated() {
    const real = random(20);
    const imag = random(20);
    return 'Splines reticulated: ' + real + ' + ' + imag + '[i]i[/i]';
}

/**
 * 'Cogs thrown' fun stat; random number between 1 and 50
 *
 * @returns {string} Cogs thrown as a pre-formatted string
 */
function cogsThrown() {
    return 'Cogs thrown: ' + random(50);
}

/**
 * 'Holes darned' fun stat; random number between 1 and 500
 *
 * @returns {string} Holes darned as a pre-formatted string
 */
function holesDarned() {
    return 'Holes darned: ' + random(500);
}

const stars = ['Polaris', 'Sirius', 'Alpha Centauri', 'Proxima Centauri',
    'Betelgeuse', 'Rigel', 'Vega', 'Pleiades', 'Antares', 'Canopus'
];
/**
 * 'Stars gazed' fun stat; lists 1-10 radom star names
 *
 * @returns {string} Stars gazed as a pre-formatted string
 */
function starsGazed() {
    shuffle.knuthShuffle(stars);
    return 'Stars gazed: ' + stars.slice(0, random(stars.length)).join(', ');
}

/**
 * 'Rings collected' fun stat; random number between 1 and 200
 *
 * @returns {string} Rings collected as a pre-formatted string
 */
function ringsCollected() {
    return 'Rings collected: ' + random(200);
}

/**
 * 'Dangers warned' fun stat; claims to have warned the user of danger 1-10 times
 *
 * @param {string} username The username
 * @returns {string} Dangers warned as a pre-formatted string
 */
function dangersWarned(username) {
    return 'Warned @' + username + ' of danger ' + random(10) + ' times';
}

/**
 * Generate a random integer between 1 and `limit` inclusive
 *
 * @param {number} limit The maximum integer
 * @returns {number} The integer generated
 */
function random(limit) {
    return Math.floor(Math.random() * limit) + 1;
}

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.internals = internals;
}
