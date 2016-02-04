'use strict';
/**
 * Change your long name periodically
 *
 * @module namer
 * @author Accalia
 * @license MIT
 */
const later = require('later');

/**
 * Profile Prefix
 */
const profilePrefix = '/users/';

/**
 * Default configuration settings
 * @typedef {object}
 */
const defaultConfig = {
        /**
         * Schedule to change name on. Must be a valid `later` text schedule.
         *
         * See the [parser documentation](https://bunkat.github.io/later/parsers.html#text) for more information
         *
         * @type {string}
         * @default
         */
        schedule: 'at 00:00',
        /**
         * Long names to choose from.
         *
         * @type {string[]}
         * @default
         */
        names: [
            'The of and to. A in is I. That it, for you, was with on. As have ... but be they.'
        ]
    },
    /**
     * Internal status store
     * @typedef {object}
     */
    internals = {
        /**
         * Profile URL
         *
         * @type {string}
         */
        profileUrl: '',
        /**
         * Browser to use for communication with discourse
         * @type {Browser}
         */
        browser: null,
        /**
         * EventEmitter used for internal communication
         * @type {externals.events.SockEvents}
         */
        events: null,
        /**
         * Instance configuration
         * @type {object}
         */
        config: defaultConfig,
        /**
         * Interval identifier for schedule
         *
         * @type {*}
         */
        interval: null,
        /**
         * Extended help message
         */
        extendedHelp: 'changes long name for the bot on a preiodic basis\n\nFor more information see the' +
            ' [full docs](https://sockbot.readthedocs.org/en/latest/Plugins/namer/)'
    };

/**
 * Prepare Plugin prior to login
 *
 * @param {*} plugConfig Plugin specific configuration
 * @param {Config} config Overall Bot Configuration
 * @param {externals.events.SockEvents} events EventEmitter used for the bot
 * @param {Browser} browser Web browser for communicating with discourse
 */
exports.prepare = function (plugConfig, config, events, browser) {
    internals.browser = browser;
    internals.events = events;
    internals.config = plugConfig;
    internals.profileUrl = profilePrefix + config.core.username;
    internals.events.registerHelp('namer', internals.extendedHelp, () => 0);
};

/**
 * Start the plugin after login
 */
exports.start = function () {
    const schedule = later.parse.text(internals.config.schedule);
    if (schedule.error !== -1) {
        internals.events.emit('logWarning', 'Parse error in scedule. Cannot start `namer` plugin.');
        return;
    }
    internals.interval = later.setInterval(exports.setName, schedule);
};

/**
 * Stop the plugin prior to exit or reload
 */
exports.stop = function () {
    if (internals.interval && internals.interval.clear) {
        internals.interval.clear();
    }
};

/**
 * Set the new Log name from a list of choices.
 */
exports.setName = function () {
    const names = internals.config.names;
    if (names.length < 2) {
        return; // Nothing to do here with just one name.
    }
    const idx = Math.floor(Math.random() * names.length);
    internals.browser.putData(internals.profileUrl, {
        name: names[idx]
    }, () => 0);
};

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.internals = internals;
}
