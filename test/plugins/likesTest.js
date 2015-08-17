'use strict';
/*globals describe, it, beforeEach, afterEach*/

const chai = require('chai'),
    sinon = require('sinon'),
    async = require('async');
chai.should();
const expect = chai.expect;

// The thing we're testing
const likes = require('../../plugins/likes'),
    utils = require('../../lib/utils');
const dummyCfg = {
    mergeObjects: utils.mergeObjects
};

describe('likes plugin', () => {
    describe('exports', () => {
        it('should export prepare()', () => expect(likes.prepare).to.be.a('function'));
        it('should export start()', () => expect(likes.start).to.be.a('function'));
        it('should export stop()', () => expect(likes.stop).to.be.a('function'));
        it('should export binge()', () => expect(likes.binge).to.be.a('function'));
        it('should export handlePost()', () => expect(likes.handlePost).to.be.a('function'));
        it('should export messageHandler()', () => expect(likes.messageHandler).to.be.a('function'));
        it('should export defaultConfig()', () => expect(likes.defaultConfig).to.be.an('object'));
        it('should export internals()', () => expect(likes.internals).to.be.an('object'));
    });
    describe('prepare()', () => {
        it('should set browser', () => {
            const browser = {};
            likes.prepare({}, dummyCfg, {
                onTopic: () => 0
            }, browser);
            likes.internals.browser.should.equal(browser);
        });
        it('should use default config if config is not object', () => {
            likes.prepare(true, dummyCfg, {
                onTopic: () => 0
            }, null);
            likes.internals.config.should.not.equal(likes.defaultConfig);
            likes.internals.config.should.deep.equal(likes.defaultConfig);
        });
        it('should merge configs if config is object', () => {
            likes.prepare({
                a: 1
            }, dummyCfg, {
                onTopic: () => 0
            }, null);
            const expected = {
                a: 1,
                binge: false,
                bingeCap: 500,
                topics: [1000],
                delay: 15000,
                scatter: 5000
            };
            likes.internals.config.should.deep.equal(expected);
        });
        it('should register for messages from topics', () => {
            const spy = sinon.spy();
            likes.prepare({
                topics: [3, 5, 17]
            }, dummyCfg, {
                onTopic: spy
            }, null);
            spy.calledWith(3, likes.messageHandler).should.be.true;
            spy.calledWith(5, likes.messageHandler).should.be.true;
            spy.calledWith(17, likes.messageHandler).should.be.true;
        });

        it('should store events object in internals', () => {
            const events = {
                onTopic: () => 0
            };
            likes.prepare(true, dummyCfg, events, undefined);
            likes.internals.events.should.equal(events);
        });
    });
    describe('start()', () => {
        let sandbox;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(global, 'setInterval');
        });
        afterEach(() => sandbox.restore());
        it('should set interval for binge if config binge selected', () => {
            likes.internals.config.binge = true;
            likes.start();
            setInterval.calledWith(likes.binge, 24 * 60 * 60 * 1000).should.be.true;
        });
        it('should not set interval for binge if config binge unselected', () => {
            likes.internals.config.binge = false;
            likes.start();
            setInterval.calledWith(likes.binge, 24 * 60 * 60 * 1000).should.be.false;
        });
        it('should save interval token for later if config binge selected', () => {
            const token = Math.random();
            setInterval.returns(token);
            likes.internals.config.binge = true;
            likes.start();
            likes.internals.bingeInterval.should.equal(token);
        });
        it('should save interval token for later if config binge unselected', () => {
            const token = Math.random();
            setInterval.returns(null);
            likes.internals.bingeInterval = token;
            likes.internals.config.binge = false;
            likes.start();
            likes.internals.bingeInterval.should.equal(token);
        });
    });
    describe('stop()', () => {
        let sandbox;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(global, 'clearInterval');
        });
        afterEach(() => sandbox.restore());
        it('should remove interval if saved interval exists', () => {
            const token = Math.random();
            likes.internals.bingeInterval = token;
            likes.stop();
            clearInterval.calledWith(token).should.be.true;
        });
        it('should not remove interval if no saved interval exists', () => {
            likes.internals.bingeInterval = null;
            likes.stop();
            clearInterval.called.should.be.false;
        });
    });
    describe('messageHandler()', () => {
        let sandbox, events;
        beforeEach(() => {
            events = {
                emit: sinon.spy()
            };
            sandbox = sinon.sandbox.create();
            sandbox.spy(Math, 'random');
            sandbox.stub(global, 'setTimeout');
            likes.internals.events = events;
        });
        afterEach(() => sandbox.restore());
        it('should abort if message is not a create message', () => {
            likes.messageHandler({});
            setTimeout.called.should.be.false;
        });
        it('should randomize delay for likes', () => {
            likes.messageHandler({
                type: 'created'
            });
            const delay = Math.ceil(likes.internals.config.delay +
                Math.random.firstCall.returnValue * likes.internals.config.scatter);
            setTimeout.firstCall.args[1].should.equal(delay);
        });
        it('should activate postAction for the created post', () => {
            const id = Math.random(),
                spy = sinon.stub();
            spy.yields(null);
            setTimeout.callsArg(0);
            likes.internals.browser = {
                postAction: spy
            };
            likes.messageHandler({
                type: 'created'
            }, undefined, {
                id: id
            });
            spy.calledWith('like', id, '').should.be.true;
        });
        it('should log message when liking post', () => {
            const spy = sinon.stub();
            setTimeout.callsArg(0);
            likes.internals.browser = {
                postAction: spy
            };
            likes.messageHandler({
                type: 'created'
            }, undefined, {
                'topic_id': 314,
                'post_number': 159,
                username: 'quux'
            });
            events.emit.calledWith('logMessage', 'Liking Post /t/314/159 by @quux').should.be.true;
        });
    });
    describe('binge()', () => {
        let sandbox, browserSpy, events;
        beforeEach(() => {
            browserSpy = sinon.spy();
            sandbox = sinon.sandbox.create();
            sandbox.stub(utils, 'log');
            sandbox.stub(async, 'eachSeries');
            likes.internals.browser = {
                getPosts: browserSpy
            };

            events = {
                emit: sinon.spy()
            };
            likes.internals.events = events;
        });
        afterEach(() => sandbox.restore());
        it('should reset likeCount', () => {
            likes.internals.likeCount = null;
            likes.binge();
            likes.internals.likeCount.should.equal(0);
        });
        it('should log binge begin', () => {
            likes.binge();
            events.emit.calledWith('logMessage', 'Beginning Like Binge').should.be.true;
        });
        it('should call async.eachSeries with topic list', () => {
            likes.internals.config.topics = [1, 2, 3];
            likes.binge();
            async.eachSeries.firstCall.args[0].should.equal(likes.internals.config.topics);
        });
        it('async.eachSeries completed callback should log completion', () => {
            async.eachSeries.callsArgWith(2, 'this is the message');
            likes.binge();
            events.emit.calledWith('logMessage', 'Like Binge Completed: this is the message').should.be.true;
        });
        it('async.eachSeries eachCallback should call browser.getPosts', () => {
            const topicId = Math.random(),
                next = Math.random();
            async.eachSeries.callsArgWith(1, topicId, next);
            likes.binge();
            browserSpy.calledWith(topicId, likes.handlePost, next).should.be.true;
        });
    });
    describe('handlePost()', () => {
        let sandbox, browserSpy, spy;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.useFakeTimers();
            browserSpy = sinon.stub();
            spy = sinon.spy();
            likes.internals.browser = {
                postAction: browserSpy
            };
        });
        afterEach(() => sandbox.restore());
        it('should bypass post if already liked', () => {
            likes.handlePost({
                'actions_summary': [{
                    id: 2,
                    'can_act': false
                }]
            }, spy);
            spy.firstCall.args.should.have.length(0);
        });
        it('should bypass post if no liked action exists', () => {
            likes.handlePost({
                'actions_summary': [{
                    id: 3,
                    'can_act': false
                }]
            }, spy);
            spy.firstCall.args.should.have.length(0);
        });
        it('should like post if likeable', () => {
            const id = Math.random();
            likes.handlePost({
                id: id,
                'actions_summary': [{
                    id: 2,
                    'can_act': true
                }]
            }, spy);
            browserSpy.calledWith('like', id, '').should.be.true;
        });
        it('should pass error onto callback on like failure', () => {
            browserSpy.yields('this is error');
            likes.handlePost({
                id: 1,
                'actions_summary': [{
                    id: 2,
                    'can_act': true
                }]
            }, spy);
            spy.calledWith('this is error').should.be.true;
        });
        it('should increment like count on success', () => {
            browserSpy.yields(null);
            likes.internals.likeCount = 0;
            likes.handlePost({
                id: 1,
                'actions_summary': [{
                    id: 2,
                    'can_act': true
                }]
            }, spy);
            likes.internals.likeCount.should.equal(1);
        });
        it('should pass error onto callback on successfull like that exceeds bingeCap', () => {
            browserSpy.yields(null);
            likes.internals.likeCount = 10;
            likes.internals.config.bingeCap = 10;
            likes.handlePost({
                id: 1,
                'actions_summary': [{
                    id: 2,
                    'can_act': true
                }]
            }, spy);
            spy.calledWith('Like Binge Limit Reached').should.be.true;
        });
        it('should delay callback on success to prevent accidental server DOS', () => {
            browserSpy.yields(null);
            likes.internals.likeCount = 0;
            likes.internals.config.bingeCap = 10;
            likes.handlePost({
                id: 1,
                'actions_summary': [{
                    id: 2,
                    'can_act': true
                }]
            }, spy);
            sandbox.clock.tick(999);
            spy.called.should.be.false;
            sandbox.clock.tick(1);
            spy.called.should.be.true;
        });
    });
});
