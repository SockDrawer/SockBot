'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.should();

const sinon = require('sinon');
require('sinon-as-promised');
chai.use(require('sinon-chai'));

const testModule = require('../../../providers/nodebb/notification');
const utils = require('../../../lib/utils');

describe('providers/nodebb/notification', () => {
    it('should export bindNotification()', () => {
        testModule.bindNotification.should.be.a('function');
    });
    it('should return a class on call to bindNotification()', () => {
        testModule.bindNotification({}).should.be.a('function');
    });
    describe('Post', () => {
        const forum = {
            username: `username${Math.random()}`
        };
        const Notification = testModule.bindNotification(forum);
        beforeEach(() => {
            forum._emit = sinon.stub().resolves();
            forum.emit = sinon.stub();
        });
        describe('ctor()', () => {
            it('should store instance data in utils.storage', () => {
                const notification = new Notification({});
                utils.mapGet(notification).should.be.ok;
            });
            it('should accept serialized input', () => {
                const notification = new Notification('{}');
                utils.mapGet(notification).should.be.ok;
            });
            [
                ['label', 'bodyShort'],
                ['body', 'bodyLong'],
                ['id', 'nid'],
                ['postId', 'pid'],
                ['topicId', 'tid'],
                ['userId', 'from'],
                ['read', 'read'],
                ['url', 'path']
            ].forEach((keys) => {
                const outKey = keys[0],
                    inKey = keys[1];
                it(`should store ${outKey} in utils.storage`, () => {
                    const expected = `a${Math.random()}b`;
                    const values = {};
                    values[inKey] = expected;
                    const notification = new Notification(values);
                    utils.mapGet(notification, outKey).should.equal(expected);
                });
            });
            it('should parse date for posted', () => {
                const expected = Math.round(Math.random() * (2 << 29));
                const notification = new Notification({
                    datetime: expected
                });
                utils.mapGet(notification, 'date').getTime().should.equal(expected);
            });
            it('should unescape HTML in `body`', () => {
                const expected = '<div><b><i><a href="https://example.com">hi there!</a></i></b></div>';
                const notification = new Notification({
                    bodyLong: '&lt;div&gt;&lt;b&gt;&lt;i&gt;&lt;a href=&quot;https://example.com&quot;&gt;' +
                        'hi there!&lt;/a&gt;&lt;/i&gt;&lt;/b&gt;&lt;/div&gt;'
                });
                utils.mapGet(notification, 'body').should.equal(expected);
            });
            describe('type', () => {
                it('should default to `notification`', () => {
                    const notification = new Notification({
                        bodyShort: 'a random notification text'
                    });
                    utils.mapGet(notification, 'type').should.equal('notification');
                });
                it('should switch to `reply` for replies', () => {
                    const notification = new Notification({
                        bodyShort: '[[notifications:user_posted_to'
                    });
                    utils.mapGet(notification, 'type').should.equal('reply');
                });
                it('should switch to `reply` case insentitively', () => {
                    const notification = new Notification({
                        bodyShort: '[[NoTiFiCaTiOnS:UsEr_pOsTeD_To'
                    });
                    utils.mapGet(notification, 'type').should.equal('reply');
                });
                it('should switch to `mention` for mentions', () => {
                    const notification = new Notification({
                        bodyShort: '[[mentions:user_mentioned_you_in',
                        bodyLong: `this is for @${forum.username} `
                    });
                    utils.mapGet(notification, 'type').should.equal('mention');
                });
                it('should switch to `mention` case insentitively', () => {
                    const notification = new Notification({
                        bodyShort: '[[mEnTiOnS:UsEr_mEnTiOnEd_yOu_iN',
                        bodyLong: `this is for @${forum.username}`
                    });
                    utils.mapGet(notification, 'type').should.equal('mention');
                });
                it('should switch to `group_mention` for group mentions', () => {
                    const notification = new Notification({
                        bodyShort: '[[mentions:user_mentioned_you_in',
                        bodyLong: 'this is for @bots'
                    });
                    utils.mapGet(notification, 'type').should.equal('group_mention');
                });
                it('should switch to `group_mention` case insentitively', () => {
                    const notification = new Notification({
                        bodyShort: '[[mEnTiOnS:UsEr_mEnTiOnEd_yOu_iN',
                        bodyLong: 'this is for @bots '
                    });
                    utils.mapGet(notification, 'type').should.equal('group_mention');
                });
            });
            describe('subtype', () => {
                it('should default to the empty string', () => {
                    const notification = new Notification({});
                    utils.mapGet(notification, 'subtype').should.equal('');
                });
                it('should default to the empty string when regex match fails', () => {
                    const notification = new Notification({
                        bodyShort: 'blorgle flort quux i am bad format'
                    });
                    utils.mapGet(notification, 'subtype').should.equal('');
                });
                it('should set to results of regex match', () => {
                    const notification = new Notification({
                        bodyShort: '[[blorgle:subtype_set_go! flort quux i am bad format'
                    });
                    utils.mapGet(notification, 'subtype').should.equal('subtype_set_go');
                });
            });
        });
        describe('simple getters', () => {
            let notification, data;
            beforeEach(() => {
                notification = new Notification({});
                data = utils.mapGet(notification);
            });
            ['id', 'postId', 'topicId', 'userId', 'type', 'subtype', 'read',
                'date', 'label', 'body'
            ].forEach((key) => {
                it(`should get value from utils.storage for ${key}`, () => {
                    const expected = `${Math.random()}${Math.random()}`;
                    data[key] = expected;
                    notification[key].should.equal(expected);
                });
            });
        });
        describe('getText()', () => {
            let notification, data;
            beforeEach(() => {
                notification = new Notification({});
                data = utils.mapGet(notification);
                forum.Post = {
                    preview: sinon.stub().resolves()
                };
            });
            it('should return body directly for non mention notification', () => {
                const expected = Math.random();
                data.body = expected;
                data.type = `a${Math.random()}b`;
                return notification.getText().should.become(expected);
            });
            it('should not call post.preview  for non mention notification', () => {
                data.type = `a${Math.random()}b`;
                return notification.getText().then(() => {
                    forum.Post.preview.should.not.have.been.called;
                });
            });
            it('should call Post.preview for mention notification', () => {
                data.type = 'mention';
                return notification.getText().then(() => {
                    forum.Post.preview.should.have.been.calledOnce;
                });
            });
            it('should process body via Post.preview for mention notification', () => {
                const expected = Math.random();
                data.body = expected;
                data.type = 'mention';
                return notification.getText().then(() => {
                    forum.Post.preview.should.have.been.calledWith(expected).once;
                });
            });
            it('should resolve to result of Post.preview for mention notification', () => {
                const expected = Math.random();
                data.body = `a${Math.random()}b`;
                data.type = 'mention';
                forum.Post.preview.resolves(expected);
                return notification.getText().should.become(expected);
            });
            it('should reject when Post.preview rejects for mention notification', () => {
                data.type = 'mention';
                forum.Post.preview.rejects('bad');
                return notification.getText().should.be.rejected;
            });
            it('should not reject when Post.preview rejects for non mention notification', () => {
                data.type = 'not a mention';
                forum.Post.preview.rejects('bad');
                return notification.getText().should.be.resolved;
            });
        });
        describe('url()', () => {
            let notification, data;
            beforeEach(() => {
                notification = new Notification({});
                data = utils.mapGet(notification);
            });
            it('should resolve to expected value', () => {
                const partA = `a${Math.random()}b`,
                    partB = `c${Math.random()}d`,
                    expected = `${partA}/${partB}`;
                forum.url = partA;
                data.url = partB;
                return notification.url().should.become(expected);
            });
        });
        [
            ['getPost', 'Post', 'postId'],
            ['getTopic', 'Topic', 'topicId'],
            ['getUser', 'User', 'userId']
        ].forEach((task) => {
            const fn = task[0],
                obj = task[1],
                prop = task[2];
            describe(`${fn}()`, () => {
                let notification, data;
                beforeEach(() => {
                    notification = new Notification({});
                    data = utils.mapGet(notification);
                    forum[obj] = {
                        get: sinon.stub().resolves()
                    };
                });
                it(`should retrieve post via ${obj}.get()`, () => {
                    return notification[fn]().then(() => {
                        forum[obj].get.should.have.been.calledOnce;
                    });
                });
                it(`should pass ${prop} to ${obj}.get()`, () => {
                    const expected = Math.random();
                    data[prop] = expected;
                    return notification[fn]().then(() => {
                        forum[obj].get.should.have.been.calledWith(expected).once;
                    });
                });
                it(`should resolve to results of ${obj}.get()`, () => {
                    const expected = Math.random();
                    forum[obj].get.resolves(expected);
                    return notification[fn]().should.become(expected);
                });
                it(`should reject when ${obj}.get() rejects`, () => {
                    forum[obj].get.rejects('bad');
                    return notification[fn]().should.be.rejected;
                });
            });
        });
        describe('static get()', () => {
            let sandbox = null;
            beforeEach(() => {
                sandbox = sinon.sandbox.create();
                sandbox.stub(Notification, 'parse').resolves();
                forum._emit = sinon.stub().resolves([]);
            });
            afterEach(() => sandbox.restore());
            it('should emit `notifications.get` via websocket', () => {
                return Notification.get('foo').then(() => {
                    forum._emit.should.have.been.calledWith('notifications.get').once;
                });
            });
            it('should pass expected payload to `notifications.get`', () => {
                const expected = Math.random();
                return Notification.get(expected).then(() => {
                    forum._emit.calledWith('notifications.get', {
                        nids: [expected]
                    }).should.be.true;
                });
            });
            it('should parse results by `Notification.parse`', () => {
                return Notification.get().then(() => {
                    Notification.parse.should.have.been.calledOnce;
                });
            });
            it('should parse single result by `Notification.parse`', () => {
                const expected = Math.random();
                forum._emit.resolves([expected]);
                return Notification.get().then(() => {
                    Notification.parse.should.have.been.calledWith(expected).once;
                });
            });
            it('should resolve to results of `Notification.parse()`', () => {
                const expected = Math.random();
                Notification.parse.resolves(expected);
                return Notification.get().should.become(expected);
            });
            it('should reject when websocket rejects', () => {
                forum._emit.rejects('bad');
                return Notification.get().should.be.rejected;
            });
            it('should reject when `Notification.parse()` rejects', () => {
                Notification.parse.rejects('bad');
                return Notification.get().should.be.rejected;
            });
        });
        describe('static parse()', () => {
            it('should throw error on falsy payload', () => {
                chai.expect(() => Notification.parse()).to.throw('E_NOTIFICATION_NOT_FOUND');
            });
            it('should store instance data in utils.storage', () => {
                const notification = Notification.parse({});
                utils.mapGet(notification).should.be.ok;
            });
            it('should accept serialized input', () => {
                const notification = Notification.parse('{}');
                utils.mapGet(notification).should.be.ok;
            });
            [
                ['label', 'bodyShort'],
                ['body', 'bodyLong'],
                ['id', 'nid'],
                ['postId', 'pid'],
                ['topicId', 'tid'],
                ['userId', 'from'],
                ['read', 'read'],
                ['url', 'path']
            ].forEach((keys) => {
                const outKey = keys[0],
                    inKey = keys[1];
                it(`should store ${outKey} in utils.storage`, () => {
                    const expected = `a${Math.random()}b`;
                    const values = {};
                    values[inKey] = expected;
                    const notification = Notification.parse(values);
                    utils.mapGet(notification, outKey).should.equal(expected);
                });
            });
            it('should parse date for posted', () => {
                const expected = Math.round(Math.random() * (2 << 29));
                const notification = Notification.parse({
                    datetime: expected
                });
                utils.mapGet(notification, 'date').getTime().should.equal(expected);
            });
            it('should unescape HTML in `body`', () => {
                const expected = '<div><b><i><a href="https://example.com">hi there!</a></i></b></div>';
                const notification = Notification.parse({
                    bodyLong: '&lt;div&gt;&lt;b&gt;&lt;i&gt;&lt;a href=&quot;https://example.com&quot;&gt;' +
                        'hi there!&lt;/a&gt;&lt;/i&gt;&lt;/b&gt;&lt;/div&gt;'
                });
                utils.mapGet(notification, 'body').should.equal(expected);
            });
            describe('type', () => {
                it('should default to `notification`', () => {
                    const notification = Notification.parse({
                        bodyShort: 'a random notification text'
                    });
                    utils.mapGet(notification, 'type').should.equal('notification');
                });
                it('should switch to `reply` for replies', () => {
                    const notification = Notification.parse({
                        bodyShort: '[[notifications:user_posted_to'
                    });
                    utils.mapGet(notification, 'type').should.equal('reply');
                });
                it('should switch to `reply` case insentitively', () => {
                    const notification = Notification.parse({
                        bodyShort: '[[NoTiFiCaTiOnS:UsEr_pOsTeD_To'
                    });
                    utils.mapGet(notification, 'type').should.equal('reply');
                });
                it('should switch to `mention` for mentions', () => {
                    const notification = new Notification({
                        bodyShort: '[[mentions:user_mentioned_you_in',
                        bodyLong: `this is for @${forum.username} `
                    });
                    utils.mapGet(notification, 'type').should.equal('mention');
                });
                it('should switch to `mention` case insentitively', () => {
                    const notification = new Notification({
                        bodyShort: '[[mEnTiOnS:UsEr_mEnTiOnEd_yOu_iN',
                        bodyLong: `this is for @${forum.username}`
                    });
                    utils.mapGet(notification, 'type').should.equal('mention');
                });
                it('should switch to `group_mention` for group mentions', () => {
                    const notification = new Notification({
                        bodyShort: '[[mentions:user_mentioned_you_in',
                        bodyLong: 'this is for @bots'
                    });
                    utils.mapGet(notification, 'type').should.equal('group_mention');
                });
                it('should switch to `groupmention` case insentitively', () => {
                    const notification = new Notification({
                        bodyShort: '[[mEnTiOnS:UsEr_mEnTiOnEd_yOu_iN',
                        bodyLong: 'this is for @bots '
                    });
                    utils.mapGet(notification, 'type').should.equal('group_mention');
                });
            });
            describe('subtype', () => {
                it('should default to the empty string', () => {
                    const notification = Notification.parse({});
                    utils.mapGet(notification, 'subtype').should.equal('');
                });
                it('should default to the empty string when regex match fails', () => {
                    const notification = Notification.parse({
                        bodyShort: 'blorgle flort quux i am bad format'
                    });
                    utils.mapGet(notification, 'subtype').should.equal('');
                });
                it('should set to results of regex match', () => {
                    const notification = Notification.parse({
                        bodyShort: '[[blorgle:subtype_set_go! flort quux i am bad format'
                    });
                    utils.mapGet(notification, 'subtype').should.equal('subtype_set_go');
                });
            });
        });
        describe('static activate()', () => {
            beforeEach(() => {
                forum.socket = {
                    on: sinon.stub()
                };
            });
            it('should listen to `event:new_notification`', () => {
                Notification.activate();
                forum.socket.on.should.have.been.calledWith('event:new_notification').once;
            });
            it('should register listener function for `event:new_notification`', () => {
                Notification.activate();
                forum.socket.on.callCount.should.equal(1);
                forum.socket.on.firstCall.args[1].should.be.a('function');
            });
        });
        describe('static deactivate()', () => {
            beforeEach(() => {
                forum.socket = {
                    off: sinon.stub()
                };
            });
            it('should unlisten to `event:new_notification`', () => {
                Notification.deactivate();
                forum.socket.off.should.have.been.calledWith('event:new_notification').once;
            });
            it('should unregister listener function for `event:new_notification`', () => {
                Notification.deactivate();
                forum.socket.off.callCount.should.equal(1);
                forum.socket.off.firstCall.args[1].should.be.a('function');
            });
        });
        describe('static getNotifications()', () => {
            let sandbox = null;
            beforeEach(() => {
                sandbox = sinon.sandbox.create();
                sandbox.stub(Notification, 'parse').resolves({});
                forum._emit = sinon.stub().resolves({});
            });
            afterEach(() => sandbox.restore());
            it('should emit `notifications.loadMore`', () => {
                return Notification.getNotifications(() => Promise.resolve()).then(() => {
                    forum._emit.calledWith('notifications.loadMore', {
                        after: 0
                    }).should.be.true;
                });
            });
            it('should emit `notifications.loadMore` to load second page of results', () => {
                const expected = Math.random();
                forum._emit.onFirstCall().resolves({
                    notifications: [{}],
                    nextStart: expected
                });
                return Notification.getNotifications(() => Promise.resolve()).then(() => {
                    forum._emit.calledWith('notifications.loadMore', {
                        after: expected
                    }).should.be.true;
                });
            });
            it('should not call progress function for zero results', () => {
                const spy = sinon.stub().resolves();
                return Notification.getNotifications(spy).then(() => {
                    spy.should.not.have.been.called;
                });
            });
            it('should not call progress function for empty results', () => {
                forum._emit.onFirstCall().resolves({
                    notifications: []
                });
                const spy = sinon.stub().resolves();
                return Notification.getNotifications(spy).then(() => {
                    spy.should.not.have.been.called;
                });
            });
            it('should not parse notification via `Notification.parse`', () => {
                const expected = Math.random();
                forum._emit.onFirstCall().resolves({
                    notifications: [expected]
                });
                return Notification.getNotifications(() => Promise.resolve()).then(() => {
                    Notification.parse.should.have.been.calledWith(expected).once;
                });
            });
            it('should call progress function with result of `Notification.parse`', () => {
                const expected = Math.random();
                const spy = sinon.stub().resolves();
                forum._emit.onFirstCall().resolves({
                    notifications: [{}]
                });
                Notification.parse.returns(expected);
                return Notification.getNotifications(spy).then(() => {
                    spy.should.have.been.calledWith(expected).once;
                });
            });
            it('should reject when `notifications.loadMore` rejects', () => {
                const spy = sinon.stub().resolves();
                forum._emit.onFirstCall().rejects('bad');
                return Notification.getNotifications(spy).should.be.rejected;
            });
            it('should reject when progress function rejects', () => {
                const spy = sinon.stub().rejects('bad');
                forum._emit.onFirstCall().resolves({
                    notifications: [1]
                });
                return Notification.getNotifications(spy).should.be.rejected;
            });
            it('should reject when progress function', () => {
                const spy = sinon.stub().resolves();
                spy.onSecondCall().rejects('bad');
                forum._emit.onFirstCall().resolves({
                    notifications: [5, 5, 5, 5, 5]
                });
                return Notification.getNotifications(spy).catch(() => {
                    spy.callCount.should.equal(2);
                });
            });
        });
        describe('internal notifyHandler()', () => {
            let sandbox = null,
                notifier = null,
                commands = null,
                notifyHandler = null;
            beforeEach(() => {
                commands = {
                    commands: [1],
                    execute: sinon.stub().resolves()
                };
                notifier = {
                    getText: sinon.stub().resolves()
                };
                sandbox = sinon.sandbox.create();
                sandbox.stub(Notification, 'parse').returns(notifier);
                forum.socket = {
                    on: sinon.spy()
                };
                forum.emit = sinon.spy();
                forum.Commands = {
                    get: sinon.stub().resolves(commands)
                };
                forum.Post = {
                    reply: sinon.stub().resolves()
                };
                Notification.activate();
                notifyHandler = forum.socket.on.firstCall.args[1];
            });
            afterEach(() => sandbox.restore());
            it('should parse notification with `Notification.parse`', () => {
                const expected = Math.random();
                return notifyHandler(expected).then(() => {
                    Notification.parse.should.have.been.calledWith(expected).once;
                });
            });
            it('should get text from notification with `notification.getText()`', () => {
                const expected = Math.random();
                return notifyHandler(expected).then(() => {
                    notifier.getText.should.have.been.calledOnce;
                });
            });
            it('should parse commands with `forum.Commands.get`', () => {
                const text = Math.random(),
                    post = Math.random(),
                    topic = Math.random(),
                    user = Math.random();
                notifier.postId = post;
                notifier.topicId = topic;
                notifier.userId = user;
                notifier.getText.resolves(text);
                return notifyHandler(7).then(() => {
                    const args = forum.Commands.get.firstCall.args;
                    args[0].should.eql({
                        post: post,
                        topic: topic,
                        user: user,
                        room: -1,
                        chat: -1
                    });
                    args[1].should.eql(text);
                    args[2].should.be.a('function');
                    args.length.should.eql(3);
                });
            });
            it('should provide valid ReplyHandler to `forum.Commands.get`', () => {
                const text = Math.random(),
                    post = Math.random(),
                    topic = Math.random(),
                    user = Math.random();
                notifier.postId = post;
                notifier.topicId = topic;
                notifier.userId = user;
                notifier.getText.resolves(text);
                return notifyHandler(7).then(() => {
                    const args = forum.Commands.get.firstCall.args;
                    const handler = args[2];
                    const content = `a${Math.random()}g`;
                    return handler(content).then(() => {
                        forum.Post.reply.should.have.been.calledWith(topic, post, content).once;
                    });
                });
            });
            it('should execute parsed commands', () => {
                const spy = sinon.spy();
                forum.Commands.get.resolves({
                    commands: [1],
                    execute: spy
                });
                return notifyHandler(5).then(() => {
                    spy.should.have.been.calledOnce;
                });
            });
            it('should emit specific notification event when no commands in post', () => {
                commands.commands = [];
                notifier.type = `a${Math.random()}b`;
                return notifyHandler(5).then(() => {
                    forum.emit.should.have.been.calledWith(`notification:${notifier.type}`, notifier).once;
                });
            });
            it('should not emit specific notification event when commands in post', () => {
                commands.commands = [1, 2, 3];
                notifier.type = `a${Math.random()}b`;
                return notifyHandler(5).then(() => {
                    forum.emit.should.not.have.been.calledWith(`notification:${notifier.type}`, notifier);
                });
            });
            it('should emit general notification event when no commands in post', () => {
                commands.commands = [];
                notifier.type = `a${Math.random()}b`;
                return notifyHandler(5).then(() => {
                    forum.emit.should.have.been.calledWith('notification', notifier).once;
                });
            });
            it('should not emit general notification event when commands in post', () => {
                commands.commands = [1, 2, 3, 4];
                notifier.type = `a${Math.random()}b`;
                return notifyHandler(5).then(() => {
                    forum.emit.should.not.have.been.calledWith('notification', notifier);
                });
            });
        });
    });
});
