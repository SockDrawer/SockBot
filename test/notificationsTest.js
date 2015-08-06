'use strict';
/*globals describe, it, before, beforeEach, after, afterEach*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon'),
    async = require('async');

chai.should();
const expect = chai.expect;

const notifications = require('../notifications'),
    utils = require('../utils'),
    config = require('../config'),
    commands = require('../commands');
const browser = require('../browser')();

describe('notifications', () => {
    const notifyTypeMap = {
        1: 'mentioned',
        2: 'replied',
        3: 'quoted',
        4: 'edited',
        5: 'liked',
        6: 'private_message',
        7: 'invited_to_private_message',
        8: 'invitee_accepted',
        9: 'posted',
        10: 'moved_post',
        11: 'linked',
        12: 'granted_badge',
        13: 'invited_to_topic',
        14: 'custom'
    };
    describe('exports', () => {
        const fns = ['prepare', 'start', 'pollNotifications'],
            objs = ['internals', 'privateFns'],
            vals = [];
        describe('should export expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(notifications[fn]).to.be.a('function'));
            });
        });
        describe('should export expected objects', () => {
            objs.forEach((obj) => {
                it(obj, () => expect(notifications[obj]).to.be.a('object'));
            });
        });
        describe('should export expected values', () => {
            vals.forEach((val) => {
                it(val, () => notifications.should.have.key(val));
            });
        });
        it('should export only expected keys', () => {
            notifications.should.have.all.keys(fns.concat(objs, vals));
        });
    });
    describe('internals', () => {
        const fns = [],
            objs = ['events', 'notifyTypes'],
            vals = [];
        describe('should export expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(notifications.internals[fn]).to.be.a('function'));
            });
        });
        describe('should export expected objects', () => {
            objs.forEach((obj) => {
                it(obj, () => expect(notifications.internals[obj]).to.be.a('object'));
            });
        });
        describe('should export expected values', () => {
            vals.forEach((val) => {
                it(val, () => notifications.internals.should.have.key(val));
            });
        });
        it('should export only expected keys', () => {
            notifications.internals.should.have.all.keys(fns.concat(objs, vals));
        });
        describe('notifyTypes', () => {
            const notifyTypes = notifications.internals.notifyTypes;
            it('should only have expected notification types', () => {
                const types = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'];
                notifyTypes.should.have.all.keys(types);
            });
            Object.keys(notifyTypeMap).forEach((key) => {
                it('should map #' + key + 'to type `' + notifyTypeMap[key] + '`', () => {
                    notifyTypes[key].should.equal(notifyTypeMap[key]);
                });
            });
        });
    });
    describe('privateFns', () => {
        const fns = ['onNotificationMessage', 'handleTopicNotification', 'onNotification', 'removeNotification'];
        describe('should export expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(notifications.privateFns[fn]).to.be.a('function'));
            });
        });
        it('should export only expected keys', () => {
            notifications.privateFns.should.have.all.keys(fns);
        });
        describe('onNotificationMessage()', () => {
            const onNotificationMessage = notifications.privateFns.onNotificationMessage;
            before(() => sinon.stub(notifications, 'pollNotifications'));
            beforeEach(() => notifications.pollNotifications.reset());
            it('should not poll for zero unread notifications', () => {
                onNotificationMessage({
                    'unread_notifications': 0
                });
                notifications.pollNotifications.called.should.be.false;
            });
            it('should poll for one unread notifications', () => {
                onNotificationMessage({
                    'unread_notifications': 1
                });
                notifications.pollNotifications.called.should.be.true;
            });
            it('should poll for many unread notifications', () => {
                onNotificationMessage({
                    'unread_notifications': 2 + Math.random() * 5000
                });
                notifications.pollNotifications.called.should.be.true;
            });
            it('should not poll for zero unread messages', () => {
                onNotificationMessage({
                    'unread_private_messages': 0
                });
                notifications.pollNotifications.called.should.be.false;
            });
            it('should poll for one unread messages', () => {
                onNotificationMessage({
                    'unread_private_messages': 1
                });
                notifications.pollNotifications.called.should.be.true;
            });
            it('should poll for many unread messages', () => {
                onNotificationMessage({
                    'unread_private_messages': 2 + Math.random() * 5000
                });
                notifications.pollNotifications.called.should.be.true;
            });
            it('should poll for one unread messages but no unread notifications', () => {
                onNotificationMessage({
                    'unread_notifications': 0,
                    'unread_private_messages': 1
                });
                notifications.pollNotifications.called.should.be.true;
            });
            it('should poll for one unread notifications but no unread messages', () => {
                onNotificationMessage({
                    'unread_notifications': 1,
                    'unread_private_messages': 0
                });
                notifications.pollNotifications.called.should.be.true;
            });
            it('should pass callback to pollNotifications', () => {
                onNotificationMessage({
                    'unread_notifications': 1,
                    'unread_private_messages': 0
                });
                notifications.pollNotifications.firstCall.args[0].should.be.a('function');
                notifications.pollNotifications.firstCall.args[0]().should.equal(0);
            });
            after(() => notifications.pollNotifications.restore());
        });
        describe('handleTopicNotification()', () => {
            const handleTopicNotification = notifications.privateFns.handleTopicNotification,
                notification = {
                    id: Math.random(),
                    'topic_id': 1234,
                    type: 'someNotification',
                    data: {
                        'original_post_id': 5432
                    }
                },
                events = {
                    emit: sinon.stub()
                };
            let sandbox;
            beforeEach(() => {
                notifications.internals.events = events;
                events.emit = sinon.stub();
                sandbox = sinon.sandbox.create();
                sandbox.stub(utils, 'filterIgnored');
                sandbox.stub(utils, 'warn');
                sandbox.stub(browser, 'getTopic');
                sandbox.stub(browser, 'getPost');
                sandbox.stub(commands, 'parseCommands');
                sandbox.useFakeTimers();
                async.nextTick = (fn) => setTimeout(fn, 0);
                async.setImmediate = (fn) => setTimeout(fn, 0);
            });
            afterEach(() => sandbox.restore());
            describe('getTopic/getPost subtasks', () => {
                it('should get topic from topic_id in notification', () => {
                    browser.getTopic.yields(null);
                    browser.getPost.yields(null);
                    handleTopicNotification(notification);
                    sandbox.clock.tick(0);
                    browser.getTopic.calledWith(1234).should.be.true;
                });
                it('should get post from data.original_post_id in notification', () => {
                    browser.getTopic.yields(null);
                    browser.getPost.yields(null);
                    handleTopicNotification(notification);
                    sandbox.clock.tick(0);
                    browser.getPost.calledWith(5432).should.be.true;
                });
                it('should drop notification if getTopic errors', () => {
                    browser.getTopic.yields('error');
                    browser.getPost.yields(null);
                    handleTopicNotification(notification);
                    sandbox.clock.tick(0);
                    utils.filterIgnored.called.should.be.false;
                });
                it('should drop notification if getPost errors', () => {
                    browser.getTopic.yields(null);
                    browser.getPost.yields('error');
                    handleTopicNotification(notification);
                    sandbox.clock.tick(0);
                    utils.filterIgnored.called.should.be.false;
                });
                it('should drop notification if getTopic errors', () => {
                    browser.getTopic.yields('error');
                    browser.getPost.yields(null);
                    handleTopicNotification(notification);
                    sandbox.clock.tick(0);
                    utils.filterIgnored.called.should.be.false;
                });
            });
            it('should pass topic and post to filterIgnored on success', () => {
                const topic = {};
                browser.getTopic.yields(null, topic);
                browser.getPost.yields(null);
                handleTopicNotification(notification);
                sandbox.clock.tick(0);
                utils.filterIgnored.called.should.be.true;
                utils.filterIgnored.firstCall.args[0].should.equal(topic);
            });
            it('should pass topic and post to filterIgnored on success', () => {
                const post = {};
                browser.getTopic.yields(null);
                browser.getPost.yields(null, post);
                handleTopicNotification(notification);
                sandbox.clock.tick(0);
                utils.filterIgnored.called.should.be.true;
                utils.filterIgnored.firstCall.args[1].should.equal(post);
            });
            it('should not emit event on ignored', () => {
                browser.getTopic.yields(null);
                browser.getPost.yields(null);
                commands.parseCommands.yields(null);
                utils.filterIgnored.yields('ignore');
                handleTopicNotification(notification);
                sandbox.clock.tick(0);
                events.emit.called.should.be.false;
            });
            it('should not emit event on ignored', () => {
                browser.getTopic.yields(null);
                browser.getPost.yields(null);
                commands.parseCommands.yields(null);
                utils.filterIgnored.yields(null);
                handleTopicNotification(notification);
                sandbox.clock.tick(0);
                events.emit.called.should.be.true;
            });
            describe('commands', () => {
                it('should not parse commands on invalid notification type', () => {
                    browser.getTopic.yields(null);
                    browser.getPost.yields(null);
                    commands.parseCommands.yields(null);
                    utils.filterIgnored.yields(null);
                    handleTopicNotification(notification);
                    sandbox.clock.tick(0);
                    commands.parseCommands.called.should.be.false;
                });
                it('should parse commands on mentioned notification type', () => {
                    notification.type = 'mentioned';
                    browser.getTopic.yields(null);
                    browser.getPost.yields(null);
                    commands.parseCommands.yields(null);
                    utils.filterIgnored.yields(null);
                    handleTopicNotification(notification);
                    sandbox.clock.tick(0);
                    commands.parseCommands.called.should.be.true;
                });
                it('should parse commands on replied notification type', () => {
                    notification.type = 'replied';
                    browser.getTopic.yields(null);
                    browser.getPost.yields(null);
                    commands.parseCommands.yields(null);
                    utils.filterIgnored.yields(null);
                    handleTopicNotification(notification);
                    sandbox.clock.tick(0);
                    commands.parseCommands.called.should.be.true;
                });
                it('should parse commands on quoted notification type', () => {
                    notification.type = 'quoted';
                    browser.getTopic.yields(null);
                    browser.getPost.yields(null);
                    commands.parseCommands.yields(null);
                    utils.filterIgnored.yields(null);
                    handleTopicNotification(notification);
                    sandbox.clock.tick(0);
                    commands.parseCommands.called.should.be.true;
                });
                it('should parse commands on private_message notification type', () => {
                    notification.type = 'private_message';
                    browser.getTopic.yields(null);
                    browser.getPost.yields(null);
                    commands.parseCommands.yields(null);
                    utils.filterIgnored.yields(null);
                    handleTopicNotification(notification);
                    sandbox.clock.tick(0);
                    commands.parseCommands.called.should.be.true;
                });
                it('should parse commands on posted notification type', () => {
                    notification.type = 'posted';
                    browser.getTopic.yields(null);
                    browser.getPost.yields(null);
                    commands.parseCommands.yields(null);
                    utils.filterIgnored.yields(null);
                    handleTopicNotification(notification);
                    sandbox.clock.tick(0);
                    commands.parseCommands.called.should.be.true;
                });
                it('should not emit event on parseCommands error', () => {
                    notification.type = 'mentioned';
                    browser.getTopic.yields(null);
                    browser.getPost.yields(null);
                    commands.parseCommands.yields(new Error());
                    utils.filterIgnored.yields(null);
                    handleTopicNotification(notification);
                    sandbox.clock.tick(0);
                    events.emit.called.should.be.false;
                });
                it('should not emit event on parseCommands finding commands', () => {
                    notification.type = 'mentioned';
                    browser.getTopic.yields(null);
                    browser.getPost.yields(null);
                    commands.parseCommands.yields(null, [{}]);
                    utils.filterIgnored.yields(null);
                    handleTopicNotification(notification);
                    sandbox.clock.tick(0);
                    events.emit.called.should.be.false;
                });
                it('should emit event on parseCommands finding no commands', () => {
                    notification.type = 'mentioned';
                    browser.getTopic.yields(null);
                    browser.getPost.yields(null);
                    commands.parseCommands.yields(null, []);
                    utils.filterIgnored.yields(null);
                    handleTopicNotification(notification);
                    sandbox.clock.tick(0);
                    events.emit.called.should.be.true;
                });
            });
            it('should emit proper event on success', () => {
                const topic = {},
                    post = {};
                browser.getTopic.yields(null, topic);
                browser.getPost.yields(null, post);
                commands.parseCommands.yields(null);
                utils.filterIgnored.yields(null);
                handleTopicNotification(notification);
                sandbox.clock.tick(0);
                events.emit.calledWith('notification#someNotification', notification, topic, post).should.be.true;
            });
            it('should warn on unhandled notification', () => {
                const topic = {},
                    post = {};
                browser.getTopic.yields(null, topic);
                browser.getPost.yields(null, post);
                commands.parseCommands.yields(null);
                utils.filterIgnored.yields(null);
                handleTopicNotification(notification);
                sandbox.clock.tick(0);
                utils.warn.called.should.be.true;
                utils.warn.firstCall.args[0].should.equal('someNotification notification #' +
                    notification.id + ' was not handled!');
            });
            it('should not warn on handled notification', () => {
                const topic = {},
                    post = {};
                browser.getTopic.yields(null, topic);
                browser.getPost.yields(null, post);
                commands.parseCommands.yields(null);
                utils.filterIgnored.yields(null);
                events.emit.returns(true);
                handleTopicNotification(notification);
                sandbox.clock.tick(0);
                utils.warn.called.should.be.false;
            });
        });
        describe('onNotification()', () => {
            const onNotification = notifications.privateFns.onNotification;
            let sandbox;
            beforeEach(() => {
                sandbox = sinon.sandbox.create();
                sandbox.stub(utils, 'warn');
                notifications.internals.events = {
                    on: sinon.spy()
                };
            });
            afterEach(() => sandbox.restore());
            describe('type validation', () => {
                it('should print warning on unrecognized type', () => {
                    const type = '' + Math.random();
                    onNotification(type, () => 0);
                    utils.warn.called.should.be.true;
                    utils.warn.firstCall.args[0].should.equal('Notification type `' + type + '` is not recognized.');
                });
                Object.keys(notifyTypeMap).map((t) => notifyTypeMap[t]).forEach((type) => {
                    it('should not print warning on recognized type: ' + type, () => {
                        onNotification(type, () => 0);
                        utils.warn.called.should.be.false;
                    });
                });
            });
            it('should return events object for chaining', () => {
                const events = onNotification('', () => 0);
                events.should.equal(notifications.internals.events);
            });
            it('should add listener to events', () => {
                const spy = sinon.spy();
                onNotification('foobar', spy);
                notifications.internals.events.on.called.should.be.true;
                const args = notifications.internals.events.on.firstCall.args;
                args.should.deep.equal(['notification#foobar', spy]);
            });
        });
        describe('removeNotification()', () => {
            const removeNotification = notifications.privateFns.removeNotification;
            beforeEach(() => {
                notifications.internals.events = {
                    removeListener: sinon.spy()
                };
            });
            it('should return events object for chaining', () => {
                const events = removeNotification('', () => 0);
                events.should.equal(notifications.internals.events);
            });
            it('should add listener to events', () => {
                const spy = sinon.spy();
                removeNotification('foobar', spy);
                notifications.internals.events.removeListener.called.should.be.true;
                const args = notifications.internals.events.removeListener.firstCall.args;
                args.should.deep.equal(['notification#foobar', spy]);
            });
        });
    });
    describe('pollNotifications()', () => {
        let sandbox;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(browser, 'getNotifications');
            sandbox.stub(notifications.privateFns, 'handleTopicNotification');
            sandbox.stub(utils, 'warn');
            sandbox.stub(utils, 'log');
            notifications.internals.events = {
                emit: sandbox.stub()
            };
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('should call browser.getNotifications()', () => {
            const spy = sinon.spy();
            notifications.pollNotifications(spy);
            browser.getNotifications.called.should.be.true;
            spy.called.should.be.false;
        });
        it('should log notification', () => {
            const spy = sinon.spy();
            notifications.pollNotifications(spy);
            utils.log.calledWith('Polling Notifications').should.be.true;
        });
        it('should pass error to callback on failure', () => {
            browser.getNotifications.yields('i am error');
            const spy = sinon.spy();
            notifications.pollNotifications(spy);
            spy.called.should.be.true;
            spy.firstCall.args[0].should.equal('i am error');
        });
        it('should signal success to callback on poll success', () => {
            browser.getNotifications.yields(null, {
                notifications: []
            });
            const spy = sinon.spy();
            notifications.pollNotifications(spy);
            spy.called.should.be.true;
            expect(spy.firstCall.args[0]).to.equal(null);
        });
        it('should filter read notifications', () => {
            browser.getNotifications.yields(null, {
                notifications: [{
                    read: true
                }]
            });
            notifications.pollNotifications(() => 0);
            notifications.internals.events.emit.called.should.be.false;
            notifications.privateFns.handleTopicNotification.called.should.be.false;
        });
        it('should emit expected message on non-topic notification', () => {
            const notify = {
                'topic_id': null
            };
            browser.getNotifications.yields(null, {
                notifications: [notify]
            });
            notifications.pollNotifications(() => 0);
            notifications.internals.events.emit.called.should.be.true;
            notifications.internals.events.emit.calledWith('notification#UNKNOWN', notify, null, null).should.be.true;
        });
        it('should emit expected message on non-topic notification', () => {
            const notify = {
                'topic_id': 1
            };
            browser.getNotifications.yields(null, {
                notifications: [notify]
            });
            notifications.pollNotifications(() => 0);
            notifications.privateFns.handleTopicNotification.called.should.be.true;
            notifications.privateFns.handleTopicNotification.calledWith(notify).should.be.true;
        });
        it('should print warning on unhandled notification', () => {
            const notify = {
                id: Math.random()
            };
            browser.getNotifications.yields(null, {
                notifications: [notify]
            });
            notifications.pollNotifications(() => 0);
            utils.warn.called.should.be.true;
            utils.warn.firstCall.args[0].should.equal('UNKNOWN notification #' + notify.id + ' was not handled!');
        });
        it('should not print warning on handled notification', () => {
            const notify = {
                id: Math.random()
            };
            notifications.internals.events.emit.returns(true);
            browser.getNotifications.yields(null, {
                notifications: [notify]
            });
            notifications.pollNotifications(() => 0);
            utils.warn.called.should.be.false;
        });
        describe('type mapping', () => {
            it('should map invalid notification_type to `UNKNOWN`', () => {
                const notify = {
                    'notification_type': -1
                };
                browser.getNotifications.yields(null, {
                    notifications: [notify]
                });
                notifications.pollNotifications(() => 0);
                expect(notify.type).to.equal('UNKNOWN');
            });
            Object.keys(notifyTypeMap).forEach((type) => {
                it('should map notification_type ' + type + ' to `' + notifyTypeMap[type] + '`', () => {
                    const notify = {
                        'notification_type': type
                    };
                    browser.getNotifications.yields(null, {
                        notifications: [notify]
                    });
                    notifications.pollNotifications(() => 0);
                    expect(notify.type).to.equal(notifyTypeMap[type]);
                });
            });
        });
        describe('event type mapping', () => {
            it('should emit `notification#UNKNOWN` for invalid type', () => {
                const notify = {
                    'notification_type': -1
                };
                browser.getNotifications.yields(null, {
                    notifications: [notify]
                });
                notifications.pollNotifications(() => 0);
                const call = notifications.internals.events.emit.firstCall;
                call.args[0].should.equal('notification#UNKNOWN');
            });
            Object.keys(notifyTypeMap).forEach((type) => {
                it('should emit `notification#' + notifyTypeMap[type] + '` for type ' + type, () => {
                    const notify = {
                        'notification_type': type
                    };
                    browser.getNotifications.yields(null, {
                        notifications: [notify]
                    });
                    notifications.pollNotifications(() => 0);
                    const call = notifications.internals.events.emit.firstCall;
                    call.args[0].should.equal('notification#' + notifyTypeMap[type]);
                });
            });
        });
    });
    describe('prepare()', () => {
        it('should call callback on completion', () => {
            const events = {
                    onChannel: sinon.spy()
                },
                spy = sinon.spy();
            notifications.prepare(events, spy);
            spy.called.should.be.true;
        });
        it('should set events into internal store', () => {
            const events = {
                    onChannel: sinon.spy()
                },
                spy = sinon.spy();
            notifications.prepare(events, spy);
            notifications.internals.events.should.equal(events);
        });
        it('should add onNotification function to events', () => {
            const events = {
                    onChannel: sinon.spy()
                },
                spy = sinon.spy();
            config.user = {
                id: 9753
            };
            notifications.prepare(events, spy);
            expect(events.onNotification).to.equal(notifications.privateFns.onNotification);
        });
        it('should add removeNotification function to events', () => {
            const events = {
                    onChannel: sinon.spy()
                },
                spy = sinon.spy();
            config.user = {
                id: 9753
            };
            notifications.prepare(events, spy);
            expect(events.removeNotification).to.equal(notifications.privateFns.removeNotification);
        });
        after(() => {
            config.user = {};
        });
    });
    describe('start()', () => {
        it('should register channel listener', () => {
            const events = {
                onChannel: sinon.spy()
            };
            notifications.internals.events = events;
            notifications.start();
            events.onChannel.called.should.be.true;
        });
        it('should register onNotificationMessage as channel listener', () => {
            const events = {
                onChannel: sinon.spy()
            };
            config.user = {
                id: 9753
            };
            notifications.internals.events = events;
            notifications.start();
            events.onChannel.calledWith('/notification/9753',
                notifications.privateFns.onNotificationMessage).should.be.true;
        });
    });
});
