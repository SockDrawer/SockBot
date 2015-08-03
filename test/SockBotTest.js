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
            objs = ['privateFns'],
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
