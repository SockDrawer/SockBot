'use strict';
/*globals describe, it, before, beforeEach, after, afterEach*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon');

chai.should();
const expect = chai.expect;

const notifications = require('../notifications'),
    utils = require('../utils'),
    config = require('../config');
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
        12: 'granted_badge'
    };
    describe('exports', () => {
        const fns = ['prepare', 'pollNotifications'],
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
            objs = ['notifyTypes'],
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
                const types = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
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
        const fns = ['onNotificationMessage', 'handleTopicNotification'];
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
            before(() => {
                notifications.internals.events = events;
                sinon.stub(utils, 'filterIgnored');
                sinon.stub(utils, 'warn');
                sinon.stub(browser, 'getTopic');
                sinon.stub(browser, 'getPost');
            });
            beforeEach(() => {
                events.emit.reset();
                utils.filterIgnored.reset();
                utils.warn.reset();
                browser.getTopic.reset();
                browser.getPost.reset();
            });
            describe('getTopic/getPost subtasks', () => {
                it('should get topic from topic_id in notification', () => {
                    browser.getTopic.yields(null);
                    browser.getPost.yields(null);
                    handleTopicNotification(notification);
                    browser.getTopic.calledWith(1234).should.be.true;
                });
                it('should get post from data.original_post_id in notification', () => {
                    browser.getTopic.yields(null);
                    browser.getPost.yields(null);
                    handleTopicNotification(notification);
                    browser.getPost.calledWith(5432).should.be.true;
                });
                it('should drop notification if getTopic errors', () => {
                    browser.getTopic.yields('error');
                    browser.getPost.yields(null);
                    handleTopicNotification(notification);
                    utils.filterIgnored.called.should.be.false;
                });
                it('should drop notification if getPost errors', () => {
                    browser.getTopic.yields(null);
                    browser.getPost.yields('error');
                    handleTopicNotification(notification);
                    utils.filterIgnored.called.should.be.false;
                });
                it('should drop notification if getTopic errors', () => {
                    browser.getTopic.yields('error');
                    browser.getPost.yields(null);
                    handleTopicNotification(notification);
                    utils.filterIgnored.called.should.be.false;
                });
            });
            it('should pass topic and post to filterIgnored on success', () => {
                const topic = {};
                browser.getTopic.yields(null, topic);
                browser.getPost.yields(null);
                handleTopicNotification(notification);
                utils.filterIgnored.called.should.be.true;
                utils.filterIgnored.firstCall.args[0].should.equal(topic);
            });
            it('should pass topic and post to filterIgnored on success', () => {
                const post = {};
                browser.getTopic.yields(null);
                browser.getPost.yields(null, post);
                handleTopicNotification(notification);
                utils.filterIgnored.called.should.be.true;
                utils.filterIgnored.firstCall.args[1].should.equal(post);
            });
            it('should not emit event on ignored', () => {
                browser.getTopic.yields(null);
                browser.getPost.yields(null);
                utils.filterIgnored.yields('ignore');
                handleTopicNotification(notification);
                events.emit.called.should.be.false;
            });
            it('should not emit event on ignored', () => {
                browser.getTopic.yields(null);
                browser.getPost.yields(null);
                utils.filterIgnored.yields(null);
                handleTopicNotification(notification);
                events.emit.called.should.be.true;
            });
            it('should emit proper event on success', () => {
                const topic = {},
                    post = {};
                browser.getTopic.yields(null, topic);
                browser.getPost.yields(null, post);
                utils.filterIgnored.yields(null);
                handleTopicNotification(notification);
                events.emit.calledWith('notification#someNotification', notification, topic, post).should.be.true;
            });
            it('should warn on unhandled notification', () => {
                const topic = {},
                    post = {};
                browser.getTopic.yields(null, topic);
                browser.getPost.yields(null, post);
                utils.filterIgnored.yields(null);
                handleTopicNotification(notification);
                utils.warn.called.should.be.true;
                utils.warn.firstCall.args[0].should.equal('someNotification notification #' +
                    notification.id + ' was not handled!');
            });
            it('should not warn on handled notification', () => {
                const topic = {},
                    post = {};
                browser.getTopic.yields(null, topic);
                browser.getPost.yields(null, post);
                utils.filterIgnored.yields(null);
                events.emit.returns(true);
                handleTopicNotification(notification);
                utils.warn.called.should.be.false;
            });
            after(() => {
                notifications.internals.events = null;
                utils.filterIgnored.restore();
                utils.warn.restore();
                browser.getTopic.restore();
                browser.getPost.restore();
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
            notifications.internals.events = {
                emit: sandbox.stub()
            };
        });
        afterEach(() => sandbox.restore());
        after(() => notifications.internals.events = null);
        it('should call browser.getNotifications()', () => {
            const spy = sinon.spy();
            notifications.pollNotifications(spy);
            browser.getNotifications.called.should.be.true;
            spy.called.should.be.false;
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
        it('should register channel listener', () => {
            const events = {
                    onChannel: sinon.spy()
                },
                spy = sinon.spy();
            notifications.prepare(events, spy);
            events.onChannel.called.should.be.true;
        });
        it('should register onNotificationMessage as channel listener', () => {
            const events = {
                    onChannel: sinon.spy()
                },
                spy = sinon.spy();
            config.user = {
                id: 9753
            };
            notifications.prepare(events, spy);
            events.onChannel.calledWith('/notifications/9753',
                notifications.privateFns.onNotificationMessage).should.be.true;
        });
        after(() => {
            notifications.internals.events = null;
            config.user = {};
        });
    });
});
