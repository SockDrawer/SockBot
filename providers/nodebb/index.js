'use strict';

const EventEmitter = require('events').EventEmitter;

const io = require('socket.io-client'),
    request = require('request');

const bindPost = require('./post').bindPost;
const bindTopic = require('./topic').bindTopic;
const bindCategory = require('./category').bindCategory,
    bindUser = require('./user').bindUser,
    bindNotification = require('./notification').bindNotification,
    bindCommands = require('./commands').bindCommands;

class Forum extends EventEmitter {
    constructor(baseUrl) {
        super();
        this.url = baseUrl;
        this.Post = bindPost(this);
        this.Topic = bindTopic(this);
        this.Category = bindCategory(this);
        this.User = bindUser(this);
        this.Notification = bindNotification(this);
        this.Commands = bindCommands(this);
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
    login(username, password) {
        this.username = username;
        return this._getConfig().then((config) => new Promise((resolve, reject) => {
            this._verifyCookies();
            request.post({
                url: this.url + '/login',
                jar: this._cookiejar,
                headers: {
                    'x-csrf-token': config.csrf_token
                },
                form: {
                    username: username,
                    password: password,
                    remember: 'off',
                    returnTo: this.url
                }
            }, (loginError) => {
                if (loginError) {
                    return reject(loginError);
                }
                resolve(this);
            });
        }));
    }
    connectWebsocket() {
        this._verifyCookies();
        const cookies = this._cookiejar.getCookieString(this.url);
        this.socket = io(this.url, {
            extraHeaders: {
                'Cookie': cookies
            }
        });
        this.socket.on('connect', () => this.emit('connect'));
        this.socket.on('disconnect', () => this.emit('disconnect'));
        return Promise.resolve(this);
    }
    activate() {
        if (this.socket){
            return Promise.resolve(this);
        }
        return this.connectWebsocket();
    }
    deactivate() {}
    setHelpTopic(topic, description, helpText) {}
    onCommand(command, description, handler) {}
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
