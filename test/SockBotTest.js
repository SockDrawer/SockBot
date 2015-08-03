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
            vals = ['version'];
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
                sandbox.stub(commands, 'prepareCommands');
                sandbox.useFakeTimers();
                async.nextTick = (fn) => setTimeout(fn, 0);
            });
            afterEach(() => {
                sandbox.restore();
                async.nextTick = tick;
            });
            describe('setup calls', () => {
                it('should call browser.setPlugins()', () => {
                    notifications.prepare.yields(null);
                    messages.prepare.yields(null);
                    commands.prepareCommands.yields(null);
                    prepareEvents(() => 0);
                    sandbox.clock.tick(0);
                    browser.setPlugins.called.should.be.true;
                });
                it('should call messages.prepare()', () => {
                    const spy = sinon.spy();
                    notifications.prepare.yields(null);
                    messages.prepare.yields(null);
                    commands.prepareCommands.yields(null);
                    prepareEvents(spy);
                    sandbox.clock.tick(0);
                    spy.called.should.be.true;
                    messages.prepare.called.should.be.true;
                });
                it('should call notifications.prepare()', () => {
                    const spy = sinon.spy();
                    notifications.prepare.yields(null);
                    messages.prepare.yields(null);
                    commands.prepareCommands.yields(null);
                    prepareEvents(spy);
                    sandbox.clock.tick(0);
                    spy.called.should.be.true;
                    notifications.prepare.called.should.be.true;
                });
                it('should call commands.prepareCommands()', () => {
                    notifications.prepare.yields(null);
                    messages.prepare.yields(null);
                    commands.prepareCommands.yields(null);
                    prepareEvents(() => 0);
                    sandbox.clock.tick(0);
                    commands.prepareCommands.called.should.be.true;
                });
                it('should give EventEmitter to messages.prepare()', () => {
                    notifications.prepare.yields(null);
                    messages.prepare.yields(null);
                    commands.prepareCommands.yields(null);
                    prepareEvents(() => 0);
                    sandbox.clock.tick(0);
                    messages.prepare.firstCall.args[0].should.be.an.instanceOf(EventEmitter);
                });
                it('should give clientId to messages.prepare()', () => {
                    const id = Math.random();
                    notifications.prepare.yields(null);
                    messages.prepare.yields(null);
                    commands.prepareCommands.yields(null);
                    utils.uuid.returns(id);
                    prepareEvents(() => 0);
                    sandbox.clock.tick(0);
                    messages.prepare.firstCall.args[1].should.equal(id);
                });
                it('should give EventEmitter to notifications.prepare()', () => {
                    notifications.prepare.yields(null);
                    messages.prepare.yields(null);
                    commands.prepareCommands.yields(null);
                    prepareEvents(() => 0);
                    sandbox.clock.tick(0);
                    notifications.prepare.firstCall.args[0].should.be.an.instanceOf(EventEmitter);
                });
                it('should give EventEmitter to commands.prepareCommands()', () => {
                    notifications.prepare.yields(null);
                    messages.prepare.yields(null);
                    commands.prepareCommands.yields(null);
                    prepareEvents(() => 0);
                    sandbox.clock.tick(0);
                    commands.prepareCommands.firstCall.args[0].should.be.an.instanceOf(EventEmitter);
                });
            });
            it('should yield error when messages.prepare() yields error', () => {
                const error = new Error('i am a friendly error!'),
                    spy = sinon.spy();
                messages.prepare.yields(error);
                notifications.prepare.yields(null);
                commands.prepareCommands.yields(null);
                prepareEvents(spy);
                sandbox.clock.tick(0);
                spy.calledWith(error).should.be.true;
            });
            it('should yield error when notifications.prepare() yields error', () => {
                const error = new Error('i am a friendly error!'),
                    spy = sinon.spy();
                messages.prepare.yields(null);
                notifications.prepare.yields(error);
                commands.prepareCommands.yields(null);
                prepareEvents(spy);
                sandbox.clock.tick(0);
                spy.calledWith(error).should.be.true;
            });
            it('should yield error when commands.prepareCommands() yields error', () => {
                const error = new Error('i am a friendly error!'),
                    spy = sinon.spy();
                messages.prepare.yields(null);
                notifications.prepare.yields(null);
                commands.prepareCommands.yields(error);
                prepareEvents(spy);
                sandbox.clock.tick(0);
                spy.calledWith(error).should.be.true;
            });
            it('should yield no error when all preparation passes', () => {
                const spy = sinon.spy();
                messages.prepare.yields(null);
                notifications.prepare.yields(null);
                commands.prepareCommands.yields(null);
                prepareEvents(spy);
                sandbox.clock.tick(0);
                spy.calledWith(null).should.equal(true);
            });
            it('should pass events to callback when all preparation passes', () => {
                const spy = sinon.spy();
                messages.prepare.yields(null);
                notifications.prepare.yields(null);
                commands.prepareCommands.yields(null);
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
                commands.prepareCommands.yields(null);
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
    });
    describe('start', () => {
        let sandbox;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            sandbox.stub(console, 'log');
        });
        afterEach(function () {
            sandbox.restore();
        });
    });
});
