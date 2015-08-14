'use strict';
/*globals describe, it, beforeEach, afterEach*/

const sinon = require('sinon'),
    chai = require('chai');
chai.should();
const expect = chai.expect;
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

// The thing we're testing
const powerlevel = require('../../plugins/powerlevel'),
    utils = require('../../lib/utils');

describe('Powerlevel plugin', () => {
    describe('exports', () => {
        const fns = ['prepare', 'start', 'stop', 'updateSelf'],
            objs = ['internals', 'defaultConfig'];
        fns.forEach(fn => it('should export ' + fn + '()', () => {
            expect(powerlevel[fn]).to.be.a('function');
        }));
        objs.forEach(obj => it('should export ' + obj, () => {
            expect(powerlevel[obj]).to.be.an('object');
        }));
        it('should only export expected keys', () => {
            powerlevel.should.have.all.keys(fns.concat(objs));
        });
    });
    describe('start()', () => {
        let sandbox;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(utils, 'mergeObjects');
        });
        afterEach(() => sandbox.restore());
        it('should call updateSelf', () => {
            const updateSelfStub = sandbox.stub(powerlevel, 'updateSelf');
            powerlevel.start();
            expect(updateSelfStub).to.have.been.called;
        });
    });
    describe('stop()', () => {
        it('should be a stub function', () => {
            powerlevel.stop();
        });
    });
    describe('prepare()', () => {
        let sandbox, events;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(utils, 'mergeObjects');
            events = {
                onNotification: sinon.spy()
            };
        });
        afterEach(() => sandbox.restore());
        it('should set browser', () => {
            const browser = {};
            const config = {
                core: {
                    username: 'foo'
                }
            };
            powerlevel.prepare(null, config, events, browser);
            expect(powerlevel.internals.browser).to.equal(browser);
        });
        it('should reject a lack of config', () => {
            const browser = {};
            expect(() => {
                powerlevel.prepare(null, null, events, browser);
            }).to.throw(Error);
        });
         it('should accept plugin config', () => {
            const browser = {};
            const config = {
                core: {
                    username: 'foo'
                }
            };
            powerlevel.prepare({}, config, events, browser);
            expect(powerlevel.internals.browser).to.equal(browser);
        });
    });
    describe('updateSelf()', () => {
        let sandbox;

        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(utils, 'mergeObjects');
        });
        afterEach(() => sandbox.restore());

        it('should call getUser', () => {
            const fakeBrowser = {
                getUser: sandbox.stub()
            };
             const config = {
                core: {
                    username: 'foo'
                }
            };

            powerlevel.prepare(null, config, {}, fakeBrowser);
            powerlevel.updateSelf();
            expect(fakeBrowser.getUser).to.have.been.called;
        });


        it('should parse response from getUser', () => {
            const topicsCreated = Math.ceil(5 + Math.random() * 10),
                likesGiven = Math.ceil(5 + Math.random() * 10),
                likesReceived = Math.ceil(5 + Math.random() * 10),
                repliesReceived = Math.ceil(5 + Math.random() * 10),
                repliesMade = Math.ceil(5 + Math.random() * 10);

            const fakeUserData = {'user': {
            'id': 788,
            'username': 'Yamikuronue',
            'stats': [
              {
                'action_type': 4,
                'count': topicsCreated,
                'id': null
              },
              {
                'action_type': 5,
                'count': repliesMade,
                'id': null
              },
              {
                'action_type': 6,
                'count': repliesReceived,
                'id': null
              },
              {
                'action_type': 1,
                'count': likesGiven,
                'id': null
              },
              {
                'action_type': 2,
                'count': likesReceived,
                'id': null
              }
            ]}};

            const fakeBrowser = {
                getUser: sandbox.stub().yields(fakeUserData)
            };
             const config = {
                core: {
                    username: 'yamikuronue'
                }
            };

            powerlevel.prepare(null, config, {}, fakeBrowser);
            powerlevel.updateSelf(function() {
                expect(fakeBrowser.getUser).to.have.been.calledWith('yamikuronue');
                expect(powerlevel.internals.me.topicsCreated).to.equal(topicsCreated);
                expect(powerlevel.internals.me.likesGiven).to.equal(likesGiven);
                expect(powerlevel.internals.me.likesReceived).to.equal(likesReceived);
                expect(powerlevel.internals.me.replies).to.equal(repliesReceived);
                expect(powerlevel.internals.me.postsMade).to.equal(topicsCreated+repliesMade);
            });
        });
    });
});
