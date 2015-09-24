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
const dummyCfg = {mergeObjects: utils.mergeObjects};

describe('Powerlevel plugin', () => {
    describe('exports', () => {
        const fns = ['prepare', 'start', 'stop', 'updateSelf',
		'giveLikes', 'increaseTrustLevel'],
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
                },
                mergeObjects: utils.mergeObjects
            };
            powerlevel.prepare(null, config, events, browser);
            expect(powerlevel.internals.browser).to.equal(browser);
        });
        it('should reject a lack of config', () => {
            const browser = {};
            expect(() => {
                powerlevel.prepare(null, dummyCfg, events, browser);
            }).to.throw(Error);
        });
         it('should accept plugin config', () => {
            const browser = {};
            const config = {
                core: {
                    username: 'foo'
                },
                mergeObjects: utils.mergeObjects
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
                },
                mergeObjects: utils.mergeObjects
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
                },
                mergeObjects: utils.mergeObjects
            };

            powerlevel.prepare(null, config, {}, fakeBrowser);
            powerlevel.updateSelf(function() {
                expect(fakeBrowser.getUser).to.have.been.calledWith('yamikuronue');
                expect(powerlevel.internals.me.topicsCreated).to.equal(topicsCreated);
                expect(powerlevel.internals.me.likesGiven).to.equal(likesGiven);
                expect(powerlevel.internals.me.likesReceived).to.equal(likesReceived);
                expect(powerlevel.internals.me.replies).to.equal(repliesReceived);
                expect(powerlevel.internals.me.postsMade).to.equal(topicsCreated + repliesMade);
            });
        });
    });

	describe('giveLikes()', () => {
		let sandbox;
		const config = {
                core: {
                    username: 'yamikuronue'
                }
            };

        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(utils, 'mergeObjects');
        });

        afterEach(() => sandbox.restore());
		
		it('Should start a PM chain to like', () => {
			const fakeBrowser = {
				createPrivateMessage: sandbox.stub().yields(null, {id: 15}),
				createPost: sandbox.stub().yields(null, {id: 16}),
				postAction:sandbox.stub().yields()
            };

			powerlevel.prepare(null, config, {}, fakeBrowser);

			powerlevel.giveLikes(1, function(err) {
				expect(fakeBrowser.createPrivateMessage).to.have.been.calledOnce;//Create the PM
				expect(fakeBrowser.postAction).to.have.been.calledWith(2, 15, ''); //Like on the post
				expect(fakeBrowser.createPost).not.to.have.been.called; //reply: none needed
				expect(err).to.be.falsey;
			});
		});
		
		it('Should reply to the same PM for the second like', (done) => {
			const fakeBrowser = {
				createPrivateMessage: sandbox.stub().yields(null, {id: 15}),
				createPost: sandbox.stub().yields(null, {id: 16}),
				postAction:sandbox.stub().yields()
            };

			powerlevel.prepare(null, config, {}, fakeBrowser);

			powerlevel.giveLikes(2, function(err) {
				expect(fakeBrowser.createPrivateMessage).to.have.been.calledOnce;
				expect(fakeBrowser.createPost).to.have.been.calledOnce;
				expect(fakeBrowser.createPost).to.have.been.calledWith(15);
				expect(fakeBrowser.postAction).to.have.been.calledWith(2, 15, ''); //Like on the post
				expect(fakeBrowser.postAction).to.have.been.calledWith(2, 16, ''); //Like on the rely
				expect(err).to.be.falsey;
				done();
			});
		});
		
		it('Should gather the correct amount of likes', (done) => {
			const numLikes = Math.ceil(Math.random * 5 + 2);
			const fakeBrowser = {
				createPrivateMessage: sandbox.stub().yields(null, {id: 15}),
				createPost: sandbox.stub().yields(null, {id: 16}),
				postAction:sandbox.stub().yields()
            };

			powerlevel.prepare(null, config, {}, fakeBrowser);

			powerlevel.giveLikes(numLikes, function(err) {
				expect(err).to.be.falsey;
				expect(fakeBrowser.createPrivateMessage).to.have.been.calledOnce;
				expect(fakeBrowser.createPost).to.have.callCount(numLikes - 1);
				expect(fakeBrowser.postAction).to.have.callCount(numLikes);
				done();
			});
		});
	});
});
