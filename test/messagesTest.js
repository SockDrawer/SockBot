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
        const fns = ['onMessageAdd', 'onMessageRemove', 'onChannel', 'onTopic', 'removeChannel', 'removeTopic',
            'statusChannelHandler'
        ];
        describe('should include expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(messages.privateFns[fn]).to.be.a('function'));
            });
        });
        it('should include only expected keys', () => {
            messages.privateFns.should.have.all.keys(fns);
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
        it('should add `onChannel()` to events', () => {
            messages.prepare(events, '', () => 0);
            messages.privateFns.onChannel.should.equal(events.onChannel);
        });
        it('should add `onTopic()` to events', () => {
            messages.prepare(events, '', () => 0);
            messages.privateFns.onTopic.should.equal(events.onTopic);
        });
        it('should add `removeChannel()` to events', () => {
            messages.prepare(events, '', () => 0);
            messages.privateFns.removeChannel.should.equal(events.removeChannel);
        });
        it('should add `removeTopic()` to events', () => {
            messages.prepare(events, '', () => 0);
            messages.privateFns.removeTopic.should.equal(events.removeTopic);
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
            events.on.calledWith('message#/__status', messages.privateFns.statusChannelHandler).should.be.true;
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
        it('should not register partial prefix (`msg#`)', () => {
            onMessageAdd('msg#' + Math.random()).should.be.false;
            messages.internals.channels.should.deep.equal({});
            messages.internals.channelCounts.should.deep.equal({});
        });
        it('should not register partial prefix (`top#`)', () => {
            onMessageAdd('top#' + Math.random()).should.be.false;
            messages.internals.channels.should.deep.equal({});
            messages.internals.channelCounts.should.deep.equal({});
        });
        it('should not register partial prefix (`message`)', () => {
            onMessageAdd('message' + Math.random()).should.be.false;
            messages.internals.channels.should.deep.equal({});
            messages.internals.channelCounts.should.deep.equal({});
        });
        it('should not register partial prefix (`topic`)', () => {
            onMessageAdd('topic' + Math.random()).should.be.false;
            messages.internals.channels.should.deep.equal({});
            messages.internals.channelCounts.should.deep.equal({});
        });
        it('should register with correct prefix (`message#`)', () => {
            onMessageAdd('message#/some/channel').should.be.true;
            messages.internals.channels.should.have.any.key('/some/channel');
        });
        it('should register with correct prefix (`topic#`)', () => {
            onMessageAdd('topic#channel').should.be.true;
            messages.internals.channels.should.have.any.key('/topic/channel');
        });
        it('should register new channel at position -1', () => {
            onMessageAdd('message#/some/channel');
            messages.internals.channels['/some/channel'].should.equal(-1);
        });
        it('should register new topic at position -1', () => {
            onMessageAdd('topic#channel');
            messages.internals.channels['/topic/channel'].should.equal(-1);
        });
        it('should not override existing channel position', () => {
            messages.internals.channelCounts['/some/channel'] = 42;
            messages.internals.channels['/some/channel'] = 42;
            onMessageAdd('message#/some/channel');
            messages.internals.channels['/some/channel'].should.equal(42);
        });
        it('should not override existing topic position', () => {
            messages.internals.channelCounts['/topic/channel'] = 42;
            messages.internals.channels['/topic/channel'] = 42;
            onMessageAdd('topic#channel');
            messages.internals.channels['/topic/channel'].should.equal(42);
        });
        it('should increment listener count for channel', () => {
            messages.internals.channelCounts['/some/channel'] = 42;
            onMessageAdd('message#/some/channel');
            messages.internals.channelCounts['/some/channel'].should.equal(43);
        });
        it('should increment listener count for topic', () => {
            messages.internals.channelCounts['/topic/channel'] = 42;
            onMessageAdd('topic#channel');
            messages.internals.channelCounts['/topic/channel'].should.equal(43);
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
        it('should not remove partial prefix (`msg#`)', () => {
            onMessageRemove('msg#' + Math.random()).should.be.false;
            messages.internals.channels.should.deep.equal({});
            messages.internals.channelCounts.should.deep.equal({});
        });
        it('should not remove partial prefix (`top#`)', () => {
            onMessageRemove('top#' + Math.random()).should.be.false;
            messages.internals.channels.should.deep.equal({});
            messages.internals.channelCounts.should.deep.equal({});
        });
        it('should not remove partial prefix (`message`)', () => {
            onMessageRemove('message' + Math.random()).should.be.false;
            messages.internals.channels.should.deep.equal({});
            messages.internals.channelCounts.should.deep.equal({});
        });
        it('should not remove partial prefix (`topic`)', () => {
            onMessageRemove('topic' + Math.random()).should.be.false;
            messages.internals.channels.should.deep.equal({});
            messages.internals.channelCounts.should.deep.equal({});
        });
        it('should remove corect prefix (`message#`)', () => {
            onMessageRemove('message#' + Math.random()).should.be.true;
            messages.internals.channels.should.deep.equal({});
        });
        it('should remove corect prefix(`topic#`)', () => {
            onMessageRemove('topic#' + Math.random()).should.be.true;
            messages.internals.channels.should.deep.equal({});
        });
        it('should decrement listener with correct prefix', () => {
            messages.internals.channelCounts.foo = 3;
            onMessageRemove('message#foo');
            messages.internals.channelCounts.foo.should.equal(2);
        });
        it('should decrement listener with correct prefix', () => {
            messages.internals.channelCounts['/topic/foo'] = 3;
            onMessageRemove('topic#foo');
            messages.internals.channelCounts['/topic/foo'].should.equal(2);
        });
        it('should remove topic listener with count of zero', () => {
            messages.internals.channelCounts['/topic/foo'] = 1;
            messages.internals.channels['/topic/foo'] = true;
            onMessageRemove('topic#foo');
            messages.internals.channels.should.not.have.any.key('/topic/foo');
        });
        it('should remove listener with count of zero', () => {
            messages.internals.channelCounts.foo = 1;
            messages.internals.channels.foo = true;
            onMessageRemove('message#foo');
            messages.internals.channels.should.not.have.any.key('foo');
        });
        it('should remove unregistered topic listener', () => {
            messages.internals.channels['/topic/foo'] = true;
            onMessageRemove('topic#foo');
            messages.internals.channels.should.not.have.any.key('/topic/foo');
        });
        it('should remove unregistered listener', () => {
            messages.internals.channels.foo = true;
            onMessageRemove('message#foo');
            messages.internals.channels.should.not.have.any.key('foo');
        });
    });
    describe('privateFns.onChannel()', () => {
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
            events.onChannel('', () => 0).should.equal(events);
        });
        it('should register renamed event', () => {
            const fn = () => 0;
            events.onChannel('foobar', fn);
            events.on.calledWith('message#foobar', fn).should.be.true;
        });
    });
    describe('privateFns.onTopic()', () => {
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
            events.onTopic('', () => 0).should.equal(events);
        });
        it('should register renamed event', () => {
            const fn = () => 0;
            events.onTopic('foobar', fn);
            events.on.calledWith('topic#foobar', fn).should.be.true;
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
        it('should remove renamed event', () => {
            const fn = () => 0;
            events.removeChannel('foobar', fn);
            events.removeListener.calledWith('message#foobar', fn).should.be.true;
        });
    });
    describe('privateFns.removeTopic()', () => {
        let events;
        beforeEach((done) => {
            events = {
                on: sinon.spy(),
                removeListener: sinon.spy()
            };
            messages.prepare(events, '', done);
        });
        it('should return event object for chaining', () => {
            events.removeTopic('', () => 0).should.equal(events);
        });
        it('should remove renamed event', () => {
            const fn = () => 0;
            events.removeTopic('foobar', fn);
            events.removeListener.calledWith('topic#foobar', fn).should.be.true;
        });
    });
    describe('privateFns.statusChannelHandler()', () => {
        const statusChannelHandler = messages.privateFns.statusChannelHandler;
        beforeEach(() => {
            messages.internals.channels = {};
        });
        it('should set channels', () => {
            const chans = {
                '/u/234': 45,
                'foobar': 32
            };
            statusChannelHandler(chans);
            messages.internals.channels.should.deep.equal(chans);
        });
        it('should override existing channels', () => {
            const chans = {
                '/u/234': 45,
                'foobar': 32
            };
            messages.internals.channels = {
                '/u/234': 4,
                'foobar': 3
            };
            statusChannelHandler(chans);
            messages.internals.channels.should.deep.equal(chans);
        });
        it('should not remove unrelated existing channels', () => {
            messages.internals.channels.barbaz = 2;
            const chans = {
                    '/u/234': 45,
                    'foobar': 32
                },
                expected = {
                    '/u/234': 45,
                    'foobar': 32,
                    barbaz: 2
                };
            statusChannelHandler(chans);
            messages.internals.channels.should.deep.equal(expected);
        });
    });
});
