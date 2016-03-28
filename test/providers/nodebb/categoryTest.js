'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.should();

const sinon = require('sinon');
require('sinon-as-promised');

const categoryModule = require('../../../providers/nodebb/category');
const utils = require('../../../lib/utils');

describe('providers/nodebb/categor', () => {
    it('should export bindCategory()', () => {
        categoryModule.bindCategory.should.be.a('function');
    });
    it('should return a class on call to bindCategory()', () => {
        categoryModule.bindCategory({}).should.be.a('function');
    });
    describe('Category', () => {
        const forum = {};
        const Category = categoryModule.bindCategory(forum);
        beforeEach(() => {
            forum._emit = sinon.stub().resolves();
            forum.fetchObject = sinon.stub().resolves();
        });
        describe('ctor()', () => {
            it('should store instance data in utils.storage', () => {
                const category = new Category({});
                utils.mapGet(category).should.be.ok;
            });
            it('should accept serialized input', () => {
                const category = new Category('{}');
                utils.mapGet(category).should.be.ok;
            });
            [
                ['id', 'cid'],
                ['name', 'name'],
                ['description', 'description'],
                ['url', 'slug'],
                ['parentId', 'parentCid'],
                ['topicCount', 'topic_count'],
                ['postCount', 'post_count'],
                ['recentPosts', 'numRecentReplies']
            ].forEach((keys) => {
                const outKey = keys[0],
                    inKey = keys[1];
                it(`should store ${outKey} in utils.storage`, () => {
                    const expected = `a${Math.random()}b`;
                    const values = {};
                    values[inKey] = expected;
                    const category = new Category(values);
                    utils.mapGet(category, outKey).should.equal(expected);
                });
            });
        });
        describe('simple getters', () => {
            let category, data;
            beforeEach(() => {
                category = new Category({});
                data = utils.mapGet(category);
            });
            ['id', 'name', 'description', 'parentId', 'topicCount',
                'postCount', 'recentPosts'
            ].forEach((key) => {
                it(`should get value from utils.storage for ${key}`, () => {
                    const expected = `${Math.random()}${Math.random()}`;
                    data[key] = expected;
                    category[key].should.equal(expected);
                });
            });
        });
        describe('url()', () => {
            let category, data;
            beforeEach(() => {
                category = new Category({});
                data = utils.mapGet(category);
            });
            it('should resolve to expected value', () => {
                const partA = `a${Math.random()}b`,
                    partB = `c${Math.random()}d`,
                    expected = `${partA}/category/${partB}`;
                forum.url = partA;
                data.url = partB;
                return category.url().should.become(expected);
            });
        });
        describe('getAllTopics()', () => {
            let category, data, spy;
            beforeEach(() => {
                category = new Category({});
                data = utils.mapGet(category);
                spy = sinon.stub().resolves();
                forum._emit.resolves({});
                forum.Topic = {
                    parse: sinon.stub()
                };
                forum.Category = {
                    parse: sinon.stub()
                };
                forum.User = {
                    parse: sinon.stub()
                };
            });
            it('should load topics via websocket `categories.loadMore`', () => {
                const expected = Math.random();
                data.id = expected;
                return category.getAllTopics(spy).then(() => {
                    forum._emit.calledWith('categories.loadMore', {
                        cid: expected,
                        after: 0,
                        direction: 1
                    }).should.be.true;
                });
            });
            it('should additional topics via websocket `categories.loadMore`', () => {
                data.id = Math.random();
                const expected = Math.random();
                forum._emit.onFirstCall().resolves({
                    topics: [1],
                    nextStart: expected
                });
                return category.getAllTopics(spy).then(() => {
                    forum._emit.calledWith('categories.loadMore', {
                        cid: data.id,
                        after: expected,
                        direction: 1
                    }).should.be.true;
                });
            });
            it('should not call progress fn with no results', () => {
                return category.getAllTopics(spy).then(() => {
                    spy.called.should.be.false;
                });
            });
            it('should not call progress fn with empty results', () => {
                forum._emit.resolves({
                    topics: []
                });
                return category.getAllTopics(spy).then(() => {
                    spy.called.should.be.false;
                });
            });
            it('should call progress fn for each loaded topic', () => {
                forum._emit.onFirstCall().resolves({
                    topics: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                });
                return category.getAllTopics(spy).then(() => {
                    spy.callCount.should.equal(10);
                });
            });
            it('should parse topic with `forum.Topic.parse`', () => {
                const expected = Math.random();
                forum._emit.onFirstCall().resolves({
                    topics: [expected]
                });
                return category.getAllTopics(spy).then(() => {
                    forum.Topic.parse.calledWith(expected).should.be.true;
                });
            });
            it('should parse category with `forum.Category.parse`', () => {
                const expected = Math.random();
                forum._emit.onFirstCall().resolves({
                    topics: [{
                        category: expected
                    }]
                });
                return category.getAllTopics(spy).then(() => {
                    forum.Category.parse.calledWith(expected).should.be.true;
                });
            });
            it('should parse user with `forum.User.parse`', () => {
                const expected = Math.random();
                forum._emit.onFirstCall().resolves({
                    topics: [{
                        user: expected
                    }]
                });
                return category.getAllTopics(spy).then(() => {
                    forum.User.parse.calledWith(expected).should.be.true;
                });
            });
            it('should pass expected values to progress fn', () => {
                forum._emit.onFirstCall().resolves({
                    topics: [1]
                });
                const topic = Math.random();
                forum.Topic.parse.returns(topic);
                const categoryval = Math.random();
                forum.Category.parse.returns(categoryval);
                const user = Math.random();
                forum.User.parse.returns(user);
                return category.getAllTopics(spy).then(() => {
                    spy.calledWith(topic, user, categoryval).should.be.true;
                });
            });
            describe('promise behavior', () => {
                it('should reject when websocket rejects', () => {
                    forum._emit.rejects('bad');
                    return category.getAllTopics(spy).should.be.rejected;
                });
                it('should reject when Topic.parse throws', () => {
                    forum._emit.onFirstCall().resolves({
                        topics: [1]
                    });
                    forum.Topic.parse.throws('bad');
                    return category.getAllTopics(spy).should.be.rejected;
                });
                it('should reject when Category.parse throws', () => {
                    forum._emit.onFirstCall().resolves({
                        topics: [1]
                    });
                    forum.Category.parse.throws('bad');
                    return category.getAllTopics(spy).should.be.rejected;
                });
                it('should reject when User.parse throws', () => {
                    forum._emit.onFirstCall().resolves({
                        topics: [1]
                    });
                    forum.User.parse.throws('bad');
                    return category.getAllTopics(spy).should.be.rejected;
                });
                it('should reject when progress fn rejects', () => {
                    forum._emit.onFirstCall().resolves({
                        topics: [1]
                    });
                    spy.rejects('bad');
                    return category.getAllTopics(spy).should.be.rejected;
                });
                it('should resolve to self', () => {
                    return category.getAllTopics(spy).should.become(category);
                });
            });
        });
        describe('getRecentTopics()', () => {
            let category, data, spy;
            beforeEach(() => {
                category = new Category({});
                data = utils.mapGet(category);
                spy = sinon.stub().resolves();
                forum._emit.resolves({});
                forum.Topic = {
                    parse: sinon.stub()
                };
                forum.Category = {
                    parse: sinon.stub()
                };
                forum.User = {
                    parse: sinon.stub()
                };
            });
            it('should load topics via websocket `categories.loadMore`', () => {
                const expected = Math.random();
                data.id = expected;
                return category.getRecentTopics(spy).then(() => {
                    forum._emit.calledWith('categories.loadMore', {
                        cid: expected,
                        after: 0,
                        direction: 1
                    }).should.be.true;
                });
            });
            it('should not get additional topics via websocket `categories.loadMore`', () => {
                data.id = Math.random();
                const expected = Math.random();
                forum._emit.onFirstCall().resolves({
                    topics: [1],
                    nextStart: expected
                });
                return category.getRecentTopics(spy).then(() => {
                    forum._emit.calledWith('categories.loadMore', {
                        cid: data.id,
                        after: expected,
                        direction: 1
                    }).should.be.false;
                });
            });
            it('should not call progress fn with no results', () => {
                return category.getRecentTopics(spy).then(() => {
                    spy.called.should.be.false;
                });
            });
            it('should not call progress fn with empty results', () => {
                forum._emit.resolves({
                    topics: []
                });
                return category.getRecentTopics(spy).then(() => {
                    spy.called.should.be.false;
                });
            });
            it('should call progress fn for each loaded topic', () => {
                forum._emit.onFirstCall().resolves({
                    topics: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                });
                return category.getRecentTopics(spy).then(() => {
                    spy.callCount.should.equal(10);
                });
            });
            it('should parse topic with `forum.Topic.parse`', () => {
                const expected = Math.random();
                forum._emit.onFirstCall().resolves({
                    topics: [expected]
                });
                return category.getRecentTopics(spy).then(() => {
                    forum.Topic.parse.calledWith(expected).should.be.true;
                });
            });
            it('should parse category with `forum.Category.parse`', () => {
                const expected = Math.random();
                forum._emit.onFirstCall().resolves({
                    topics: [{
                        category: expected
                    }]
                });
                return category.getRecentTopics(spy).then(() => {
                    forum.Category.parse.calledWith(expected).should.be.true;
                });
            });
            it('should parse user with `forum.User.parse`', () => {
                const expected = Math.random();
                forum._emit.onFirstCall().resolves({
                    topics: [{
                        user: expected
                    }]
                });
                return category.getRecentTopics(spy).then(() => {
                    forum.User.parse.calledWith(expected).should.be.true;
                });
            });
            it('should pass expected values to progress fn', () => {
                forum._emit.onFirstCall().resolves({
                    topics: [1]
                });
                const topic = Math.random();
                forum.Topic.parse.returns(topic);
                const categoryval = Math.random();
                forum.Category.parse.returns(categoryval);
                const user = Math.random();
                forum.User.parse.returns(user);
                return category.getRecentTopics(spy).then(() => {
                    spy.calledWith(topic, user, categoryval).should.be.true;
                });
            });
            describe('promise behavior', () => {
                it('should reject when websocket rejects', () => {
                    forum._emit.rejects('bad');
                    return category.getRecentTopics(spy).should.be.rejected;
                });
                it('should reject when Topic.parse throws', () => {
                    forum._emit.onFirstCall().resolves({
                        topics: [1]
                    });
                    forum.Topic.parse.throws('bad');
                    return category.getRecentTopics(spy).should.be.rejected;
                });
                it('should reject when Category.parse throws', () => {
                    forum._emit.onFirstCall().resolves({
                        topics: [1]
                    });
                    forum.Category.parse.throws('bad');
                    return category.getRecentTopics(spy).should.be.rejected;
                });
                it('should reject when User.parse throws', () => {
                    forum._emit.onFirstCall().resolves({
                        topics: [1]
                    });
                    forum.User.parse.throws('bad');
                    return category.getRecentTopics(spy).should.be.rejected;
                });
                it('should reject when progress fn rejects', () => {
                    forum._emit.onFirstCall().resolves({
                        topics: [1]
                    });
                    spy.rejects('bad');
                    return category.getRecentTopics(spy).should.be.rejected;
                });
                it('should resolve to self', () => {
                    return category.getRecentTopics(spy).should.become(category);
                });
            });
        });
        describe('watch()', () => {
            let category, data;
            beforeEach(() => {
                category = new Category({});
                data = utils.mapGet(category);
            });
            it('should emit `categories.watch`', () => {
                return category.watch().then(() => {
                    forum._emit.calledWith('categories.watch').should.be.true;
                });
            });
            it('should pass cid to `categories.watch`', () => {
                data.id = Math.random();
                return category.watch().then(() => {
                    forum._emit.calledWith('categories.watch', {
                        cid: data.id
                    }).should.be.true;
                });
            });
            it('should resolve to self', () => {
                return category.watch().should.become(category);
            });
            it('should reject when wqebsocket rejects', () => {
                forum._emit.rejects('bad');
                return category.watch().should.be.rejected;
            });
        });
        describe('unwatch()', () => {
            let category, data;
            beforeEach(() => {
                category = new Category({});
                data = utils.mapGet(category);
            });
            it('should emit `categories.ignore`', () => {
                return category.unwatch().then(() => {
                    forum._emit.calledWith('categories.ignore').should.be.true;
                });
            });
            it('should pass cid to `categories.ignore`', () => {
                data.id = Math.random();
                return category.unwatch().then(() => {
                    forum._emit.calledWith('categories.ignore', {
                        cid: data.id
                    }).should.be.true;
                });
            });
            it('should resolve to self', () => {
                return category.unwatch().should.become(category);
            });
            it('should reject when wqebsocket rejects', () => {
                forum._emit.rejects('bad');
                return category.unwatch().should.be.rejected;
            });
        });
        describe('mute() stubs', () => {
            let category;
            beforeEach(() => {
                category = new Category({});
            });
            it('should noop mute()', () => {
                return category.mute().should.become(category);
            });
            it('should noop unmute()', () => {
                return category.unmute().should.become(category);
            });
        });
        describe('static get()', () => {
            it('should load via function `categories.getCategory`', () => {
                const expected = Math.random();
                return Category.get(expected).then(() => {
                    forum.fetchObject.calledWith('categories.getCategory', expected, Category.parse).should.be.true;
                });
            });
            it('should resolve to result of forum.fetchObject()', () => {
                const expected = Math.random();
                forum.fetchObject.resolves(expected);
                return Category.get(5).should.become(expected);
            });
            it('should reject when websocket rejects', () => {
                forum.fetchObject.rejects('bad');
                return Category.get(5).should.be.rejected;
            });
        });
        describe('static parse()', () => {
            it('should store instance data in utils.storage', () => {
                const category = Category.parse({});
                utils.mapGet(category).should.be.ok;
            });
            it('should accept serialized input', () => {
                const category = Category.parse('{}');
                utils.mapGet(category).should.be.ok;
            });
            [
                ['id', 'cid'],
                ['name', 'name'],
                ['description', 'description'],
                ['url', 'slug'],
                ['parentId', 'parentCid'],
                ['topicCount', 'topic_count'],
                ['postCount', 'post_count'],
                ['recentPosts', 'numRecentReplies']
            ].forEach((keys) => {
                const outKey = keys[0],
                    inKey = keys[1];
                it(`should store ${outKey} in utils.storage`, () => {
                    const expected = `a${Math.random()}b`;
                    const values = {};
                    values[inKey] = expected;
                    const category = Category.parse(values);
                    utils.mapGet(category, outKey).should.equal(expected);
                });
            });
        });
    });
});
