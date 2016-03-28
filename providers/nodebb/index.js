'use strict';

const EventEmitter = require('events').EventEmitter;

const io = require('socket.io-client'),
    request = require('request');

const utils = require('../../lib/utils'),
    postModule = require('./post'),
    topicModule = require('./topic'),
    categoryModule = require('./category'),
    userModule = require('./user'),
    notificationModule = require('./notification');

class Forum extends EventEmitter {
    constructor(config) {
        super();
        utils.mapSet(this, {
            config: config
        });
        this.Post = postModule.bindPost(this);
        this.Topic = topicModule.bindTopic(this);
        this.Category = categoryModule.bindCategory(this);
        this.User = userModule.bindUser(this);
        this.Notification = notificationModule.bindNotification(this);
        this._plugins = [];
    }

    get config() {
        return JSON.parse(JSON.stringify(utils.mapGet(this, 'config')));
    }

    get url() {
        return this.config.core.forum;
    }

    get username() {
        return this.config.core.username;
    }
    get user() {
        return utils.mapGet(this, 'user');
    }
    get owner() {
        return utils.mapGet(this, 'owner');
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
                    reject(jsonErr);
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
                        username: this.config.core.username,
                        password: this.config.core.password,
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
                this.socket = Forum.io(this.url, {
                    extraHeaders: {
                        'Cookie': cookies
                    }
                });
                this.socket.on('connect', () => this.emit('connect'));
                this.socket.on('disconnect', () => this.emit('disconnect'));
                this.socket.once('connect', () => resolve());
                this.socket.once('error', (err) => reject(err));
            })
            .then(() => this);
    }
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
            resolve();
        });
    }
    activate() {
        return this.connectWebsocket()
            .then(() => Promise.all([
                this.User.getByName(this.config.core.username),
                this.User.getByName(this.config.core.owner),
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
        return new Promise((resolve, reject) => {
                this.Notification.deactivate();
                return Promise.all(this._plugins.map((plugin) => plugin.deactivate()))
                    .then(resolve)
                    .catch(reject);
            })
            .then(() => this);
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
                if (results.length < 2) {
                    resolve(results[0]);
                } else {
                    resolve(results);
                }
            });
            this.socket.emit.apply(this.socket, args);
        });
    }
    fetchObject(func, id, parser) {
        return this._emit(func, id).then((data) => parser(data));
    }
}
Forum.io = io;
module.exports = Forum;
