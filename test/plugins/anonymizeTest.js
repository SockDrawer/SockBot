'use strict';
/*globals describe, it, beforeEach, afterEach*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon');
chai.should();
const expect = chai.expect;

const anonymize = require('../../plugins/anonymize'),
    browserModule = require('../../lib/browser');
const browser = browserModule();

const dummyCfg = {
        forum: 'forumUrl'
    };

describe('anonymize', () => {
    it('should export prepare()', () => {
        expect(anonymize.prepare).to.be.a('function');
    });
    it('should export start()', () => {
        expect(anonymize.start).to.be.a('function');
    });
    it('should export stop()', () => {
        expect(anonymize.stop).to.be.a('function');
    });
    it('should export handler()', () => {
        expect(anonymize.handler).to.be.a('function');
    });
    it('should have start() as a stub function', () => {
        expect(anonymize.start).to.not.throw();
    });
    it('should have stop() as a stub function', () => {
        expect(anonymize.stop).to.not.throw();
    });
    describe('prepare()', () => {
        it('should register notification listener for `private_message`', () => {
            const spy = sinon.spy();
            anonymize.prepare(undefined, dummyCfg, {
                onNotification: spy
            }, undefined);
            spy.calledWith('private_message', anonymize.handler).should.be.true;
        });
    });
    describe('handler()', () => {
        let sandbox;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('should not create post', () => {
            const spy = sandbox.stub();
            spy.yields(null);
            anonymize.prepare(undefined, dummyCfg, {
                onNotification: () => 0
            }, {
                createPost: spy
            });
            anonymize.handler(undefined, {
                id: 1
            }, {
                post_number: 2, //eslint-disable-line camelcase
                raw: 'This should be ignored!'
            });
            spy.calledOnce.should.be.true;
            spy.calledWith(1, 2, anonymize.internals.parseError).should.be.true;
        });
        it('should not create post for the same topic', () => {
            const spy = sandbox.stub();
            spy.yields(null);
            anonymize.prepare(undefined, dummyCfg, {
                onNotification: () => 0
            }, {
                createPost: spy
            });
            anonymize.handler(undefined, {
                id: 1
            }, {
                post_number: 2, //eslint-disable-line camelcase
                raw: '[quote="SockBot, post:2, topic:1"]This should be ignored![/quote]This should be ignored!'
            });
            spy.calledOnce.should.be.true;
            spy.calledWith(1, 2, anonymize.internals.parseError).should.be.true;
        });
        it('should not create post when no post is specified in the quote', () => {
            const spy = sandbox.stub(browser, 'createPost'),
                rawContent = '[quote="SockBot, topic:1"]Anonymized quote![/quote]Anonymized reply!';
            spy.yields(null);
            anonymize.prepare(undefined, dummyCfg, {
                onNotification: () => 0
            }, browser);
            anonymize.handler(undefined, {
                id: 1
            }, {
                post_number: 2, //eslint-disable-line camelcase
                raw: rawContent
            });
            spy.calledOnce.should.be.true;
            spy.calledWith(1, 2, anonymize.internals.parseError).should.be.true;
        });
        it('should create post in reply to target post', () => {
            const spy = sandbox.stub(browser, 'createPost'),
                rawContent = '[quote="SockBot, post:4, topic:3"]Anonymized quote![/quote]Anonymized reply!';
            spy.yields(null, {topic_id: 5, post_number: 6}); //eslint-disable-line camelcase
            anonymize.prepare(undefined, dummyCfg, {
                onNotification: () => 0
            }, browser);
            anonymize.handler(undefined, {
                id: 1
            }, {
                post_number: 2, //eslint-disable-line camelcase
                raw: rawContent
            });
            spy.calledTwice.should.be.true;
            spy.firstCall.calledWith('3', '4', rawContent).should.be.true;
            expect(spy.secondCall.args[0]).to.equal(1);
            expect(spy.secondCall.args[1]).to.equal(2);
            expect(spy.secondCall.args[2]).to.contain(anonymize.internals.postSuccess);
        });
        it('should report Discourse error', () => {
            const spy = sandbox.stub(browser, 'createPost'),
                rawContent = '[quote="SockBot, post:4, topic:3"]Anonymized quote![/quote]Anonymized reply!';
            spy.yields(true);
            anonymize.prepare(undefined, dummyCfg, {
                onNotification: () => 0
            }, browser);
            anonymize.handler(undefined, {
                id: 1
            }, {
                post_number: 2, //eslint-disable-line camelcase
                raw: rawContent
            });
            spy.calledTwice.should.be.true;
            spy.firstCall.calledWith('3', '4', rawContent).should.be.true;
            spy.secondCall.calledWith(1, 2, anonymize.internals.postError).should.be.true;
        });
    });
});
