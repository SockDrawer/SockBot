'use strict';

const EventEmitter = require('events').EventEmitter;

const io = require('socket.io-client'),
    request = require('request');

const utils = require('../../lib/utils'),
    bindPost = require('./post').bindPost,
    bindTopic = require('./topic').bindTopic,
    bindCategory = require('./category').bindCategory,
    bindUser = require('./user').bindUser,
    bindNotification = require('./notification').bindNotification;

class Forum extends EventEmitter {
    constructor(config) {
        super();
        utils.mapSet(this, config);
        this.Post = bindPost(this);
        this.Topic = bindTopic(this);
        this.Category = bindCategory(this);
        this.User = bindUser(this);
        this.Notification = bindNotification(this);
        this._plugins = [];
    }

    get url() {
        return utils.mapGet(this, 'core').forum;
    }

    get username() {
        return utils.mapGet(this, 'core').username;
    }
    get user() {
        return utils.mapGet(this, 'core').user;
    }
    get owner() {
        return utils.mapGet(this, 'core').owner;
    }

    get Commands() {
        return utils.mapGet(this, 'commands');
    }

    set Commands(commands) {
        utils.mapSet(this, 'commands', commands);
    }

    _verifyCookies() {
        const jar = this._cookiejar || request.jar();
        this._cookiejar = jar;
    }

    _getConfig() {
        this._verifyCookies();
        this._config = {};
        return new Promise((resolve, reject) => {
            request.get({
                url: `${this.url}/api/config`,
                jar: this._cookiejar
            }, (err, _, data) => {
                if (err) {
                    return reject(err);
                }
                try {
                    this._config = JSON.parse(data);
                    resolve(this._config);
                } catch (jsonErr) {
                    if (jsonErr) {
                        reject(jsonErr);
                    }
                }
            });
        });
    }
    login() {
        return this._getConfig()
            .then((config) => new Promise((resolve, reject) => {
                this._verifyCookies();
                request.post({
                    url: this.url + '/login',
                    jar: this._cookiejar,
                    headers: {
                        'x-csrf-token': config.csrf_token
                    },
                    form: {
                        username: utils.mapGet(this, 'core').username,
                        password: utils.mapGet(this, 'core').password,
                        remember: 'off',
                        returnTo: this.url
                    }
                }, (loginError) => {
                    if (loginError) {
                        return reject(loginError);
                    }
                    resolve();
                });
            }))
            .then(() => Promise.resolve(this));
    }
    connectWebsocket() {
        if (this.socket) {
            return Promise.resolve(this);
        }
        return new Promise((resolve, reject) => {
                this._verifyCookies();
                const cookies = this._cookiejar.getCookieString(this.url);
                this.socket = io(this.url, {
                    extraHeaders: {
                        'Cookie': cookies
                    }
                });
                this.socket.on('connect', () => this.emit('connect'));
                this.socket.on('disconnect', () => this.emit('disconnect'));
                this.socket.once('connect', () => resolve());
            })
            .then(() => this);
    }
    addPlugin(fnPlugin, pluginConfig) {
        console.log(arguments);
        return new Promise((resolve, reject) => {
            const plugin = fnPlugin.plugin(this, pluginConfig);
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
        });
    }
    activate() {
        return this.connectWebsocket()
            .then(() => Promise.all([
                this.User.getByName(utils.mapGet(this, 'core').username),
                this.User.getByName(utils.mapGet(this, 'core').owner),
            ]))
            .then((data) => {
                utils.mapSet(this, 'user', data[0]);
                utils.mapSet(this, 'owner', data[1]);
            })
            .then(() => {
                this.Notification.activate();
                return Promise.all(this._plugins.map((plugin) => plugin.activate()));
            })
            .then(() => this);
    }
    deactivate() {
        this.Notification.deactivate();
        return Promise.resolve(this);
    }
    _emit(event, arg) {
        const args = Array.prototype.slice.call(arguments);
        return new Promise((resolve, reject) => {
            args.push(function (e) {
                if (e) {
                    return reject(e);
                }
                const results = Array.prototype.slice.call(arguments);
                results.shift();
                resolve.apply(undefined, results);
            });
            this.socket.emit.apply(this.socket, args);
        });
    }
}
exports.Forum = Forum;
