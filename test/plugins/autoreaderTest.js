'use strict';
/*globals describe, it, beforeEach, afterEach*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon');
chai.should();
const expect = chai.expect;

const later = require('later');
const autoreader = require('../../plugins/autoreader'),
    browserModule = require('../../lib/browser'),
    utils = require('../../lib/utils');
const browser = browserModule();
const dummyCfg = {
    mergeObjects: utils.mergeObjects
};

describe('autoreader', () => {
    it('should export prepare()', () => {
        expect(autoreader.prepare).to.be.a('function');
    });
    it('should export start()', () => {
        expect(autoreader.start).to.be.a('function');
    });
    it('should export stop()', () => {
        expect(autoreader.stop).to.be.a('function');
    });
    it('should export readify()', () => {
        expect(autoreader.readify).to.be.a('function');
    });
    describe('prepare()', () => {
        it('should use default config', () => {
            autoreader.prepare(undefined, dummyCfg, {
                registerHelp: () => 0
            }, undefined);
            autoreader.internals.config.minAge.should.equal(3 * 24 * 60 * 60 * 1000);
        });
        it('should use default config if config is not object', () => {
            autoreader.prepare(true, dummyCfg, {
                registerHelp: () => 0
            }, undefined);
            autoreader.internals.config.minAge.should.equal(3 * 24 * 60 * 60 * 1000);
        });
        it('should override default config', () => {
            autoreader.prepare({
                minAge: 1 * 24 * 60 * 60 * 1000
            }, dummyCfg, {
                registerHelp: () => 0
            }, undefined);
            autoreader.internals.config.minAge.should.equal(1 * 24 * 60 * 60 * 1000);
        });
        it('should not randomize reader start', () => {
            autoreader.prepare({
                randomize: false
            }, dummyCfg, {
                registerHelp: () => 0
            }, undefined);
            autoreader.internals.config.hour.should.equal(0);
            autoreader.internals.config.minute.should.equal(0);
        });
        it('should store events object in internals', () => {
            const events = {
                registerHelp: () => 0
            };
            autoreader.prepare(undefined, dummyCfg, events, undefined);
            autoreader.internals.events.should.equal(events);
        });
        it('should register extended help', () => {
            const events = {
                registerHelp: sinon.spy()
            };
            autoreader.prepare({}, dummyCfg, events);
            events.registerHelp.calledWith('autoreader', autoreader.internals.extendedHelp).should.be.true;
            expect(events.registerHelp.firstCall.args[2]).to.be.a('function');
            expect(events.registerHelp.firstCall.args[2]()).to.equal(0);
        });
    });
    describe('start()', () => {
        let sandbox;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(later, 'setInterval', () => {
                return {};
            });
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('should start timer', () => {
            autoreader.internals.timer = undefined;
            autoreader.start();
            expect(autoreader.internals.timer).to.not.be.undefined;
        });
    });
    describe('stop()', () => {
        it('should stop timer', () => {
            autoreader.internals.timer = {
                clear: () => 0
            };
            autoreader.stop();
            expect(autoreader.internals.timer).to.be.undefined;
        });
        it('should not throw on undefined timer', () => {
            autoreader.internals.timer = undefined;
            autoreader.stop();
            autoreader.stop.should.not.throw;
            expect(autoreader.internals.timer).to.be.undefined;
        });
    });
    describe('readify()', () => {
        let sandbox, events;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(browser, 'readPosts', (_, __, complete) => {
                complete();
            });
            events = {
                emit: sinon.spy(),
                registerHelp: sinon.spy()
            };
            autoreader.internals.events = events;
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('should not read anything', () => {
            const spy = sandbox.stub(browser, 'getTopics'),
                spy2 = sinon.spy();
            spy.callsArgWith(0, undefined, spy2);
            autoreader.prepare(undefined, dummyCfg, events, browser);
            autoreader.readify();
            events.emit.calledWith('logMessage').should.be.false;
            spy2.called.should.be.true;
        });
        it('should read the topic', () => {
            const topicSpy = sandbox.stub(browser, 'getTopics');
            topicSpy.callsArgWith(0, {
                id: 1,
                slug: 'Test'
            }, () => 0);
            sandbox.stub(browser, 'getPosts');
            autoreader.prepare(undefined, dummyCfg, events, browser);
            autoreader.readify();
        });
        it('should not read the topic when no new posts could have been made', () => {
            const topicSpy = sandbox.stub(browser, 'getTopics');
            topicSpy.callsArgWith(0, {
                id: 1,
                slug: 'Test',
                'last_posted_at': new Date(Date.now() - 5 * 25 * 60 * 60 * 1000).toISOString()
            }, () => 0);
            sandbox.stub(browser, 'getPosts');
            autoreader.prepare(undefined, dummyCfg, events, browser);
            autoreader.readify();
            events.emit.calledWith('logMessage', 'Reading topic `Test`').should.be.false;
        });
        /*eslint-disable camelcase */
        it('should read the unread post', () => {
            sandbox.stub(browser, 'getTopics', (each, complete) => {
                each({
                    id: 1,
                    slug: 'Test'
                }, complete);
            });
            sandbox.stub(browser, 'getPosts', (_, each, complete) => {
                each({
                    post_number: 1,
                    read: false,
                    created_at: '2000-01-01 00:00'
                }, complete);
            });
            autoreader.prepare(undefined, dummyCfg, events, browser);
            autoreader.readify();
            events.emit.calledWith('logMessage', 'Reading topic `Test`').should.be.true;
            browser.readPosts.calledOnce.should.be.true;
            browser.readPosts.firstCall.args[0].should.equal(1);
            browser.readPosts.firstCall.args[1].should.deep.equal([1]);
        });
        it('should not read the read post', () => {
            sandbox.stub(browser, 'getTopics', (each, complete) => {
                each({
                    id: 1,
                    slug: 'Test'
                }, complete);
            });
            sandbox.stub(browser, 'getPosts', (_, each, complete) => {
                each({
                    post_number: 1,
                    read: true,
                    created_at: '2000-01-01 00:00'
                }, complete);
            });
            autoreader.prepare(undefined, dummyCfg, events, browser);
            autoreader.readify();
            events.emit.calledWith('logMessage', 'Reading topic `Test`').should.be.true;
            browser.readPosts.callCount.should.equal(0);
        });
        it('should not read the unread post that\'s newer than the wait time', () => {
            sandbox.stub(browser, 'getTopics', (each, complete) => {
                each({
                    id: 1,
                    slug: 'Test'
                }, complete);
            });
            sandbox.stub(browser, 'getPosts', (_, each, complete) => {
                each({
                    post_number: 1,
                    read: false,
                    created_at: '2100-01-01 00:00'
                }, complete);
            });
            autoreader.prepare(undefined, dummyCfg, events, browser);
            autoreader.readify();
            events.emit.calledWith('logMessage', 'Reading topic `Test`').should.be.true;
            browser.readPosts.callCount.should.equal(0);
        });
        /*eslint-enable camelcase */
        it('should not read the post that does not exist', () => {
            sandbox.stub(browser, 'getTopics', (each, complete) => {
                each({
                    id: 1,
                    slug: 'Test'
                }, complete);
            });
            sandbox.stub(browser, 'getPosts', (_, each, complete) => {
                each(undefined, complete);
            });
            autoreader.prepare(undefined, dummyCfg, events, browser);
            autoreader.readify();
            events.emit.calledWith('logMessage', 'Reading topic `Test`').should.be.true;
            browser.readPosts.callCount.should.equal(0);
        });
    });
});
