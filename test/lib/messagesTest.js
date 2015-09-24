'use strict';
/*globals describe, it, beforeEach, after, afterEach*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon'),
    async = require('async');

chai.should();
const expect = chai.expect;

const messages = require('../../lib/messages'),
    utils = require('../../lib/utils'),
    config = require('../../lib/config');
const browser = require('../../lib/browser')();

describe('messages', () => {
    describe('exports', () => {
        const fns = ['prepare', 'start', 'pollMessages'],
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
            objs = ['clientId', 'events', 'channels', 'channelCounts', 'cooldownTimers'],
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
    describe('pollMessages()', () => {
        let sandbox;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(browser, 'messageBus');
            sandbox.stub(messages.privateFns, 'resetChannelPositions');
            sandbox.stub(messages.privateFns, 'updateChannelPositions');
            sandbox.stub(messages.privateFns, 'processTopicMessage');
            sandbox.useFakeTimers();
            async.nextTick = (fn) => setTimeout(fn, 0);
            async.setImmediate = (fn) => setTimeout(fn, 0);
            messages.internals.events = {
                emit: sandbox.stub()
            };
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('should call browser.messageBus()', () => {
            const spy = sinon.spy();
            messages.pollMessages(spy);
            browser.messageBus.called.should.be.true;
            const args = browser.messageBus.lastCall.args;
            args.should.have.length(3);
            args[0].should.deep.equal(messages.internals.channels);
            args[1].should.deep.equal(messages.internals.clientId);
            args[2].should.be.a('function');
        });
        it('should call browser.messageBus()', () => {
            const spy = sinon.spy();
            messages.pollMessages(spy);
            messages.internals.events.emit.calledWith('logMessage', 'Polling Messages').should.be.true;
        });
        describe('discourse failure protection', () => {
            it('should log message on poll failure', () => {
                const spy = sinon.spy();
                browser.messageBus.yields('fake error');
                messages.pollMessages(spy);
                messages.internals.events.emit.calledWith('logError',
                    'Error in messageBus: "fake error"').should.be.true;
            });
            it('should reset positions on poll failure', () => {
                const spy = sinon.spy();
                browser.messageBus.yields('fake error');
                messages.pollMessages(spy);
                messages.privateFns.resetChannelPositions.called.should.be.true;
            });
            it('should pass error onto callback on poll failure', () => {
                const spy = sinon.spy();
                browser.messageBus.yields('fake error');
                messages.pollMessages(spy);
                sandbox.clock.tick(0);
                spy.calledWith('fake error').should.be.true;
            });
            it('should emit warning on invalid reply', () => {
                const spy = sinon.spy();
                browser.messageBus.yields(null, null);
                messages.pollMessages(spy);
                messages.internals.events.emit.calledWith('logWarning',
                    'Invalid Response from messageBus').should.be.true;
            });
            it('should reset positions on invalid reply', () => {
                const spy = sinon.spy();
                browser.messageBus.yields(null, null);
                messages.pollMessages(spy);
                messages.privateFns.resetChannelPositions.called.should.be.true;
            });
        });
        describe('discourse flood prevention', () => {
            it('should have zero completion delay on zero messages', () => {
                const spy = sinon.spy(),
                    msgs = [];
                browser.messageBus.yields(null, msgs);
                messages.pollMessages(spy);
                sandbox.clock.tick(0);
                spy.called.should.be.true;
            });
            it('should have half second completion delay on one message', () => {
                const spy = sinon.spy(),
                    msgs = [{}];
                browser.messageBus.yields(null, msgs);
                messages.pollMessages(spy);
                sandbox.clock.tick(499);
                spy.called.should.be.false;
                sandbox.clock.tick(1);
                spy.called.should.be.true;
            });
            it('should have one second completion delay on two message', () => {
                const spy = sinon.spy(),
                    msgs = [{}, {}];
                browser.messageBus.yields(null, msgs);
                messages.pollMessages(spy);
                sandbox.clock.tick(999);
                spy.called.should.be.false;
                sandbox.clock.tick(1);
                spy.called.should.be.true;
            });
            it('should have maximum thirty second completion delay on many messages', () => {
                const spy = sinon.spy();
                let msgs = [{}, {}, {}, {}, {}],
                    i;
                for (i = 0; i < 4; i += 1) {
                    msgs = msgs.concat(msgs); // expand to 80
                }
                msgs.length.should.equal(80);
                browser.messageBus.yields(null, msgs);
                messages.pollMessages(spy);
                sandbox.clock.tick(30 * 1000 - 1);
                spy.called.should.be.false;
                sandbox.clock.tick(1);
                spy.called.should.be.true;
            });
        });
        it('should call updateChannelPositions() on poll success', () => {
            const spy = sinon.spy(),
                msgs = [];
            browser.messageBus.yields(null, msgs);
            messages.pollMessages(spy);
            messages.privateFns.updateChannelPositions.calledWith(msgs).should.be.true;
        });
        it('should accept poll returning zero messages', () => {
            const spy = sinon.spy(),
                msgs = [];
            browser.messageBus.yields(null, msgs);
            messages.pollMessages(spy);
            sandbox.clock.tick(0);
            spy.called.should.be.true;
            spy.lastCall.args.should.deep.equal([]);
        });
        describe('message processing', () => {
            it('should pass `/topic/*` messages to processTopicMessage()', () => {
                const spy = sinon.spy(),
                    msg = {
                        channel: '/topic/1234'
                    },
                    msgs = [msg];
                browser.messageBus.yields(null, msgs);
                messages.pollMessages(spy);
                sandbox.clock.tick(0);
                messages.privateFns.processTopicMessage.calledWith(msg).should.be.true;
            });
            it('should emit message directly for non `/topic/*` messages', () => {
                const spy = sinon.spy(),
                    msg = {
                        channel: '/__status/1234',
                        data: {
                            foobar: Math.random()
                        }
                    },
                    msgs = [msg];
                browser.messageBus.yields(null, msgs);
                messages.pollMessages(spy);
                sandbox.clock.tick(0);
                messages.internals.events.emit.calledWith('message#' + msg.channel, msg.data).should.be.true;
            });
            it('should print warning when no listeners registered for event', () => {
                const spy = sinon.spy(),
                    msg = {
                        channel: '/__status/1234',
                        'message_id': 5432,
                        data: {
                            foobar: Math.random()
                        }
                    },
                    msgs = [msg];
                browser.messageBus.yields(null, msgs);
                messages.internals.events.emit.returns(false);
                messages.pollMessages(spy);
                sandbox.clock.tick(0);
                messages.internals.events.emit.calledWith('logWarning',
                    'Message 5432 for channel /__status/1234 was not handled!').should.be.true;
            });
            it('should not print warning when listeners registered for event', () => {
                const spy = sinon.spy(),
                    msg = {
                        channel: '/__status/1234',
                        'message_id': 5432,
                        data: {
                            foobar: Math.random()
                        }
                    },
                    msgs = [msg];
                browser.messageBus.yields(null, msgs);
                messages.internals.events.emit.returns(true);
                messages.pollMessages(spy);
                sandbox.clock.tick(0);
                messages.internals.events.emit.calledWith('logWarning').should.be.false;
            });
        });
    });
    describe('start()', () => {
        it('should be a stub function for later', () => messages.start());
    });
    describe('privateFns', () => {
        const fns = ['onMessageAdd', 'onMessageRemove', 'onChannel', 'onTopic', 'removeChannel', 'removeTopic',
            'statusChannelHandler', 'updateChannelPositions', 'resetChannelPositions', 'processTopicMessage'
        ];
        describe('should include expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(messages.privateFns[fn]).to.be.a('function'));
            });
        });
        it('should include only expected keys', () => {
            messages.privateFns.should.have.all.keys(fns);
        });
        describe('event listeners', () => {
            describe('onMessageAdd()', () => {
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
            describe('onMessageRemove()', () => {
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
            describe('onChannel()', () => {
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
            describe('onTopic()', () => {
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
            describe('removeChannel()', () => {
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
            describe('removeTopic()', () => {
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
            describe('statusChannelHandler()', () => {
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
        describe('resetChannelPositions()', () => {
            const resetChannelPositions = messages.privateFns.resetChannelPositions;
            it('should set all channels to position `-1`', () => {
                const input = {},
                    expected = {};
                for (let i = 0; i < 50; i += 1) {
                    const key = '/channel/' + Math.ceil(Math.random() * 5000);
                    input[key] = Math.floor(Math.random() * 1e5);
                    expected[key] = -1;
                }
                messages.internals.channels = input;
                resetChannelPositions();
                messages.internals.channels.should.deep.equal(expected);
            });
            after(() => messages.internals.channels = {});
        });
        describe('updateChannelpositions', () => {
            const updateChannelPositions = messages.privateFns.updateChannelPositions;
            beforeEach(() => messages.internals.channels = {});
            it('should add new channel to channel watch list', () => {
                //Not that this should be a thing normally, but just in case.
                const message = {
                    channel: 'foobar',
                    'message_id': 50
                };
                updateChannelPositions([message]);
                messages.internals.channels.should.have.any.key('foobar');
                messages.internals.channels.foobar.should.equal(50);
            });
            it('should not update channel when update would reduce the channel position', () => {
                //Not that this should be a thing normally, but just in case.
                const message = {
                    channel: 'foobar',
                    'message_id': 30
                };
                messages.internals.channels.foobar = 50;
                updateChannelPositions([message]);
                messages.internals.channels.foobar.should.equal(50);
            });
            it('should update channel when update would increase the channel position', () => {
                const message = {
                    channel: 'foobar',
                    'message_id': 50
                };
                messages.internals.channels.foobar = 30;
                updateChannelPositions([message]);
                messages.internals.channels.foobar.should.equal(50);
            });
            it('should update multiple channels', () => {
                const message1 = {
                        channel: 'foobar',
                        'message_id': 50
                    },
                    message2 = {
                        channel: 'barbaz',
                        'message_id': 45
                    },
                    message3 = {
                        channel: 'quux',
                        'message_id': 30
                    },
                    expected = {
                        foobar: 50,
                        barbaz: 45,
                        quux: 30
                    };
                updateChannelPositions([message1, message2, message3]);
                messages.internals.channels.should.deep.equal(expected);
            });
        });
        describe('processTopicMessage()', () => {
            const processTopicMessage = messages.privateFns.processTopicMessage;
            let sandbox;
            beforeEach(() => {
                sandbox = sinon.sandbox.create();
                sandbox.stub(browser, 'getTopic');
                sandbox.stub(browser, 'getPost');
                sandbox.stub(utils, 'filterIgnored');
                sandbox.spy(async, 'parallel');
                messages.internals.events = {
                    emit: sandbox.stub()
                };
            });
            afterEach(() => {
                sandbox.restore();
            });
            it('should call browser.getPost()', () => {
                browser.getPost.yields('stubbed');
                processTopicMessage({
                    channel: '/topic/1234',
                    data: {
                        id: 5678
                    }
                });
                browser.getPost.calledWith(5678).should.be.true;
            });
            it('should call browser.getTopic()', () => {
                browser.getTopic.yields('stubbed');
                processTopicMessage({
                    channel: '/topic/1234',
                    data: {
                        id: 5678
                    }
                });
                browser.getTopic.calledWith('1234').should.be.true;
            });
            it('should abort if getPost() yields error', () => {
                browser.getPost.yields('stubbed');
                processTopicMessage({
                    channel: '/topic/1234',
                    data: {
                        id: 5678
                    }
                });
                utils.filterIgnored.called.should.be.false;
            });
            it('should abort if getTopic() yields error', () => {
                browser.getTopic.yields('stubbed');
                processTopicMessage({
                    channel: '/topic/1234',
                    data: {
                        id: 5678
                    }
                });
                utils.filterIgnored.called.should.be.false;
            });
            it('should filter topic/post through filterIgnored()', () => {
                const topic = {
                        id: 1234
                    },
                    post = {
                        id: 5678
                    };
                browser.getTopic.yields(null, topic);
                browser.getPost.yields(null, post);
                utils.filterIgnored.yields('ignored');
                processTopicMessage({
                    channel: '/topic/1234',
                    data: {
                        id: 5678
                    }
                });
                utils.filterIgnored.calledWith(topic, post).should.be.true;
            });
            it('should filtered message should not emit message', () => {
                const topic = {
                        id: 1234
                    },
                    post = {
                        id: 5678
                    };
                browser.getTopic.yields(null, topic);
                browser.getPost.yields(null, post);
                utils.filterIgnored.yields('ignored');
                processTopicMessage({
                    channel: '/topic/1234',
                    data: {
                        id: 5678
                    }
                });
                messages.internals.events.emit.called.should.be.false;
            });
            it('should emit event on success', () => {
                const topic = {
                        id: 1234
                    },
                    post = {
                        id: 5678
                    },
                    data = {
                        id: 5678
                    };
                browser.getTopic.yields(null, topic);
                browser.getPost.yields(null, post);
                utils.filterIgnored.yields(null);
                processTopicMessage({
                    channel: '/topic/1234',
                    data: data
                });
                messages.internals.events.emit.calledWith('topic#1234', data, topic, post).should.be.true;
            });
            it('should print warning when no listeners registered for event', () => {
                browser.getTopic.yields(null, {});
                browser.getPost.yields(null, {});
                messages.internals.events.emit.returns(false);
                utils.filterIgnored.yields(null);
                processTopicMessage({
                    channel: '/topic/1234',
                    'message_id': 5432,
                    data: {}
                });
                messages.internals.events.emit.calledWith('logWarning',
                    'Message 5432 for channel /topic/1234 was not handled!').should.be.true;
            });
            it('should not print warning when listeners registered for event', () => {
                browser.getTopic.yields(null, {});
                browser.getPost.yields(null, {});
                messages.internals.events.emit.returns(true);
                utils.filterIgnored.yields(null);
                processTopicMessage({
                    channel: '/topic/1234',
                    'message_id': 5432,
                    data: {}
                });
                messages.internals.events.emit.calledWith('logWarning').should.be.false;
            });
            describe('processActed', () => {
                it('should not process acted message when processActed is false', () => {
                    config.core.processActed = false;
                    processTopicMessage({
                        channel: '/topic/1234',
                        'message_id': 5432,
                        data: {
                            type: 'acted'
                        }
                    });
                    async.parallel.called.should.be.false;
                });
                it('should process nonacted message when processActed is false', () => {
                    config.core.processActed = false;
                    processTopicMessage({
                        channel: '/topic/1234',
                        'message_id': 5432,
                        data: {
                            type: 'some weirdo type'
                        }
                    });
                    async.parallel.called.should.be.true;
                });
                it('should process acted message when processActed is true', () => {
                    config.core.processActed = true;
                    processTopicMessage({
                        channel: '/topic/1234',
                        'message_id': 5432,
                        data: {
                            type: 'acted'
                        }
                    });
                    async.parallel.called.should.be.true;
                });
                it('should process nonacted message when processActed is true', () => {
                    config.core.processActed = true;
                    processTopicMessage({
                        channel: '/topic/1234',
                        'message_id': 5432,
                        data: {
                            type: 'some weirdo type'
                        }
                    });
                    async.parallel.called.should.be.true;
                });
            });
        });
    });
});
