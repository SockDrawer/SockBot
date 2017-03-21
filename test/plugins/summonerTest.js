'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.should();

const sinon = require('sinon');
chai.use(require('sinon-chai'));

const testModule = require('../../plugins/summoner');

describe('plugins/echo', () => {
    describe('module', () => {
        it('should export plugin function directly', () => {
            testModule.should.be.a('function');
        });
        it('should return an object', () => {
            testModule().should.be.an('object');
        });
        it('should return an object with an activate function', () => {
            testModule().activate.should.be.a('function');
        });
        it('should return an object with a deactivate function', () => {
            testModule().deactivate.should.be.a('function');
        });
        it('should return an object with a handler function', () => {
            testModule().handler.should.be.a('function');
        });
        it('should return an object with a messages array', () => {
            testModule().messages.should.be.an('array');
        });
    });
    describe('messages', () => {
        const defaults = testModule.defaultMessages;
        it('should use default messages with no provided messages', () => {
            testModule().messages.should.eql(defaults);
        });
        it('should use default messages with empty array for provided messages', () => {
            testModule(null, []).messages.should.eql(defaults);
        });
        it('should use provided messages when at least one message provided', () => {
            const messages = ['hi there'];
            testModule(null, messages).messages.should.equal(messages);
        });
        it('should use default messages with empty array for object provided messages', () => {
            testModule(null, {
                messages: []
            }).messages.should.eql(defaults);
        });
        it('should use object provided messages when at least one message provided', () => {
            const messages = ['hi there'];
            testModule(null, {
                messages: messages
            }).messages.should.equal(messages);
        });
    });
    describe('activate/deactivate', () => {
        let summoner = null,
            forum = null;
        beforeEach(() => {
            forum = {
                on: sinon.stub(),
                off: sinon.stub()
            };
            summoner = testModule(forum);
        });
        it('should register handler for event on activate', () => {
            summoner.activate();
            forum.on.should.have.been.calledWith('notification:mention', summoner.handler).once;
        });
        it('should unregister handler for event on deactivate', () => {
            summoner.deactivate();
            forum.off.should.have.been.calledWith('notification:mention', summoner.handler).once;
        });
    });
    describe('handler', () => {
        let summoner = null,
            forum = null,
            notification = null,
            user = null;
        beforeEach(() => {
            user = {};
            notification = {
                getUser: sinon.stub().resolves(user)
            };
            forum = {
                Post: {
                    reply: sinon.stub().resolves()
                },
                emit: sinon.stub()
            };
            summoner = testModule(forum);
        });
        it('should retrieve user who generated reply', () => {
            return summoner.handler(notification).then(() => {
                notification.getUser.should.have.been.calledOnce;
            });
        });
        it('should reply via static Post.reply', () => {
            return summoner.handler(notification).then(() => {
                forum.Post.reply.should.have.been.calledOnce;
            });
        });
        it('should reply to notification.topicId', () => {
            const expected = Math.random();
            notification.topicId = expected;
            return summoner.handler(notification).then(() => {
                forum.Post.reply.should.have.been.calledWith(expected).once;
            });
        });
        it('should reply to notification.postId', () => {
            const expected = Math.random();
            notification.postId = expected;
            return summoner.handler(notification).then(() => {
                forum.Post.reply.should.have.been.calledWith(undefined, expected).once;
            });
        });
        it('should perform string replacements on message', () => {
            const expected = `a${Math.random()}b`;
            user.keyblade = expected;
            summoner = testModule(forum, ['%keyblade%']);
            return summoner.handler(notification).then(() => {
                forum.Post.reply.should.have.been.calledWith(undefined, undefined, expected).once;
            });
        });
        it('should leave replacement string in place when the replacement is not stringy', () => {
            user.keyblade = () => 0;
            summoner = testModule(forum, ['%keyblade%']);
            return summoner.handler(notification).then(() => {
                forum.Post.reply.should.have.been.calledWith(undefined, undefined, '%keyblade%').once;
            });
        });
        it('should substitute `username` when `name` is missing', () => {
            const expected = `a${Math.random()}b`;
            user.username = expected;
            summoner = testModule(forum, ['%name%']);
            return summoner.handler(notification).then(() => {
                forum.Post.reply.should.have.been.calledWith(undefined, undefined, expected).once;
            });
        });
        it('should not substitute `username` when `name` is present', () => {
            const dummy = `b${Math.random()}a`;
            const expected = `a${Math.random()}b`;
            user.username = dummy;
            user.name = expected;
            summoner = testModule(forum, ['%name%']);
            return summoner.handler(notification).then(() => {
                forum.Post.reply.should.have.been.calledWith(undefined, undefined, expected).once;
            });
        });
        it('choose message randomly', () => {
            const sandbox = sinon.sandbox.create();
            sandbox.stub(Math, 'random');
            Math.random.returns(0.5);
            summoner = testModule(forum, ['0', '1', '2', '3', '4']);
            return summoner.handler(notification).then(() => {
                Math.random.should.have.been.calledOnce;
                forum.Post.reply.should.have.been.calledWith(undefined, undefined, '2').once;
            }).then(() => sandbox.restore());
        });
        describe('errors', () => {
            it('should emit error when error ocurrs', () => {
                const expected = new Error(Math.random());
                notification.getUser.rejects(expected);
                return summoner.handler(notification).catch(() => {
                    forum.emit.should.have.been.calledWith('error', expected).once;
                });
            });
            it('should reject when getUser rejects', () => {
                notification.getUser.rejects('bad');
                return summoner.handler(notification).should.be.rejected;
            });
            it('should reject when reply rejects', () => {
                forum.Post.reply.rejects('bad');
                return summoner.handler(notification).should.be.rejected;
            });
        });
    });
});
