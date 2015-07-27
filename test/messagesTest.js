'use strict';
/*globals describe, it, before, beforeEach, after, afterEach*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon');

chai.should();
const expect = chai.expect;

const messages = require('../messages'),
    config = require('../config'),
    utils = require('../utils');
const browser = require('../browser')();

describe('browser', () => {
    describe('exports', () => {
        const fns = ['prepare', 'pollMessages'],
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
        before(() => {
            sinon.stub(browser, 'messageBus');
            sinon.stub(utils, 'warn');
            sinon.stub(messages.privateFns, 'resetChannelPositions');
            sinon.stub(messages.privateFns, 'updateChannelPositions');
            sinon.stub(messages.privateFns, 'processTopicMessage');
            messages.internals.events = {
                emit: sinon.spy()
            };
        });
        beforeEach(() => {
            browser.messageBus.reset();
            utils.warn.reset();
            messages.privateFns.resetChannelPositions.reset();
            messages.privateFns.updateChannelPositions.reset();
            messages.privateFns.processTopicMessage.reset();
            messages.internals.events.emit.reset();
            //randomize data
            messages.internals.clientId = Math.random();
            messages.internals.channels = {};
            messages.internals.channels['foo' + Math.random()] = Math.random();
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
        it('should log message on poll failure', () => {
            const spy = sinon.spy();
            browser.messageBus.yields('fake error');
            messages.pollMessages(spy);
            utils.warn.calledWith('Error in messageBus: "fake error"').should.be.true;
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
            spy.calledWith('fake error').should.be.true;
        });
        after(() => {
            browser.messageBus.restore();
            utils.warn.restore();
            messages.privateFns.resetChannelPositions.restore();
            messages.privateFns.updateChannelPositions.restore();
            messages.privateFns.processTopicMessage.restore();
            messages.internals.events = null;
            messages.internals.channels = null;
            messages.internals.clientId = null;
        });
    });
    describe('privateFns', () => {
        const fns = ['onMessageAdd', 'onMessageRemove', 'onChannel', 'onTopic', 'removeChannel', 'removeTopic',
            'statusChannelHandler', 'filterIgnored', 'filterIgnoredOnPost', 'filterIgnoredOnTopic',
            'updateChannelPositions', 'resetChannelPositions', 'processTopicMessage'
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
        describe('message filters', () => {
            describe('filterIgnoredOnPost()', () => {
                const filterIgnoredOnPost = messages.privateFns.filterIgnoredOnPost;
                let timers;
                before(() => timers = sinon.useFakeTimers());
                describe('Basic trust levels', () => {
                    it('should ignore TL0 user', () => {
                        const post = {
                                'trust_level': 0
                            },
                            spy = sinon.spy();
                        filterIgnoredOnPost(post, {}, spy);
                        spy.called.should.be.false;
                        timers.tick(0);
                        spy.calledWith('ignore', 'Poster is TL0').should.be.true;
                    });
                    [1, 2, 3].forEach((level) =>
                        it('should accept TL' + level + ' user', () => {
                            const user = 'USER' + Math.ceil(1000 + Math.random() * 5000),
                                post = {
                                    'trust_level': level,
                                    username: user
                                },
                                spy = sinon.spy();
                            filterIgnoredOnPost(post, {}, spy);
                            spy.called.should.be.false;
                            timers.tick(0);
                            spy.calledWith(null, 'POST OK').should.be.true;
                        }));
                    [4, 5, 6, 7, 8, 9].forEach((level) => it('should accept TL' + level + ' user', () => {
                        const user = 'USER' + Math.ceil(1000 + Math.random() * 5000),
                            post = {
                                username: user,
                                'trust_level': level
                            },
                            spy = sinon.spy();
                        filterIgnoredOnPost(post, {}, spy);
                        spy.called.should.be.false;
                        timers.tick(0);
                        spy.calledWith(null, 'Poster is TL4+').should.be.true;
                    }));
                });
                describe('ignored users', () => {
                    [1, 2, 3].forEach((level) => it('should ignore TL' + level + ' user on ignore list', () => {
                        const user = 'USER' + Math.ceil(1000 + Math.random() * 5000),
                            post = {
                                'trust_level': level,
                                username: user
                            },
                            spy = sinon.spy();
                        config.core.ignoreUsers.push(user);
                        filterIgnoredOnPost(post, {}, spy);
                        config.core.ignoreUsers.pop();
                        spy.called.should.be.false;
                        timers.tick(0);
                        spy.calledWith('ignore', 'Post Creator Ignored').should.be.true;
                    }));
                    [4, 5, 6, 7, 8, 9].forEach((level) => {
                        it('should accept TL' + level + ' user on ignore list', () => {
                            const user = 'USER' + Math.ceil(1000 + Math.random() * 5000),
                                post = {
                                    username: user,
                                    'trust_level': level
                                },
                                spy = sinon.spy();
                            config.core.ignoreUsers.push(user);
                            filterIgnoredOnPost(post, {}, spy);
                            config.core.ignoreUsers.pop();
                            spy.called.should.be.false;
                            timers.tick(0);
                            spy.calledWith(null, 'Poster is TL4+').should.be.true;
                        });
                    });
                });
                describe('trust_level 1 users', () => {
                    it('should place TL1 user on cooldown', () => {
                        const user = 'USER' + Math.ceil(1000 + Math.random() * 5000),
                            post = {
                                'trust_level': 1,
                                username: user
                            },
                            target = Date.now() + config.core.cooldownPeriod,
                            spy = sinon.spy();
                        filterIgnoredOnPost(post, {}, spy);
                        messages.internals.cooldownTimers[user].should.equal(target);
                        spy.called.should.be.false;
                        timers.tick(0);
                        spy.calledWith(null, 'POST OK').should.be.true;
                    });
                    it('should ignore TL1 user on cooldown', () => {
                        const user = 'USER' + Math.ceil(1000 + Math.random() * 5000),
                            post = {
                                'trust_level': 1,
                                username: user
                            },
                            spy = sinon.spy();
                        messages.internals.cooldownTimers[user] = Number.MAX_SAFE_INTEGER;
                        filterIgnoredOnPost(post, {}, spy);
                        spy.called.should.be.false;
                        timers.tick(0);
                        spy.calledWith('ignore', 'Poster is TL1 on Cooldown').should.be.true;
                    });
                    it('should not extend cooldown for TL1 user on cooldown', () => {
                        const user = 'USER' + Math.ceil(1000 + Math.random() * 5000),
                            post = {
                                'trust_level': 1,
                                username: user
                            },
                            now = Date.now() + 1 * 60 * 1000,
                            spy = sinon.spy();
                        messages.internals.cooldownTimers[user] = now;
                        filterIgnoredOnPost(post, {}, spy);
                        messages.internals.cooldownTimers[user].should.equal(now);
                        spy.called.should.be.false;
                        timers.tick(0);
                        spy.calledWith('ignore', 'Poster is TL1 on Cooldown').should.be.true;
                    });
                });
                describe('primary_group_name: bot users', () => {
                    [1, 2, 3].forEach((level) => it('should reject TL' + level + ' bot user', () => {
                        const post = {
                                'trust_level': level,
                                'primary_group_name': 'bots'
                            },
                            spy = sinon.spy();
                        filterIgnoredOnPost(post, {}, spy);
                        spy.called.should.be.false;
                        timers.tick(0);
                        spy.calledWith('ignore', 'Poster is a Bot').should.be.true;
                    }));
                    [4, 5, 6, 7, 8, 9].forEach((level) => it('should accept TL' + level + ' bot user', () => {
                        const post = {
                                'trust_level': level,
                                'primary_group_name': 'bots'
                            },
                            spy = sinon.spy();
                        filterIgnoredOnPost(post, {}, spy);
                        spy.called.should.be.false;
                        timers.tick(0);
                        spy.calledWith(null, 'Poster is TL4+').should.be.true;
                    }));
                });
                after(() => timers.restore());
                afterEach(() => messages.internals.cooldownTimers = {});
            });
            describe('filterIgnoredOnTopic()', () => {
                const filterIgnoredOnTopic = messages.privateFns.filterIgnoredOnTopic;
                let timers;
                before(() => timers = sinon.useFakeTimers());
                describe('Basic trust levels', () => {
                    [0, 1, 2, 3, 4].forEach((level) =>
                        it('should accept TL' + level + ' user', () => {
                            const post = {
                                    'trust_level': level
                                },
                                topic = {
                                    details: {
                                        'created_by': {
                                            username: 'none'
                                        }
                                    }
                                },
                                spy = sinon.spy();
                            filterIgnoredOnTopic(post, topic, spy);
                            spy.called.should.be.false;
                            timers.tick(0);
                            spy.calledWith(null, 'TOPIC OK').should.be.true;
                        }));
                    [5, 6, 7, 8, 9].forEach((level) => it('should accept TL' + level + ' user', () => {
                        const post = {
                                'trust_level': level
                            },
                            topic = {
                                details: {
                                    'created_by': {
                                        username: 'none'
                                    }
                                }
                            },
                            spy = sinon.spy();
                        filterIgnoredOnTopic(post, topic, spy);
                        spy.called.should.be.false;
                        timers.tick(0);
                        spy.calledWith(null, 'Poster is Staff').should.be.true;
                    }));
                });
                describe('category ignore', () => {
                    it('should ignore post in ignoredCategory', () => {
                        const category = Math.ceil(5000 + Math.random() * 5000),
                            post = {},
                            topic = {
                                'category_id': category
                            },
                            spy = sinon.spy();
                        config.core.ignoreCategories.push(category);
                        filterIgnoredOnTopic(post, topic, spy);
                        config.core.ignoreCategories.pop();
                        spy.called.should.be.false;
                        timers.tick(0);
                        spy.calledWith('ignore', 'Topic Category Ignored').should.be.true;
                    });
                    [5, 6, 7, 8, 9].forEach((level) => {
                        it('should accept TL' + level + ' user in ignoredCategory', () => {
                            const category = Math.ceil(5000 + Math.random() * 5000),
                                post = {
                                    'trust_level': level
                                },
                                topic = {
                                    'category_id': category
                                },
                                spy = sinon.spy();
                            config.core.ignoreCategories.push(category);
                            filterIgnoredOnTopic(post, topic, spy);
                            config.core.ignoreCategories.pop();
                            spy.called.should.be.false;
                            timers.tick(0);
                            spy.calledWith(null, 'Poster is Staff').should.be.true;
                        });
                    });
                });
                describe('muted topic ignore', () => {
                    it('should ignore post in muted topic', () => {
                        const post = {},
                            topic = {
                                details: {
                                    'notification_level': 0,
                                    'created_by': {
                                        username: 'none'
                                    }
                                }
                            },
                            spy = sinon.spy();
                        filterIgnoredOnTopic(post, topic, spy);
                        spy.called.should.be.false;
                        timers.tick(0);
                        spy.calledWith('ignore', 'Topic Was Muted').should.be.true;
                    });
                    [5, 6, 7, 8, 9].forEach((level) => it('should accept TL' + level + ' user in muted topic', () => {
                        const post = {
                                'trust_level': level
                            },
                            topic = {
                                details: {
                                    'notification_level': 0
                                }
                            },
                            spy = sinon.spy();
                        filterIgnoredOnTopic(post, topic, spy);
                        spy.called.should.be.false;
                        timers.tick(0);
                        spy.calledWith(null, 'Poster is Staff').should.be.true;
                    }));
                });
                describe('muted topic owner ignore', () => {
                    it('should ignore post in restricted topic', () => {
                        const username = 'USER' + Math.random(),
                            post = {},
                            topic = {
                                details: {
                                    'created_by': {
                                        username: username
                                    }
                                }
                            },
                            spy = sinon.spy();
                        config.core.ignoreUsers.push(username);
                        filterIgnoredOnTopic(post, topic, spy);
                        config.core.ignoreUsers.pop();
                        spy.called.should.be.false;
                        timers.tick(0);
                        spy.calledWith('ignore', 'Topic Creator Ignored').should.be.true;
                    });
                    [5, 6, 7, 8, 9].forEach((level) => it('should accept TL' + level + ' user in muted topic', () => {
                        const username = 'USER' + Math.random(),
                            post = {
                                'trust_level': level
                            },
                            topic = {
                                details: {
                                    'created_by': {
                                        username: username
                                    }
                                }
                            },
                            spy = sinon.spy();
                        config.core.ignoreUsers.push(username);
                        filterIgnoredOnTopic(post, topic, spy);
                        config.core.ignoreUsers.pop();
                        spy.called.should.be.false;
                        timers.tick(0);
                        spy.calledWith(null, 'Poster is Staff').should.be.true;
                    }));
                });
                after(() => timers.restore());
            });
            describe('filterIgnored()', () => {
                const filterIgnored = messages.privateFns.filterIgnored;
                before(() => {
                    sinon.stub(messages.privateFns, 'filterIgnoredOnPost');
                    sinon.stub(messages.privateFns, 'filterIgnoredOnTopic');
                    sinon.stub(utils, 'warn');
                });
                beforeEach(() => {
                    utils.warn.reset();
                    messages.privateFns.filterIgnoredOnPost.reset();
                    messages.privateFns.filterIgnoredOnTopic.reset();
                });
                it('should filter using filterIgnoredOnPost', () => {
                    messages.privateFns.filterIgnoredOnPost.yields(null);
                    messages.privateFns.filterIgnoredOnTopic.yields(null);
                    filterIgnored({}, {}, () => {});
                    messages.privateFns.filterIgnoredOnPost.called.should.be.true;
                });
                it('should filter using filterIgnoredOnTopic', () => {
                    messages.privateFns.filterIgnoredOnPost.yields(null);
                    messages.privateFns.filterIgnoredOnTopic.yields(null);
                    filterIgnored({}, {}, () => {});
                    messages.privateFns.filterIgnoredOnTopic.called.should.be.true;
                });
                it('should accept when filters yield no errror', () => {
                    messages.privateFns.filterIgnoredOnPost.yields(null, 'POST OK');
                    messages.privateFns.filterIgnoredOnTopic.yields(null, 'TOPIC OK');
                    const spy = sinon.spy();
                    filterIgnored({}, {}, spy);
                    spy.lastCall.args.should.deep.equal([null]);
                });
                it('should accept when post filter yields error', () => {
                    messages.privateFns.filterIgnoredOnPost.yields('ignore', 'POST NOT OK');
                    messages.privateFns.filterIgnoredOnTopic.yields(null, 'TOPIC OK');
                    const spy = sinon.spy();
                    filterIgnored({}, {}, spy);
                    spy.lastCall.args.should.deep.equal(['ignore']);
                    utils.warn.called.should.be.true;
                    utils.warn.lastCall.args.should.deep.equal(['Post #undefined Ignored: POST NOT OK']);
                });
                it('should accept when topic filter yields error', () => {
                    messages.privateFns.filterIgnoredOnPost.yields(null, 'POST OK');
                    messages.privateFns.filterIgnoredOnTopic.yields('ignore', 'TOPIC NOT OK');
                    const spy = sinon.spy();
                    filterIgnored({}, {}, spy);
                    spy.lastCall.args.should.deep.equal(['ignore']);
                    utils.warn.called.should.be.true;
                    utils.warn.lastCall.args.should.deep.equal(['Post #undefined Ignored: POST OK, TOPIC NOT OK']);
                });
                after(() => {
                    utils.warn.restore();
                    messages.privateFns.filterIgnoredOnPost.restore();
                    messages.privateFns.filterIgnoredOnTopic.restore();
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
            before(() => {
                sinon.stub(browser, 'getTopic');
                sinon.stub(browser, 'getPost');
                sinon.stub(messages.privateFns, 'filterIgnored');
                messages.internals.events = {
                    emit: sinon.spy()
                };
            });
            beforeEach(() => {
                browser.getTopic.reset();
                browser.getPost.reset();
                messages.privateFns.filterIgnored.reset();
                messages.internals.events.emit.reset();
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
                messages.privateFns.filterIgnored.called.should.be.false;
            });
            it('should abort if getTopic() yields error', () => {
                browser.getTopic.yields('stubbed');
                processTopicMessage({
                    channel: '/topic/1234',
                    data: {
                        id: 5678
                    }
                });
                messages.privateFns.filterIgnored.called.should.be.false;
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
                messages.privateFns.filterIgnored.yields('ignored');
                processTopicMessage({
                    channel: '/topic/1234',
                    data: {
                        id: 5678
                    }
                });
                messages.privateFns.filterIgnored.calledWith(topic, post).should.be.true;
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
                messages.privateFns.filterIgnored.yields('ignored');
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
                messages.privateFns.filterIgnored.yields(null);
                processTopicMessage({
                    channel: '/topic/1234',
                    data: data
                });
                messages.internals.events.emit.calledWith('topic#1234', data, topic, post).should.be.true;
            });
            after(() => {
                browser.getTopic.restore();
                browser.getPost.restore();
                messages.privateFns.filterIgnored.restore();
                messages.internals.events = null;
            });
        });
    });
});
