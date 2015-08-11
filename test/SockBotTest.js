'use strict';
/*globals describe, it, beforeEach, afterEach*/
/*eslint no-unused-expressions:0 */

const EventEmitter = require('events').EventEmitter;

const chai = require('chai'),
    sinon = require('sinon'),
    async = require('async');
chai.should();
const expect = chai.expect;

// The thing we're testing
const SockBot = require('../SockBot'),
    browserPlugin = require('../browser'),
    commands = require('../commands'),
    messages = require('../messages'),
    notifications = require('../notifications'),
    config = require('../config'),
    utils = require('../utils');
const browser = browserPlugin();

describe('SockBot', () => {
    describe('exports', () => {
        const fns = ['start', 'stop', 'prepare'],
            objs = ['privateFns', 'internals'],
            vals = ['version', 'releaseName'];
        describe('should export expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(SockBot[fn]).to.be.a('function'));
            });
        });
        describe('should export expected objects', () => {
            objs.forEach((obj) => {
                it(obj, () => expect(SockBot[obj]).to.be.a('object'));
            });
        });
        describe('should export expected values', () => {
            vals.forEach((val) => {
                it(val, () => SockBot.should.have.any.key(val));
            });
        });
        it('should export only expected keys', () => {
            SockBot.should.have.all.keys(fns.concat(objs, vals));
        });
    });
    describe('privateFns', () => {
        const fns = ['doPluginRequire', 'loadConfig', 'loadPlugins', 'prepareEvents'];
        describe('should export expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(SockBot.privateFns[fn]).to.be.a('function'));
            });
        });
        it('should export only expected keys', () => {
            SockBot.privateFns.should.have.all.keys(fns);
        });
        describe('doPluginRequire()', () => {
            const doPluginRequire = SockBot.privateFns.doPluginRequire;
            let requireIt;
            beforeEach(() => requireIt = sinon.stub());
            it('should call requireIt parameter', () => {
                doPluginRequire('foo', requireIt);
                requireIt.called.should.be.true;
            });
            it('should call requireIt with munged path first', () => {
                doPluginRequire('foo', requireIt);
                requireIt.firstCall.args[0].should.equal('./plugins/foo');
            });
            it('should return results of requireIt with munged path first', () => {
                const value = Math.random();
                requireIt.returns(value);
                expect(doPluginRequire('foo', requireIt)).to.equal(value);
            });
            it('should call requireIt with unmunged path if munged is ENOENT', () => {
                requireIt.onFirstCall().throws(new Error('Cannot find module this is ignored nonsensical text'));
                doPluginRequire('foo', requireIt);
                requireIt.firstCall.args[0].should.equal('./plugins/foo');
                requireIt.secondCall.args[0].should.equal('foo');
            });
            it('should return results of requireIt with unmunged path if munged is ENOENT', () => {
                const value = Math.random();
                requireIt.onFirstCall().throws(new Error('Cannot find module this is ignored nonsensical text'));
                requireIt.onSecondCall().returns(value);
                expect(doPluginRequire('foo', requireIt)).to.equal(value);
            });
            it('should rethrow error from munged path if is not ENOENT', () => {
                const value = new Error('i am nonsensical error text');
                requireIt.onFirstCall().throws(value);
                requireIt.onSecondCall().returns(value);
                expect(() => doPluginRequire('foo', requireIt)).to.throw(value);
            });
            it('should rethrow error from unmunged path if is ENOENT', () => {
                const value = new Error('Cannot find module this is ignored nonsensical text');
                requireIt.onFirstCall().throws(value);
                requireIt.onSecondCall().throws(value);
                expect(() => doPluginRequire('foo', requireIt)).to.throw(value);
            });
            it('should rethrow error from unmunged path if is not ENOENT', () => {
                const value = new Error('this is ignored nonsensical text');
                requireIt.onFirstCall().throws(new Error('Cannot find module this is ignored nonsensical text'));
                requireIt.onSecondCall().throws(value);
                expect(() => doPluginRequire('foo', requireIt)).to.throw(value);
            });
        });
        describe('prepareEvents()', () => {
            const prepareEvents = SockBot.privateFns.prepareEvents;
            let sandbox, tick;
            beforeEach(() => {
                tick = async.nextTick;
                sandbox = sinon.sandbox.create();
                sandbox.stub(browser, 'setPlugins');
                sandbox.stub(utils, 'uuid');
                sandbox.stub(messages, 'prepare');
                sandbox.stub(notifications, 'prepare');
                sandbox.stub(commands, 'prepare');
                sandbox.stub(browser, 'prepare');
                sandbox.useFakeTimers();
                async.nextTick = (fn) => setTimeout(fn, 0);
            });
            afterEach(() => {
                sandbox.restore();
                async.nextTick = tick;
            });
            describe('setup calls', () => {
                describe('messages', () => {
                    it('should call messages.prepare()', () => {
                        const spy = sinon.spy();
                        messages.prepare.yields(null);
                        notifications.prepare.yields(null);
                        commands.prepare.yields(null);
                        browser.prepare.yields(null);
                        prepareEvents(spy);
                        sandbox.clock.tick(0);
                        spy.called.should.be.true;
                        messages.prepare.called.should.be.true;
                    });
                    it('should give EventEmitter to messages.prepare()', () => {
                        notifications.prepare.yields(null);
                        messages.prepare.yields(null);
                        notifications.prepare.yields(null);
                        commands.prepare.yields(null);
                        browser.prepare.yields(null);
                        prepareEvents(() => 0);
                        sandbox.clock.tick(0);
                        messages.prepare.firstCall.args[0].should.be.an.instanceOf(EventEmitter);
                    });
                    it('should give clientId to messages.prepare()', () => {
                        const id = Math.random();
                        notifications.prepare.yields(null);
                        messages.prepare.yields(null);
                        commands.prepare.yields(null);
                        utils.uuid.returns(id);
                        prepareEvents(() => 0);
                        sandbox.clock.tick(0);
                        messages.prepare.firstCall.args[1].should.equal(id);
                    });
                });
                describe('notifications', () => {
                    it('should call notifications.prepare()', () => {
                        const spy = sinon.spy();
                        messages.prepare.yields(null);
                        notifications.prepare.yields(null);
                        commands.prepare.yields(null);
                        browser.prepare.yields(null);
                        prepareEvents(spy);
                        sandbox.clock.tick(0);
                        spy.called.should.be.true;
                        notifications.prepare.called.should.be.true;
                    });
                    it('should give EventEmitter to notifications.prepare()', () => {
                        messages.prepare.yields(null);
                        notifications.prepare.yields(null);
                        commands.prepare.yields(null);
                        browser.prepare.yields(null);
                        prepareEvents(() => 0);
                        sandbox.clock.tick(0);
                        notifications.prepare.firstCall.args[0].should.be.an.instanceOf(EventEmitter);
                    });
                });
                describe('commands', () => {
                    it('should call commands.prepare()', () => {
                        notifications.prepare.yields(null);
                        messages.prepare.yields(null);
                        notifications.prepare.yields(null);
                        commands.prepare.yields(null);
                        browser.prepare.yields(null);
                        prepareEvents(() => 0);
                        sandbox.clock.tick(0);
                        commands.prepare.called.should.be.true;
                    });
                    it('should give EventEmitter to commands.prepare()', () => {
                        notifications.prepare.yields(null);
                        messages.prepare.yields(null);
                        notifications.prepare.yields(null);
                        commands.prepare.yields(null);
                        browser.prepare.yields(null);
                        prepareEvents(() => 0);
                        sandbox.clock.tick(0);
                        commands.prepare.firstCall.args[0].should.be.an.instanceOf(EventEmitter);
                    });
                });
                describe('browser', () => {
                    it('should call browser.setPlugins()', () => {
                        notifications.prepare.yields(null);
                        messages.prepare.yields(null);
                        commands.prepare.yields(null);
                        prepareEvents(() => 0);
                        sandbox.clock.tick(0);
                        browser.setPlugins.called.should.be.true;
                    });
                    it('should call browser.prepare()', () => {
                        notifications.prepare.yields(null);
                        messages.prepare.yields(null);
                        notifications.prepare.yields(null);
                        commands.prepare.yields(null);
                        browser.prepare.yields(null);
                        prepareEvents(() => 0);
                        sandbox.clock.tick(0);
                        browser.prepare.called.should.be.true;
                    });
                    it('should give EventEmitter to browser.prepare()', () => {
                        notifications.prepare.yields(null);
                        messages.prepare.yields(null);
                        notifications.prepare.yields(null);
                        commands.prepare.yields(null);
                        browser.prepare.yields(null);
                        prepareEvents(() => 0);
                        sandbox.clock.tick(0);
                        browser.prepare.firstCall.args[0].should.be.an.instanceOf(EventEmitter);
                    });
                });
            });
            it('should yield error when messages.prepare() yields error', () => {
                const error = new Error('i am a friendly error!'),
                    spy = sinon.spy();
                messages.prepare.yields(error);
                notifications.prepare.yields(null);
                commands.prepare.yields(null);
                prepareEvents(spy);
                sandbox.clock.tick(0);
                spy.calledWith(error).should.be.true;
            });
            it('should yield error when notifications.prepare() yields error', () => {
                const error = new Error('i am a friendly error!'),
                    spy = sinon.spy();
                messages.prepare.yields(null);
                notifications.prepare.yields(error);
                commands.prepare.yields(null);
                prepareEvents(spy);
                sandbox.clock.tick(0);
                spy.calledWith(error).should.be.true;
            });
            it('should yield error when commands.prepare() yields error', () => {
                const error = new Error('i am a friendly error!'),
                    spy = sinon.spy();
                messages.prepare.yields(null);
                notifications.prepare.yields(null);
                commands.prepare.yields(error);
                prepareEvents(spy);
                sandbox.clock.tick(0);
                spy.calledWith(error).should.be.true;
            });
            it('should yield error when browser.prepare() yields error', () => {
                const error = new Error('i am a friendly error!'),
                    spy = sinon.spy();
                messages.prepare.yields(null);
                notifications.prepare.yields(null);
                commands.prepare.yields(null);
                browser.prepare.yields(error);
                prepareEvents(spy);
                sandbox.clock.tick(0);
                spy.calledWith(error).should.be.true;
            });
            it('should yield no error when all preparation passes', () => {
                const spy = sinon.spy();
                messages.prepare.yields(null);
                notifications.prepare.yields(null);
                commands.prepare.yields(null);
                browser.prepare.yields(null);
                prepareEvents(spy);
                sandbox.clock.tick(0);
                spy.calledWith(null).should.equal(true);
            });
            it('should pass events to callback when all preparation passes', () => {
                const spy = sinon.spy();
                messages.prepare.yields(null);
                notifications.prepare.yields(null);
                commands.prepare.yields(null);
                browser.prepare.yields(null);
                prepareEvents(spy);
                sandbox.clock.tick(0);
                spy.firstCall.args[1].should.be.a.instanceOf(EventEmitter);
            });
            it('should pass browser to callback when all preparation passes', () => {
                const spy = sinon.spy(),
                    browse = Math.random();
                browser.setPlugins.returns(browse);
                messages.prepare.yields(null);
                notifications.prepare.yields(null);
                commands.prepare.yields(null);
                browser.prepare.yields(null);
                prepareEvents(spy);
                sandbox.clock.tick(0);
                spy.firstCall.args[2].should.equal(browse);
            });
        });
        describe('loadPlugins()', () => {
            const loadPlugins = SockBot.privateFns.loadPlugins;
            let sandbox, doPluginRequire;
            beforeEach(() => {
                sandbox = sinon.sandbox.create();
                doPluginRequire = sandbox.stub(SockBot.privateFns, 'doPluginRequire');
                sandbox.stub(utils, 'error');
                sandbox.stub(utils, 'log');
                SockBot.internals.plugins = [];
            });
            afterEach(() => sandbox.restore());
            it('should throw when doPluginRequire throws', () => {
                const err = new Error('who am i?');
                doPluginRequire.throws(err);
                config.plugins = {
                    'erroring': true
                };
                expect(loadPlugins).to.throw(err);
            });
            it('should print error when prepare() function is missing', () => {
                const module = {
                    start: () => 0,
                    stop: () => 0
                };
                doPluginRequire.returns(module);
                config.plugins = {
                    'missingno': true
                };
                loadPlugins();
                utils.error.calledWith('Plugin `missingno` does not export `prepare()` function').should.equal(true);
                SockBot.internals.plugins.should.have.length(0);
            });
            it('should print error when start() function is missing', () => {
                const module = {
                    prepare: () => 0,
                    stop: () => 0
                };
                doPluginRequire.returns(module);
                config.plugins = {
                    'missingno': true
                };
                loadPlugins();
                utils.error.calledWith('Plugin `missingno` does not export `start()` function').should.equal(true);
                SockBot.internals.plugins.should.have.length(0);
            });
            it('should print error when stop() function is missing', () => {
                const module = {
                    start: () => 0,
                    prepare: () => 0
                };
                doPluginRequire.returns(module);
                config.plugins = {
                    'missingno': true
                };
                loadPlugins();
                utils.error.calledWith('Plugin `missingno` does not export `stop()` function').should.equal(true);
                SockBot.internals.plugins.should.have.length(0);
            });
            it('should add module to plugins list on success', () => {
                const module = {
                    prepare: () => 0,
                    start: () => 0,
                    stop: () => 0
                };
                doPluginRequire.returns(module);
                config.plugins = {
                    'myModule': true
                };
                loadPlugins();
                utils.error.called.should.equal(false);
                SockBot.internals.plugins.should.deep.equal([module]);
                module.prepare.pluginName.should.equal('myModule');
            });
            it('should log message on success', () => {
                const module = {
                    prepare: () => 0,
                    start: () => 0,
                    stop: () => 0
                };
                doPluginRequire.returns(module);
                config.plugins = {
                    'myModule': true
                };
                loadPlugins();
                utils.log.calledWith('Plugin `myModule` Loaded').should.be.true;
            });
            it('should support multiple plugins', () => {
                const module1 = {
                        prepare: () => 0,
                        start: () => 0,
                        stop: () => 0
                    },
                    module2 = {
                        prepare: () => 0,
                        start: () => 0,
                        stop: () => 0
                    };
                doPluginRequire.onFirstCall().returns(module1);
                doPluginRequire.returns(module2);
                config.plugins = {
                    'myModule1': true,
                    'myModule2': true
                };
                loadPlugins();
                SockBot.internals.plugins.should.deep.equal([module1, module2]);
            });
        });
        describe('loadConfig()', () => {
            const loadConfig = SockBot.privateFns.loadConfig;
            let sandbox, origCore, origPlugins;
            beforeEach(function () {
                origCore = config.core;
                origPlugins = config.plugins;
                sandbox = sinon.sandbox.create();
                sandbox.stub(config, 'loadConfiguration');
            });
            afterEach(function () {
                config.core = origCore;
                config.plugins = origPlugins;
                sandbox.restore();
            });
            it('should call loadConfiguration with string input', () => {
                const spy = sinon.spy();
                loadConfig('foobar', spy);
                config.loadConfiguration.calledWith('foobar', spy).should.be.true;
            });
            it('should call loadConfiguration with bare object input', () => {
                const spy = sinon.spy(),
                    obj = {};
                loadConfig(obj, spy);
                config.loadConfiguration.calledWith(obj, spy).should.be.true;
            });
            it('should call loadConfiguration with input object missing core key', () => {
                const spy = sinon.spy(),
                    obj = {
                        plugins: {}
                    };
                loadConfig(obj, spy);
                config.loadConfiguration.calledWith(obj, spy).should.be.true;
            });
            it('should call loadConfiguration with input object missing core key', () => {
                const spy = sinon.spy(),
                    obj = {
                        core: {}
                    };
                loadConfig(obj, spy);
                config.loadConfiguration.calledWith(obj, spy).should.be.true;
            });
            it('should call loadConfiguration with input object.core wrong type', () => {
                const spy = sinon.spy(),
                    obj = {
                        core: true,
                        plugins: {}
                    };
                loadConfig(obj, spy);
                config.loadConfiguration.calledWith(obj, spy).should.be.true;
            });
            it('should call loadConfiguration with input object.plugins wrong type', () => {
                const spy = sinon.spy(),
                    obj = {
                        core: {},
                        plugins: 4
                    };
                loadConfig(obj, spy);
                config.loadConfiguration.calledWith(obj, spy).should.be.true;
            });
            it('should set configuration based on input object with proper keys', () => {
                const spy = sinon.spy(),
                    core = {},
                    plugins = {},
                    obj = {
                        core: core,
                        plugins: plugins
                    };
                loadConfig(obj, spy);
                config.loadConfiguration.called.should.be.false;
                config.core.should.equal(core);
                config.plugins.should.equal(plugins);
            });
        });
    });
    describe('prepare()', () => {
        let sandbox, tick;
        beforeEach(() => {
            tick = async.setImmediate;
            sandbox = sinon.sandbox.create();
            sandbox.stub(SockBot.privateFns, 'loadConfig');
            sandbox.stub(SockBot.privateFns, 'prepareEvents');
            sandbox.stub(SockBot.privateFns, 'loadPlugins');
            sandbox.useFakeTimers();
            async.setImmediate = (fn) => setTimeout(fn, 0);
            SockBot.internals.plugins = [];
        });
        afterEach(() => {
            sandbox.restore();
            async.setImmediate = tick;
        });
        it('should call privateFns.loadConfig()', () => {
            SockBot.privateFns.loadConfig.yields(null, null);
            SockBot.privateFns.prepareEvents.yields(null, null, null);
            SockBot.privateFns.loadPlugins.returns(null);
            const spy = sinon.spy(),
                cfg = Math.random();
            SockBot.prepare(cfg, spy);
            sandbox.clock.tick(0);
            SockBot.privateFns.loadConfig.calledWith(cfg).should.be.true;
        });
        it('should call privateFns.prepareEvents()', () => {
            SockBot.privateFns.loadConfig.yields(null, null);
            SockBot.privateFns.prepareEvents.yields(null, null, null);
            SockBot.privateFns.loadPlugins.returns(null);
            const spy = sinon.spy(),
                cfg = Math.random();
            SockBot.prepare(cfg, spy);
            sandbox.clock.tick(0);
            SockBot.privateFns.prepareEvents.called.should.be.true;
        });
        it('should call privateFns.loadPlugins()', () => {
            SockBot.privateFns.loadConfig.yields(null, null);
            SockBot.privateFns.prepareEvents.yields(null, null, null);
            SockBot.privateFns.loadPlugins.returns(null);
            const spy = sinon.spy(),
                cfg = Math.random();
            SockBot.prepare(cfg, spy);
            sandbox.clock.tick(0);
            SockBot.privateFns.loadPlugins.called.should.be.true;
        });
        it('should call prepare() on plugins', () => {
            const plugin = {
                    prepare: sinon.spy()
                },
                plgConfig = {},
                spy = sinon.spy(),
                events = Math.random(),
                plgBrowser = Math.random();
            plugin.prepare.pluginName = 'plugin';
            config.plugins = {
                plugin: plgConfig
            };
            SockBot.internals.plugins = [plugin];
            SockBot.privateFns.loadConfig.yields(null, null);
            SockBot.privateFns.prepareEvents.yields(null, events, plgBrowser);
            SockBot.privateFns.loadPlugins.returns(null);
            SockBot.prepare({}, spy);
            sandbox.clock.tick(0);
            plugin.prepare.calledWith(plgConfig, config, events, plgBrowser).should.be.true;
        });
        it('should pass events and pluginBrowser to callback on success', () => {
            const spy = sinon.spy(),
                events = Math.random(),
                plgBrowser = Math.random();
            SockBot.privateFns.loadConfig.yields(null, null);
            SockBot.privateFns.prepareEvents.yields(null, events, plgBrowser);
            SockBot.privateFns.loadPlugins.returns(null);
            SockBot.prepare({}, spy);
            sandbox.clock.tick(0);
            spy.calledWith(null, events, plgBrowser).should.be.true;
        });
        it('should yield error when loadConfig errors', () => {
            const spy = sinon.spy(),
                err = new Error();
            SockBot.privateFns.loadConfig.yields(err);
            SockBot.privateFns.prepareEvents.yields(null, null, null);
            SockBot.privateFns.loadPlugins.returns(null);
            SockBot.prepare({}, spy);
            sandbox.clock.tick(0);
            spy.calledWith(err).should.be.true;
            SockBot.privateFns.prepareEvents.called.should.be.false;
            SockBot.privateFns.loadPlugins.called.should.be.false;
        });
        it('should yield error when prepareEvents errors', () => {
            const spy = sinon.spy(),
                err = new Error();
            SockBot.privateFns.loadConfig.yields(null, null);
            SockBot.privateFns.prepareEvents.yields(err, null, null);
            SockBot.privateFns.loadPlugins.returns(null);
            SockBot.prepare({}, spy);
            sandbox.clock.tick(0);
            spy.calledWith(err).should.be.true;
            SockBot.privateFns.loadPlugins.called.should.be.false;
        });
        it('should yield error when loadPlugins errors', () => {
            const spy = sinon.spy(),
                err = new Error();
            SockBot.privateFns.loadConfig.yields(null, null);
            SockBot.privateFns.prepareEvents.yields(null, null, null);
            SockBot.privateFns.loadPlugins.throws(err);
            SockBot.prepare({}, spy);
            sandbox.clock.tick(0);
            spy.calledWith(err).should.be.true;
        });
    });
    describe('start()', () => {
        let sandbox;
        const ievents = notifications.internals;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            sandbox.stub(utils, 'log');
            sandbox.stub(utils, 'warn');
            sandbox.stub(browser, 'login');
            sandbox.stub(async, 'whilst');
            sandbox.stub(messages, 'pollMessages');
            sandbox.stub(notifications, 'pollNotifications');
            sandbox.stub(messages, 'start');
            sandbox.stub(notifications, 'start');
            sandbox.stub(commands, 'start');
            sandbox.stub(browser, 'start');
            sandbox.useFakeTimers();
            notifications.internals.events = {
                onChannel: () => 0
            };
        });
        afterEach(function () {
            sandbox.restore();
            notifications.internals = ievents;
        });
        it('should pass error to callback on login error', () => {
            const err = new Error(),
                spy = sinon.spy();
            browser.login.yields(err);
            SockBot.start(spy);
            spy.calledWith(err).should.be.true;
        });
        it('should pass null to callback on login success', () => {
            const spy = sinon.spy();
            browser.login.yields(null, {});
            SockBot.start(spy);
            spy.calledWith(null).should.be.true;
        });
        it('should warn on login error', () => {
            const err = new Error('i am a scary error! wooo!');
            browser.login.yields(err);
            SockBot.start(() => 0);
            utils.warn.calledWith('Login Failed: Error: i am a scary error! wooo!').should.be.true;
        });
        it('should set config.user', () => {
            const user = {};
            browser.login.yields(null, user);
            SockBot.start(() => 0);
            config.user.should.equal(user);
        });
        it('should log startup message', () => {
            const user = {
                username: 'fred' + Math.random()
            };
            browser.login.yields(null, user);
            SockBot.start(() => 0);
            utils.log.calledWith('SockBot `' + user.username + '` Started');
        });
        it('should set run flag', () => {
            SockBot.internals.running = undefined;
            browser.login.yields(null, {});
            SockBot.start(() => 0);
            SockBot.internals.running.should.be.true;
        });
        it('should set set two async forevers', () => {
            SockBot.internals.running = undefined;
            browser.login.yields(null, {});
            SockBot.start(() => 0);
            async.whilst.callCount.should.equal(2);
        });
        describe('start core', () => {
            it('should call messages.start()', () => {
                browser.login.yields(null, {});
                SockBot.start(() => 0);
                messages.start.called.should.be.true;
            });
            it('should call notifications.start()', () => {
                browser.login.yields(null, {});
                SockBot.start(() => 0);
                notifications.start.called.should.be.true;
            });
            it('should call commands.start()', () => {
                browser.login.yields(null, {});
                SockBot.start(() => 0);
                commands.start.called.should.be.true;
            });
            it('should start browser module', () => {
                const spy = sinon.spy();
                SockBot.start(spy);
                browser.start.called.should.be.true;
            });
        });
        describe('messages', () => {
            it('should respect running flag in messages poll', () => {
                SockBot.internals.running = undefined;
                config.core.pollMessages = true;
                browser.login.yields(null, {});
                SockBot.start(() => 0);
                const test = async.whilst.firstCall.args[0];
                SockBot.internals.running = Math.random();
                test().should.equal(SockBot.internals.running);
            });
            it('should respect config setting disabling message polling', () => {
                SockBot.internals.running = undefined;
                config.core.pollMessages = false;
                browser.login.yields(null, {});
                SockBot.start(() => 0);
                const test = async.whilst.firstCall.args[1],
                    spy = sinon.spy();
                test(spy);
                messages.start.called.should.be.false;
                messages.pollMessages.called.should.be.false;
            });
            it('should call messages.pollMessages() from first async forever', () => {
                SockBot.internals.running = undefined;
                config.core.pollMessages = true;
                browser.login.yields(null, {});
                SockBot.start(() => 0);
                const test = async.whilst.firstCall.args[1],
                    spy = sinon.spy();
                test(spy);
                messages.pollMessages.called.should.be.true;
            });
            it('should schedule next message poll for three sedonds from now', () => {
                SockBot.internals.running = undefined;
                config.core.pollMessages = true;
                browser.login.yields(null, {});
                SockBot.start(() => 0);
                const test = async.whilst.firstCall.args[1],
                    spy = sinon.spy();
                messages.pollMessages.yields(null);
                test(spy);
                sandbox.clock.tick(2999);
                spy.called.should.be.false;
                sandbox.clock.tick(1);
                spy.called.should.be.true;
            });
        });
        describe('notifications', () => {
            it('should respect running flag in notifications poll', () => {
                SockBot.internals.running = undefined;
                browser.login.yields(null, {});
                SockBot.start(() => 0);
                const test = async.whilst.secondCall.args[0];
                SockBot.internals.running = Math.random();
                test().should.equal(SockBot.internals.running);
            });
            it('should respect config setting disabling notifications polling', () => {
                SockBot.internals.running = undefined;
                config.core.pollNotifications = false;
                browser.login.yields(null, {});
                SockBot.start(() => 0);
                const test = async.whilst.firstCall.args[1], //Using secondCall errors, as there's no second call
                    spy = sinon.spy();
                test(spy);
                notifications.start.called.should.be.false;
                notifications.pollNotifications.called.should.be.false;
            });
            it('should call notifications.pollNotifications() from second async forever', () => {
                SockBot.internals.running = undefined;
                config.core.pollNotifications = true;
                browser.login.yields(null, {});
                SockBot.start(() => 0);
                const test = async.whilst.secondCall.args[1],
                    spy = sinon.spy();
                test(spy);
                notifications.pollNotifications.called.should.be.true;
            });
            it('should schedule next notifications.poll for five minutes from now', () => {
                SockBot.internals.running = undefined;
                config.core.pollNotifications = true;
                browser.login.yields(null, {});
                SockBot.start(() => 0);
                const test = async.whilst.secondCall.args[1],
                    spy = sinon.spy();
                notifications.pollNotifications.yields(null);
                test(spy);
                sandbox.clock.tick(5 * 60 * 1000 - 1);
                spy.called.should.be.false;
                sandbox.clock.tick(1);
                spy.called.should.be.trued;
            });
        });
        it('should start plugins', () => {
            const plugin1 = {
                    start: sinon.spy()
                },
                plugin2 = {
                    start: sinon.spy()
                };
            SockBot.internals.plugins = [plugin1, plugin2];
            browser.login.yields(null, {});
            SockBot.start(() => 0);
            plugin1.start.called.should.be.true;
            plugin2.start.called.should.be.true;
        });
    });
    describe('stop()', () => {
        let sandbox;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            sandbox.stub(utils, 'log');
            sandbox.stub(browser, 'stop');
        });
        it('should stop plugins', () => {
            const plugin1 = {
                    stop: sinon.spy()
                },
                plugin2 = {
                    stop: sinon.spy()
                };
            SockBot.internals.plugins = [plugin1, plugin2];
            SockBot.stop();
            plugin1.stop.called.should.be.true;
            plugin2.stop.called.should.be.true;
        });
        it('should unset running flag', () => {
            SockBot.internals.running = true;
            SockBot.stop();
            SockBot.internals.running.should.be.false;
        });
        it('should stop browser module', () => {
            const spy = sinon.spy();
            SockBot.stop(spy);
            browser.stop.called.should.be.true;
        });
        it('should call callback', () => {
            const spy = sinon.spy();
            SockBot.stop(spy);
            spy.called.should.be.true;
        });
        afterEach(function () {
            sandbox.restore();
        });
    });
});
