'use strict';
/**
 * NodeBB provider module
 * @module sockbot.providers.nodebb
 * @author Accalia
 * @license MIT
 */

const debug = require('debug')('sockbot:provider:nodebb');
const EventEmitter = require('events').EventEmitter;

const io = require('socket.io-client'),
    request = require('request');

const utils = require('../../lib/utils'),
    postModule = require('./post'),
    topicModule = require('./topic'),
    categoryModule = require('./category'),
    userModule = require('./user'),
    notifications = require('./notification'),
    chatModule = require('./chat'),
    formatters = require('./format');

/**
 * Forum connector
 *
 * Connects to a NodeBB forum
 */
class Forum extends EventEmitter {

    /**
     * Get announced compatibilities string for the provider
     */
    static get compatibilities() {
        return '(nodebb/compatible) (wtdwtf/compatible)';
    }

    /**
     * Create a forum connector instance
     *
     * @public
     * @class
     *
     * @param {object} config Bot configuration data
     * @param {string} useragent Useragent to use for all requests
     */
    constructor(config, useragent) {
        super();
        utils.mapSet(this, {
            config: config,
            useragent: useragent
        });
        this.Post = postModule.bindPost(this);
        this.Topic = topicModule.bindTopic(this);
        this.Category = categoryModule.bindCategory(this);
        this.User = userModule.bindUser(this);
        this.Notification = notifications.bindNotification(this);
        this.Chat = chatModule.bindChat(this);
        this.Format = formatters;
        this._plugins = [];
    }

    /**
     * Bot instance configuration
     *
     * @public
     *
     * @type {object}
     */
    get config() {
        return JSON.parse(JSON.stringify(utils.mapGet(this, 'config')));
    }

    /**
     * Useragent used by the instance
     *
     * @public
     *
     * @type {string}
     */
    get useragent() {
        return utils.mapGet(this, 'useragent');
    }

    /**
     * Base URL for the forum
     *
     * @public
     *
     * @type {string}
     */
    get url() {
        return this.config.core.forum;
    }

    /**
     * Username bot will log in as
     *
     * @public
     *
     * @type{string}
     */
    get username() {
        return this.config.core.username;
    }

    /**
     * Logged in Bot Username
     *
     * @public
     *
     * @type {User}
     */
    get user() {
        return utils.mapGet(this, 'user');
    }

    /**
     * Bot instance Owner user
     *
     * @public
     *
     * @type {User}
     */
    get owner() {
        return utils.mapGet(this, 'owner');
    }

    /**
     * Get Commands object bound to this instance
     *
     * @public
     *
     * @type {Commands}
     */
    get Commands() {
        return utils.mapGet(this, 'commands');
    }

    /**
     * Store Commands object bound to this instance
     *
     * @private
     *
     * @param {Commands} commands commands Instance
     */
    set Commands(commands) {
        utils.mapSet(this, 'commands', commands);
    }

    /**
     * Verify that cookiejar is set properly
     *
     * @private
     */
    _verifyCookies() {
        const jar = this._cookiejar || request.jar();
        this._cookiejar = jar;
    }

    /**
     * Get forum configuration for CSRF token
     *
     * @private
     *
     * @returns {Promise} Resolves after config is retrieved
     */
    _getConfig() {
        this._verifyCookies();
        this._config = {};
        return new Promise((resolve, reject) => {
            debug('begin configuration fetch for CSRF token');
            request.get({
                url: `${this.url}/api/config`,
                jar: this._cookiejar,
                headers: {
                    'User-Agent': this.useragent
                }
            }, (err, _, data) => {
                if (err) {
                    debug('failed configuration fetch for CSRF token');
                    return reject(err);
                }
                try {
                    debug('completed configuration fetch for CSRF token');
                    this._config = JSON.parse(data);
                    return resolve(this._config);
                } catch (jsonErr) {
                    debug('parse of retrieved configuration data failed');
                    return reject(jsonErr);
                }
            });
        });
    }

    /**
     * Login to forum instance
     *
     * @returns {Promise<Forum>} Resolves to logged in forum
     *
     * @promise
     * @fulfill {Forum} Logged in forum
     */
    login() {
        return this._getConfig()
            .then((config) => new Promise((resolve, reject) => {
                this._verifyCookies();
                debug('begin post login data');
                request.post({
                    url: `${this.url}/login`,
                    jar: this._cookiejar,
                    headers: {
                        'User-Agent': this.useragent,
                        'x-csrf-token': config.csrf_token
                    },
                    form: {
                        username: this.config.core.username,
                        password: this.config.core.password,
                        remember: 'off',
                        returnTo: this.url
                    }
                }, (loginError, response, reason) => {
                    if (loginError) {
                        debug(`Login failed for reason: ${loginError}`);
                        return reject(loginError);
                    }
                    if (response.statusCode >= 400) {
                        debug(`Login failed for reason: ${reason}`);
                        return reject(reason);
                    }
                    debug('complete post login data');
                    return resolve();
                });
            }))
            .then(() => this);
    }

    /**
     * Connect to remote websocket
     *
     * @public
     *
     * @returns {Promise<Forum>} Resolves to connected forum
     *
     * @promise
     * @resolves {Forum} Connected forum
     */
    connectWebsocket() {
        if (this.socket) {
            return Promise.resolve(this);
        }
        const promisefn = (resolve, reject) => {
            this._verifyCookies();
            const cookies = this._cookiejar.getCookieString(this.url);
            this.socket = Forum.io(this.url, {
                extraHeaders: {
                    'User-Agent': this.useragent,
                    'Cookie': cookies
                }
            });
            this.socket.on('pong', (data) => this.emit('log', `Ping exchanged with ${data}ms latency`));
            this.socket.on('connect', () => this.emit('connect'));
            this.socket.on('disconnect', () => this.emit('disconnect'));
            this.socket.once('connect', () => resolve());
            this.socket.once('error', (err) => reject(err));
        };
        return new Promise(promisefn)
            .then(() => this);
    }

    /**
     * Plugin Generator Function
     *
     * @typedef {PluginFn}
     * @function
     *
     * @param {Forum} forum Forum provider instance
     * @param {object} config Plugin configuration
     * @returns {Plugin} Generated plugin
     *
     */

    /**
     * Plugin Generator Object
     *
     * @typedef {PluginGenerator}
     *
     * @property {PluginFn} plugin Plugin generating function
     *
     */

    /**
     * Promising Function
     *
     * @typedef {promiseFunction}
     * @function
     *
     * @returns {Promise} Resolves when function is complete
     *
     */

    /**
     * Plugin Object
     *
     * @typedef {Plugin}
     *
     * @property {promiseFunction} activate Activates plugin
     * @property {promiseFunction} deactivate Deactivates plugin
     *
     */

    /**
     * Add a plugin to this forum instance
     *
     * @public
     *
     * @param {PluginFn|PluginGenerator} fnPlugin Plugin Generator
     * @param {object} pluginConfig Plugin configuration
     * @returns {Promise} Resolves on completion
     *
     * @promise
     * @fulfill {*} Plugin addedd successfully
     * @reject {Error} Generated plugin is invalid
     */
    addPlugin(fnPlugin, pluginConfig) {
        return new Promise((resolve, reject) => {
            let fn = fnPlugin;
            if (typeof fn !== 'function') {
                fn = fn.plugin;
            }
            const plugin = fn(this, pluginConfig);
            if (typeof plugin !== 'object') {
                return reject('[[invalid_plugin:no_plugin_object]]');
            }
            if (typeof plugin.activate !== 'function') {
                return reject('[[invalid_plugin:no_activate_function]]');
            }
            if (typeof plugin.deactivate !== 'function') {
                return reject('[[invalid_plugin:no_deactivate_function]]');
            }
            this._plugins.push(plugin);
            return resolve();
        });
    }

    /**
     * Activate forum and plugins
     *
     * @returns {Promise} Resolves when all plugins have been enabled
     */
    activate() {
        return this.connectWebsocket()
            .then(() => Promise.all([
                this.User.getByName(this.config.core.username),
                this.User.getByName(this.config.core.owner)
            ]))
            .then((data) => {
                utils.mapSet(this, 'user', data[0]);
                utils.mapSet(this, 'owner', data[1]);
            })
            .then(() => {
                this.Notification.activate();
                this.Chat.activate();
                return Promise.all(this._plugins.map((plugin) => plugin.activate()));
            })
            .then(() => this);
    }

    /**
     * Deactivate forum and plugins
     *
     * @returns {Promise} Resolves when all plugins have been disabled
     */
    deactivate() {
        const promiser = (resolve, reject) => {
            this.Notification.deactivate();
            this.Chat.deactivate();
            return Promise.all(this._plugins.map((plugin) => plugin.deactivate()))
                .then(resolve)
                .catch(reject);
        };
        return new Promise(promiser)
            .then(() => this);
    }

    /**
     * Emit a websocket event
     *
     * @private
     *
     * @param {string} event Event to emit
     * @param {*} args... Event arguments
     * @returns {Promise<*>} Resolves to result of websocket event
     *
     * @promise
     * @fulfill {*} Resilt of websocket call
     */
    _emit() {
        const args = Array.prototype.slice.call(arguments);
        return new Promise((resolve, reject) => {
            args.push(function continuation(err) {
                if (err) {
                    return reject(err);
                }
                const results = Array.prototype.slice.call(arguments);
                results.shift();
                if (results.length < 2) {
                    return resolve(results[0]);
                }
                return resolve(results);
            });
            this.socket.emit.apply(this.socket, args);
        });
    }

    /**
     * Parser function
     *
     * @typedef {ParserFunction}
     * @function
     *
     * @param {*} data Data to Parse
     * @returns {T} Parsed object
     */

    /**
     * Retrieve and parse an object
     *
     * @public
     *
     * @param {string} func Websocket function to retrieve object from
     * @param {*} id Id parameter to websocket function
     * @param {ParserFunction<T>} parser Parse function to apply to retrieved data
     * @returns {Promise<T>} Resolves to retrieved and parsed object
     *
     * @promise
     * @fullfil {T} Retrieved and parsed object
     */
    fetchObject(func, id, parser) {
        return this._emit(func, id).then((data) => parser(data));
    }
}
Forum.io = io;
module.exports = Forum;
