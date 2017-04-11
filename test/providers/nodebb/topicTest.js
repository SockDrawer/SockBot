'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.should();

const sinon = require('sinon');
chai.use(require('sinon-chai'));

const topicModule = require('../../../providers/nodebb/topic');
const utils = require('../../../lib/utils');

describe('providers/nodebb/topic', () => {
    it('should export bindTopic()', () => {
        topicModule.bindTopic.should.be.a('function');
    });
    it('should return a class on call to bindTopic()', () => {
        topicModule.bindTopic({}).should.be.a('function');
    });
    describe('Topic', () => {
        const forum = {};
        const Topic = topicModule.bindTopic(forum);
        beforeEach(() => {
            forum._emit = sinon.stub().resolves({});
            forum._emitWithRetry = sinon.stub().resolves({});
        });
        describe('ctor()', () => {
            it('should store instance data in utils.storage', () => {
                const topic = new Topic({});
                utils.mapGet(topic).should.be.ok;
            });
            it('should accept serialized input', () => {
                const topic = new Topic('{}');
                utils.mapGet(topic).should.be.ok;
            });
            [
                ['authorId', 'uid'],
                ['title', 'title'],
                ['url', 'slug'],
                ['id', 'tid'],
                ['categoryId', 'cid'],
                ['mainPostId', 'mainPid'],
                ['postCount', 'postcount']
            ].forEach((keys) => {
                const outKey = keys[0],
                    inKey = keys[1];
                it(`should store ${outKey} in utils.storage`, () => {
                    const expected = `a${Math.random()}b`;
                    const values = {};
                    values[inKey] = expected;
                    const topic = new Topic(values);
                    utils.mapGet(topic, outKey).should.equal(expected);
                });
            });
            it('should parse timestamp for posted', () => {
                const expected = Math.round(Math.random() * (2 << 29));
                const topic = new Topic({
                    timestamp: expected
                });
                utils.mapGet(topic, 'posted').getTime().should.equal(expected);
            });
            it('should parse timestamp for lastPosted', () => {
                const expected = Math.round(Math.random() * (2 << 29));
                const topic = new Topic({
                    lastposttime: expected
                });
                utils.mapGet(topic, 'lastPosted').getTime().should.equal(expected);
            });
        });
        describe('simple getters', () => {
            let topic, data;
            beforeEach(() => {
                topic = new Topic({});
                data = utils.mapGet(topic);
            });
            ['authorId', 'title', 'id', 'mainPostId', 'postCount', 'posted',
                'lastPosted', 'categoryId'
            ].forEach((key) => {
                it(`should get value from utils.storage for ${key}`, () => {
                    const expected = `${Math.random()}${Math.random()}`;
                    data[key] = expected;
                    topic[key].should.equal(expected);
                });
            });
        });
        it('should construct URL correctly', () => {
            forum.url = 'foobar';
            const user = new Topic({
                slug: 'xyyzy'
            });
            return user.url().should.become('foobar/xyyzy');
        });
        describe('reply()', () => {
            let topic, data;
            beforeEach(() => {
                topic = new Topic({});
                data = utils.mapGet(topic);
                forum.Post = {
                    parse: sinon.stub()
                };
            });
            it('should emit `posts.reply` via websocket', () => {
                const id = Math.random();
                data.id = id;
                const content = `a${Math.random()}b${Math.random()}c`;
                return topic.reply(content).then(() => {
                    forum._emitWithRetry.calledWith(10000, 'posts.reply', {
                        tid: id,
                        content: content
                    }).should.be.true;
                });
            });
            it('should reject if websocket rejects', () => {
                forum._emitWithRetry.rejects('bad');
                return topic.reply('foo').should.be.rejected;
            });
            it('should parse results via `forum.Post.parse`', () => {
                return topic.reply('xyyzy').then(() => {
                    forum.Post.parse.should.have.been.calledOnce;
                });
            });
            it('should pass websockets results to `forum.Post.parse`', () => {
                const expected = Math.random();
                forum._emitWithRetry.resolves(expected);
                return topic.reply('xyyzy').then(() => {
                    forum.Post.parse.should.have.been.calledWith(expected).once;
                });
            });
            it('should resolve to results of `forum.Post.parse`', () => {
                const expected = Math.random();
                forum.Post.parse.returns(expected);
                return topic.reply('xyyzy').should.become(expected);
            });
            it('should reject if `forum.Post.parse` throws', () => {
                forum.Post.parse.throws('bad');
                return topic.reply('xyyzy').should.be.rejected;
            });
        });
        describe('getAllPosts()', () => {
            let topic, data;
            beforeEach(() => {
                topic = new Topic({});
                data = utils.mapGet(topic);
                forum.Post = {
                    parse: sinon.stub().returns({})
                };
                forum.User = {
                    parse: sinon.stub().returns({})
                };
                forum._emit.resolves({
                    posts: []
                });
            });
            it('should retrieve posts via `topic.loadMore`', () => {
                data.id = 8675309;
                return topic.getAllPosts(() => Promise.resolve()).then(() => {
                    forum._emit.calledWith('topics.loadMore', {
                        tid: 8675309,
                        after: 0,
                        direction: 1
                    }).should.be.true;
                });
            });
            it('should retrieve more posts via `topic.loadMore`', () => {
                forum._emit.onFirstCall().resolves({
                    posts: [{}, {}, {}, {}, {}]
                });
                data.id = 8675309;
                return topic.getAllPosts(() => Promise.resolve()).then(() => {
                    forum._emit.calledWith('topics.loadMore', {
                        tid: 8675309,
                        after: 0,
                        direction: 1
                    }).should.be.true;
                    forum._emit.calledWith('topics.loadMore', {
                        tid: 8675309,
                        after: 5,
                        direction: 1
                    }).should.be.true;
                });
            });
            it('should reject when websocket call rejects', () => {
                forum._emit.rejects('bad');
                return topic.getAllPosts(() => Promise.resolve()).should.be.rejected;
            });
            it('should reject when iterator rejects', () => {
                forum._emit.resolves({
                    posts: [{}, {}, {}, {}, {}]
                });
                const spy = sinon.stub().resolves();
                spy.onCall(2).rejects('bad');
                return topic.getAllPosts(spy).should.be.rejected;
            });
            it('should pass expected objects to iterator', () => {
                forum._emit.resolves({
                    posts: [{}]
                });
                forum.Post.parse.returns('POST');
                forum.User.parse.returns('USER');
                const spy = sinon.stub().resolves();
                return topic.getAllPosts(spy).then(() => {
                    spy.should.have.been.calledWith('POST', 'USER', topic).once;
                });
            });
        });
        describe('getLatestPosts()', () => {
            let topic, data;
            beforeEach(() => {
                topic = new Topic({});
                data = utils.mapGet(topic);
                forum.Post = {
                    parse: sinon.stub().returns({})
                };
                forum.User = {
                    parse: sinon.stub().returns({})
                };
                forum._emit.resolves({
                    posts: []
                });
            });
            it('should retrieve posts via `topic.loadMore`', () => {
                data.id = 8675309;
                data.postCount = 99;
                return topic.getLatestPosts(() => Promise.resolve()).then(() => {
                    forum._emit.calledWith('topics.loadMore', {
                        tid: 8675309,
                        after: 99,
                        direction: -1
                    }).should.be.true;
                });
            });
            it('should not retrieve more posts via `topic.loadMore`', () => {
                forum._emit.onFirstCall().resolves({
                    posts: [{}, {}, {}, {}, {}]
                });
                data.id = 8675309;
                return topic.getLatestPosts(() => Promise.resolve()).then(() => {
                    forum._emit.callCount.should.equal(1);
                });
            });
            it('should reject when websocket call rejects', () => {
                forum._emit.rejects('bad');
                return topic.getLatestPosts(() => Promise.resolve()).should.be.rejected;
            });
            it('should reject when iterator rejects', () => {
                forum._emit.resolves({
                    posts: [{}, {}, {}, {}, {}]
                });
                const spy = sinon.stub().resolves();
                spy.onCall(2).rejects('bad');
                return topic.getLatestPosts(spy).should.be.rejected;
            });
            it('should pass expected objects to iterator', () => {
                forum._emit.resolves({
                    posts: [{}]
                });
                forum.Post.parse.returns('POST');
                forum.User.parse.returns('USER');
                const spy = sinon.stub().resolves();
                return topic.getLatestPosts(spy).then(() => {
                    spy.should.have.been.calledWith('POST', 'USER', topic).once;
                });
            });
        });
        describe('markRead()', () => {
            let topic, data;
            beforeEach(() => {
                topic = new Topic({});
                data = utils.mapGet(topic);
            });
            it('should emit `topics.bookmark` to bookmark post', () => {
                data.id = Math.random();
                const postNumber = Math.random();
                return topic.markRead(postNumber).then(() => {
                    forum._emit.calledWith('topics.bookmark', {
                        tid: data.id,
                        index: postNumber
                    }).should.be.true;
                });
            });
            it('should reject if websocket rejects message to bookmark post', () => {
                const postNumber = Math.random();
                forum._emit.rejects('bad');
                return topic.markRead(postNumber).should.be.rejected;
            });
            it('should resolve to topic after bookmarking post', () => {
                const postNumber = Math.random();
                return topic.markRead(postNumber).should.become(topic);
            });
            it('should emit `topics.markAsRead` to dismiss topic', () => {
                data.id = Math.random();
                return topic.markRead().then(() => {
                    forum._emit.should.have.been.calledWith('topics.markAsRead', [data.id]).once;
                });
            });
            it('should reject if websocket rejects message for dismissing topic', () => {
                forum._emit.rejects('bad');
                return topic.markRead().should.be.rejected;
            });
            it('should resolve to topic after dismissing topic', () => {
                return topic.markRead().should.become(topic);
            });
        });
        describe('watch()', () => {
            let topic, tid;
            beforeEach(() => {
                tid = Math.random();
                topic = new Topic({
                    tid: tid
                });
            });
            it('should emit `topics.follow`', () => {
                return topic.watch().then(() => {
                    forum._emit.should.have.been.calledWith('topics.follow', tid).once;
                });
            });
            it('should resolve to watched topic', () => {
                return topic.watch().should.become(topic);
            });
            it('should reject if websocket rejects', () => {
                forum._emit.rejects('bad');
                return topic.watch().should.be.rejected;
            });
        });
        describe('unwatch()', () => {
            let topic, tid;
            beforeEach(() => {
                tid = Math.random();
                topic = new Topic({
                    tid: tid
                });
            });
            it('should emit `topics.toggleFollow`', () => {
                return topic.unwatch().then(() => {
                    forum._emit.should.have.been.calledWith('topics.toggleFollow', tid).once;
                });
            });
            it('should emit `topics.toggleFollow` twice if first emit follows topic.', () => {
                forum._emit.resolves(true);
                return topic.unwatch().then(() => {
                    forum._emit.callCount.should.equal(2);
                });
            });
            it('should emit `topics.toggleFollow` once if first emit unfollows topic.', () => {
                forum._emit.resolves(false);
                return topic.unwatch().then(() => {
                    forum._emit.callCount.should.equal(1);
                });
            });
            it('should resolve to watched topic', () => {
                return topic.unwatch().should.become(topic);
            });
            it('should reject if websocket rejects', () => {
                forum._emit.rejects('bad');
                return topic.unwatch().should.be.rejected;
            });
        });
        describe('mute', () => {
            it('should be a stub that resolves to self', () => {
                const topic = new Topic({});
                return topic.mute().should.become(topic);
            });
        });
        describe('unmute', () => {
            it('should be a stub that resolves to self', () => {
                const topic = new Topic({});
                return topic.unmute().should.become(topic);
            });
        });
        describe('lock()', () => {
            let topic, data;
            beforeEach(() => {
                topic = new Topic({});
                data = utils.mapGet(topic);
            });
            it('should emit `topics.lock` via websocket', () => {
                const id = Math.random();
                const cid = Math.random();
                data.id = id;
                data.categoryId = cid;
                return topic.lock().then(() => {
                    forum._emit.calledWith('topics.lock', {
                        tids: [id],
                        cid: cid
                    }).should.be.true;
                });
            });
            it('should resolve to locked topic', () => {
                return topic.lock().should.become(topic);
            });
            it('should reject if websocket rejects', () => {
                forum._emit.rejects('bad');
                return topic.lock().should.be.rejected;
            });
        });
        describe('unlock()', () => {
            let topic, data;
            beforeEach(() => {
                topic = new Topic({});
                data = utils.mapGet(topic);
            });
            it('should emit `topics.unlock` via websocket', () => {
                const id = Math.random();
                const cid = Math.random();
                data.id = id;
                data.categoryId = cid;
                return topic.unlock().then(() => {
                    forum._emit.calledWith('topics.unlock', {
                        tids: [id],
                        cid: cid
                    }).should.be.true;
                });
            });
            it('should resolve to locked topic', () => {
                return topic.unlock().should.become(topic);
            });
            it('should reject if websocket rejects', () => {
                forum._emit.rejects('bad');
                return topic.unlock().should.be.rejected;
            });
        });
        describe('static functions', () => {
            describe('static getRecentTopics()', () => {
                let spy = () => 0;
                beforeEach(() => {
                    forum.Topic = {
                        parse: sinon.stub()
                    };
                    forum.User = {
                        parse: sinon.stub()
                    };
                    forum.Category = {
                        parse: sinon.stub()
                    };
                    spy = sinon.stub().resolves();
                });
                it('should retrieve topics via `topics.loadMoreFromSet`', () => {
                    return Topic.getRecentTopics(spy).then(() => {
                        forum._emit.calledWith('topics.loadMoreFromSet', {
                            after: 0,
                            set: 'topics:recent'
                        }).should.be.true;
                    });
                });
                it('should retrieve additional topics via `topics.loadMoreFromSet`', () => {
                    forum._emit.onFirstCall().resolves({
                        topics: [{}, {}, {}]
                    });
                    return Topic.getRecentTopics(spy).then(() => {
                        forum._emit.calledWith('topics.loadMoreFromSet', {
                            after: 0,
                            set: 'topics:recent'
                        }).should.be.true;
                        forum._emit.calledWith('topics.loadMoreFromSet', {
                            after: 3,
                            set: 'topics:recent'
                        }).should.be.true;
                    });
                });
                it('should abort successfully when websocket does not return topics', () => {
                    return Topic.getRecentTopics(spy).then(() => {
                        spy.should.not.have.been.called;
                    });
                });
                it('should abort successfully when websocket returns zero topics', () => {
                    forum._emit.resolves({
                        topics: []
                    });
                    return Topic.getRecentTopics(spy).then(() => {
                        spy.should.not.have.been.called;
                    });
                });
                it('should reject when websocket rejects', () => {
                    forum._emit.rejects('bad');
                    return Topic.getRecentTopics(spy).should.be.rejected;
                });
                it('should iterate through topics by calling eachTopic progress fn', () => {
                    forum._emit.onFirstCall().resolves({
                        topics: [{}, {}, {}]
                    });
                    return Topic.getRecentTopics(spy).then(() => {
                        spy.callCount.should.equal(3);
                    });
                });
                it('should reject when progress fn rejects', () => {
                    forum._emit.onFirstCall().resolves({
                        topics: [{}, {}, {}]
                    });
                    spy.onCall(1).rejects('bad');
                    return Topic.getRecentTopics(spy).should.be.rejected;
                });
                it('should pass expected values to progress fn', () => {
                    forum._emit.onFirstCall().resolves({
                        topics: [{}]
                    });
                    forum.Topic.parse.returns('TOPIC');
                    forum.User.parse.returns('USER');
                    forum.Category.parse.returns('CATEGORY');
                    return Topic.getRecentTopics(spy).then(() => {
                        spy.should.have.been.calledWith('TOPIC', 'USER', 'CATEGORY').once;
                    });
                });
                it('should pass expected values to Topic.parse()', () => {
                    const expected = {};
                    forum._emit.onFirstCall().resolves({
                        topics: [expected]
                    });
                    return Topic.getRecentTopics(spy).then(() => {
                        forum.Topic.parse.should.have.been.calledWith(expected).once;
                    });
                });
                it('should pass expected values to User.parse()', () => {
                    const expected = {};
                    forum._emit.onFirstCall().resolves({
                        topics: [{
                            user: expected
                        }]
                    });
                    return Topic.getRecentTopics(spy).then(() => {
                        forum.User.parse.should.have.been.calledWith(expected).once;
                    });
                });
                it('should pass expected values to Category.parse()', () => {
                    const expected = {};
                    forum._emit.onFirstCall().resolves({
                        topics: [{
                            category: expected
                        }]
                    });
                    return Topic.getRecentTopics(spy).then(() => {
                        forum.Category.parse.should.have.been.calledWith(expected).once;
                    });
                });
            });
            describe('static getUnreadTopics()', () => {
                let spy = () => 0;
                beforeEach(() => {
                    forum.Topic = {
                        parse: sinon.stub()
                    };
                    forum.User = {
                        parse: sinon.stub()
                    };
                    forum.Category = {
                        parse: sinon.stub()
                    };
                    spy = sinon.stub().resolves();
                });
                it('should retrieve topics via `topics.loadMoreUnreadTopics`', () => {
                    return Topic.getUnreadTopics(spy).then(() => {
                        forum._emit.calledWith('topics.loadMoreUnreadTopics', {
                            after: 0
                        }).should.be.true;
                    });
                });
                it('should retrieve additional topics via `topics.loadMoreUnreadTopics`', () => {
                    forum._emit.onFirstCall().resolves({
                        topics: [{}, {}, {}]
                    });
                    return Topic.getUnreadTopics(spy).then(() => {

                        forum._emit.calledWith('topics.loadMoreUnreadTopics', {
                            after: 0
                        }).should.be.true;
                        forum._emit.calledWith('topics.loadMoreUnreadTopics', {
                            after: 3
                        }).should.be.true;
                    });
                });
                it('should abort successfully when websocket does not return topics', () => {
                    return Topic.getUnreadTopics(spy).then(() => {
                        spy.should.not.have.been.called;
                    });
                });
                it('should abort successfully when websocket returns zero topics', () => {
                    forum._emit.resolves({
                        topics: []
                    });
                    return Topic.getUnreadTopics(spy).then(() => {
                        spy.should.not.have.been.called;
                    });
                });
                it('should reject when websocket rejects', () => {
                    forum._emit.rejects('bad');
                    return Topic.getUnreadTopics(spy).should.be.rejected;
                });
                it('should iterate through topics by calling eachTopic progress fn', () => {
                    forum._emit.onFirstCall().resolves({
                        topics: [{}, {}, {}]
                    });
                    return Topic.getUnreadTopics(spy).then(() => {
                        spy.callCount.should.equal(3);
                    });
                });
                it('should reject when progress fn rejects', () => {
                    forum._emit.onFirstCall().resolves({
                        topics: [{}, {}, {}]
                    });
                    spy.onCall(1).rejects('bad');
                    return Topic.getUnreadTopics(spy).should.be.rejected;
                });
                it('should pass expected values to progress fn', () => {
                    forum._emit.onFirstCall().resolves({
                        topics: [{}]
                    });
                    forum.Topic.parse.returns('TOPIC');
                    forum.User.parse.returns('USER');
                    forum.Category.parse.returns('CATEGORY');
                    return Topic.getUnreadTopics(spy).then(() => {
                        spy.should.have.been.calledWith('TOPIC', 'USER', 'CATEGORY').once;
                    });
                });
                it('should pass expected values to Topic.parse()', () => {
                    const expected = {};
                    forum._emit.onFirstCall().resolves({
                        topics: [expected]
                    });
                    return Topic.getUnreadTopics(spy).then(() => {
                        forum.Topic.parse.should.have.been.calledWith(expected).once;
                    });
                });
                it('should pass expected values to User.parse()', () => {
                    const expected = {};
                    forum._emit.onFirstCall().resolves({
                        topics: [{
                            user: expected
                        }]
                    });
                    return Topic.getUnreadTopics(spy).then(() => {
                        forum.User.parse.should.have.been.calledWith(expected).once;
                    });
                });
                it('should pass expected values to Category.parse()', () => {
                    const expected = {};
                    forum._emit.onFirstCall().resolves({
                        topics: [{
                            category: expected
                        }]
                    });
                    return Topic.getUnreadTopics(spy).then(() => {
                        forum.Category.parse.should.have.been.calledWith(expected).once;
                    });
                });
            });
            describe('static get()', () => {
                let sandbox = {};
                beforeEach(() => {
                    sandbox = sinon.sandbox.create();
                    sandbox.stub(Topic, 'parse');
                });
                afterEach(() => sandbox.restore());
                it('should emit `topics.getTopic', () => {
                    const id = Math.random();
                    return Topic.get(id).then(() => {
                        forum._emit.should.have.been.calledWith('topics.getTopic', id).once;
                    });
                });
                it('should reject if websocket rejects', () => {
                    forum._emit.rejects('bad');
                    return Topic.get(8472).should.be.rejected;
                });
                it('should parse results with Topic.parse()', () => {
                    const expected = Math.random();
                    forum._emit.resolves(expected);
                    return Topic.get(8472).then(() => {
                        Topic.parse.should.have.been.calledWith(expected).once;
                    });
                });
                it('should resolve to return value of Topic.parse()', () => {
                    const expected = Math.random();
                    Topic.parse.resolves(expected);
                    return Topic.get(8472).should.become(expected);
                });
            });
            describe('static parse()', () => {
                it('should throw error on falsy payload', () => {
                    chai.expect(() => Topic.parse()).to.throw('E_TOPIC_NOT_FOUND');
                });
                it('should store instance data in utils.storage', () => {
                    const topic = Topic.parse({});
                    utils.mapGet(topic).should.be.ok;
                });
                it('should accept serialized input', () => {
                    const topic = Topic.parse('{}');
                    utils.mapGet(topic).should.be.ok;
                });
                [
                    ['authorId', 'uid'],
                    ['title', 'title'],
                    ['url', 'slug'],
                    ['id', 'tid'],
                    ['mainPostId', 'mainPid'],
                    ['postCount', 'postcount']
                ].forEach((keys) => {
                    const outKey = keys[0],
                        inKey = keys[1];
                    it(`should store ${outKey} in utils.storage`, () => {
                        const expected = `a${Math.random()}b`;
                        const values = {};
                        values[inKey] = expected;
                        const topic = Topic.parse(values);
                        utils.mapGet(topic, outKey).should.equal(expected);
                    });
                });
                it('should parse timestamp for posted', () => {
                    const expected = Math.round(Math.random() * (2 << 29));
                    const topic = Topic.parse({
                        timestamp: expected
                    });
                    utils.mapGet(topic, 'posted').getTime().should.equal(expected);
                });
                it('should parse timestamp for lastPosted', () => {
                    const expected = Math.round(Math.random() * (2 << 29));
                    const topic = Topic.parse({
                        lastposttime: expected
                    });
                    utils.mapGet(topic, 'lastPosted').getTime().should.equal(expected);
                });
            });
        });
    });
});
