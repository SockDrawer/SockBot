'use strict';
/*globals describe, it, before, beforeEach, after, afterEach*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon');

chai.should();
const expect = chai.expect;

const messages = require('../messages');

describe('browser', () => {
    describe('exports', () => {
        const fns = ['prepare'],
            objs = ['internals', 'privateFns'],
            vals = [];
        describe('should export expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(messages[fn]).to.be.a('function'));
            });
        });
        describe('should export expected objects', () => {
            objs.forEach((obj) => {
                it(obj, () => expect(messages[obj]).to.be.a('object'));
            });
        });
        describe('should export expected values', () => {
            vals.forEach((val) => {
                it(val, () => messages.should.have.key(val));
            });
        });
        it('should export only expected keys', () => {
            messages.should.have.all.keys(fns.concat(objs, vals));
        });
    });
    describe('internals', () => {
        const fns = [],
            objs = ['clientId', 'events', 'channels', 'channelCounts'],
            vals = [];
        describe('should include expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(messages.internals[fn]).to.be.a('function'));
            });
        });
        describe('should include expected objects', () => {
            objs.forEach((obj) => {
                it(obj, () => (typeof messages.internals[obj]).should.equal('object'));
            });
        });
        describe('should include expected values', () => {
            vals.forEach((val) => {
                it(val, () => messages.internals.should.have.any.key(val));
            });
        });
        it('should include only expected keys', () => {
            messages.internals.should.have.all.keys(fns.concat(objs, vals));
        });
    });
    describe('privateFns', () => {
        const fns = ['onMessageAdd', 'onMessageRemove', 'addChannel', 'removeChannel', 'updateChannels'];
        describe('should include expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(messages.privateFns[fn]).to.be.a('function'));
            });
            it('should include only expected keys', () => {
                messages.privateFns.should.have.all.keys(fns);
            });
        });

    });
    describe('prepare()', () => {
        let events;
        beforeEach(() => {
            messages.internals.events = null;
            messages.internals.clientId = null;
            events = {
                on: sinon.spy()
            };
        });
        it('should call callback on completion', () => {
            const spy = sinon.spy();
            messages.prepare(events, '', spy);
            spy.called.should.be.true;
            spy.callCount.should.equal(1);
            spy.lastCall.args.should.have.length(0);
        });
        it('should set events', () => {
            messages.prepare(events, '', () => 0);
            events.should.equal(messages.internals.events);
        });
        it('should set clientId', () => {
            const id = '' + Math.random();
            messages.prepare(events, id, () => 0);
            id.should.equal(messages.internals.clientId);
        });
        it('should add `addChannel()` to events', () => {
            messages.prepare(events, '', () => 0);
            messages.privateFns.addChannel.should.equal(events.addChannel);
        });
        it('should add `removeChannel()` to events', () => {
            messages.prepare(events, '', () => 0);
            messages.privateFns.removeChannel.should.equal(events.removeChannel);
        });
        it('should register `newListener` event', () => {
            messages.prepare(events, '', () => 0);
            events.on.calledWith('newListener', messages.privateFns.onMessageAdd).should.be.true;
        });
        it('should register `removeListener` event', () => {
            messages.prepare(events, '', () => 0);
            events.on.calledWith('removeListener', messages.privateFns.onMessageRemove).should.be.true;
        });
        it('should register listener for `/__status`', () => {
            messages.prepare(events, '', () => 0);
            events.on.calledWith('message-bus#/__status', messages.privateFns.updateChannels).should.be.true;
        });
    });
    describe('privateFns.onMessageAdd()', () => {
        const onMessageAdd = messages.privateFns.onMessageAdd;
        beforeEach(() => {
            messages.internals.channels = {};
            messages.internals.channelCounts = {};
        });
        it('should not register random channel', () => {
            onMessageAdd('' + Math.random()).should.be.false;
            messages.internals.channels.should.deep.equal({});
            messages.internals.channelCounts.should.deep.equal({});
        });
        it('should not register partial prefix (`message#`)', () => {
            onMessageAdd('message#' + Math.random()).should.be.false;
            messages.internals.channels.should.deep.equal({});
            messages.internals.channelCounts.should.deep.equal({});
        });
        it('should not register partial prefix (`message-bus`)', () => {
            onMessageAdd('message-bus' + Math.random()).should.be.false;
            messages.internals.channels.should.deep.equal({});
            messages.internals.channelCounts.should.deep.equal({});
        });
        it('should register with correct prefix', () => {
            onMessageAdd('message-bus#/some/channel').should.be.true;
            messages.internals.channels.should.have.any.key('/some/channel');
        });
        it('should register new channel at position -1', () => {
            onMessageAdd('message-bus#/some/channel');
            messages.internals.channels['/some/channel'].should.equal(-1);
        });
        it('should not override existing channel position', () => {
            messages.internals.channelCounts['/some/channel'] = 42;
            messages.internals.channels['/some/channel'] = 42;
            onMessageAdd('message-bus#/some/channel');
            messages.internals.channels['/some/channel'].should.equal(42);
        });
        it('should increment listener count for channel', () => {
            messages.internals.channelCounts['/some/channel'] = 42;
            onMessageAdd('message-bus#/some/channel');
            messages.internals.channelCounts['/some/channel'].should.equal(43);
        });
    });
    describe('privateFns.onMessageRemove()', () => {
        const onMessageRemove = messages.privateFns.onMessageRemove;
        beforeEach(() => {
            messages.internals.channels = {};
            messages.internals.channelCounts = {};
        });
        it('should not remove random channel', () => {
            onMessageRemove('' + Math.random()).should.be.false;
            messages.internals.channels.should.deep.equal({});
            messages.internals.channelCounts.should.deep.equal({});
        });
        it('should not remove partial prefix (`message#`)', () => {
            onMessageRemove('message#' + Math.random()).should.be.false;
            messages.internals.channels.should.deep.equal({});
            messages.internals.channelCounts.should.deep.equal({});
        });
        it('should not remove partial prefix (`message-bus`)', () => {
            onMessageRemove('message-bus' + Math.random()).should.be.false;
            messages.internals.channels.should.deep.equal({});
            messages.internals.channelCounts.should.deep.equal({});
        });
        it('should remove corect prefix', () => {
            onMessageRemove('message-bus#' + Math.random()).should.be.true;
            messages.internals.channels.should.deep.equal({});
        });
        it('should decrement listener with correct prefix', () => {
            messages.internals.channelCounts.foo = 3;
            onMessageRemove('message-bus#foo');
            messages.internals.channelCounts.foo.should.equal(2);
        });
        it('should decrement listener with correct prefix', () => {
            messages.internals.channelCounts.foo = 3;
            onMessageRemove('message-bus#foo');
            messages.internals.channelCounts.foo.should.equal(2);
        });
        it('should remove listener with count of zero', () => {
            messages.internals.channelCounts.foo = 1;
            messages.internals.channels.foo = true;
            onMessageRemove('message-bus#foo');
            messages.internals.channels.should.not.have.any.key('foo');
        });
        it('should remove unregistered listener', () => {
            messages.internals.channels.foo = true;
            onMessageRemove('message-bus#foo');
            messages.internals.channels.should.not.have.any.key('foo');
        });
    });
    describe('privateFns.addChannel()', () => {
        let events;
        beforeEach((done) => {
            events = {
                on: sinon.spy()
            };
            messages.prepare(events, '', () => {
                events.on.reset();
                done();
            });
        });
        it('should return event object for chaining', () => {
            events.addChannel('', () => 0).should.equal(events);
        });
        it('should register renamed event', () => {
            const fn = () => 0;
            events.addChannel('foobar', fn);
            events.on.calledWith('message-bus#foobar', fn).should.be.true;
        });
    });
    describe('privateFns.removeChannel()', () => {
        let events;
        beforeEach((done) => {
            events = {
                on: sinon.spy(),
                removeListener: sinon.spy()
            };
            messages.prepare(events, '', done);
        });
        it('should return event object for chaining', () => {
            events.removeChannel('', () => 0).should.equal(events);
        });
        it('should register renamed event', () => {
            const fn = () => 0;
            events.removeChannel('foobar', fn);
            events.removeListener.calledWith('message-bus#foobar', fn).should.be.true;
        });
    });
    describe('privateFns.updateChannels()', () => {
        const updateChannels = messages.privateFns.updateChannels;
        beforeEach(() => {
            messages.internals.channels = {};
        });
        it('should set channels', () => {
            const chans = {
                '/u/234': 45,
                'foobar': 32
            };
            updateChannels(chans);
            messages.internals.channels.should.deep.equal(chans);
        });
    });
});
