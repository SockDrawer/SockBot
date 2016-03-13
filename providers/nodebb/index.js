'use strict';

const io = require('socket.io-client'),
    request = require('request');

const bindPost = require('./post').bindPost;
const bindTopic = require('./topic').bindTopic;
const bindCategory = require('./category').bindCategory;

class Forum {
    constructor(baseUrl) {
        this.url = baseUrl;
        this.Post = bindPost(this);
        this.Topic = bindTopic(this);
        this.Category = bindCategory(this);
    }
    login(username, password) {
        return new Promise((resolve, reject) => {
            const jar = request.jar();
            request.get({
                url: this.url + '/api/config',
                jar: jar
            }, (e, _, data) => {
                if (e) {
                    return reject(e);
                }
                let config;
                try {
                    config = JSON.parse(data);
                } catch (err) {
                    if (err) {
                        return reject(err);
                    }
                }
                request.post({
                    url: this.url + '/login',
                    jar: jar,
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
                    const cookies = jar.getCookieString(this.url);
                    this.socket = io(this.url, {
                        extraHeaders: {
                            'Cookie': cookies
                        }
                    });
                    resolve(this);
                });
            });
        });
    }
    activate() {}
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
