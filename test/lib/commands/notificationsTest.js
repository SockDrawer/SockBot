'use strict';
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
	sinon = require('sinon');
chai.should();
const expect = chai.expect;


const browser = require('../../../lib/browser')();
const config = require('../../../lib/config');

// The thing we're testing
const notifications = require('../../../lib/commands/notifications');

describe('status', () => {
	describe('exports', () => {
		const fns = ['prepare', 'getErrorMessage', 'mute', 'unmute', 'watch', 'unwatch'];
		fns.forEach((fn) => {
			it('should export `' + fn + '()`', () => expect(notifications[fn]).to.be.a('function'));
		});
	});
	describe('exports.prepare()', () => {
		it('should register mute command', (done) => {
			const events = {
				onCommand: sinon.stub()
			};
			events.onCommand.callsArg(3);
			notifications.prepare(events, () => {
				events.onCommand.calledWith('mute', 'Make the bot mute the topic this command is executed on',
					notifications.mute).should.equal(true);
				done();
			});
		});
		it('should register unmute command', (done) => {
			const events = {
				onCommand: sinon.stub()
			};
			events.onCommand.callsArg(3);
			notifications.prepare(events, () => {
				events.onCommand.calledWith('unmute', 'Make the bot unmute the topic this command is executed on',
					notifications.unmute).should.equal(true);
				done();
			});
		});
		it('should register watch command', (done) => {
			const events = {
				onCommand: sinon.stub()
			};
			events.onCommand.callsArg(3);
			notifications.prepare(events, () => {
				events.onCommand.calledWith('watch', 'Make the bot watch the topic this command is executed on',
					notifications.watch).should.equal(true);
				done();
			});
		});
		it('should register unwatch command', (done) => {
			const events = {
				onCommand: sinon.stub()
			};
			events.onCommand.callsArg(3);
			notifications.prepare(events, () => {
				events.onCommand.calledWith('unwatch', 'Make the bot unwatch the topic this command is executed on',
					notifications.unwatch).should.equal(true);
				done();
			});
		});
	});
	describe('exports.getErrorMessage()', () => {
		it('should produce expected message', () => {
			const expected = 'I\'m sorry foobar, but I cannot comply.\n\n' +
				'You are not authorized to use this command.\n\n' +
				'Please ask someone of Trust Level 3 or higher, or my owner, @quux' +
				', for assistance in this matter';
			const command = {
				post: {
					username: 'foobar'
				}
			};
			config.core.owner = 'quux';
			expect(notifications.getErrorMessage(command)).to.equal(expected);
		});
	});
	describe('exports.mute()', () => {
		let sandbox;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			sandbox.stub(browser, 'createPost').callsArg(3);
			sandbox.stub(browser, 'createPrivateMessage').callsArg(3);
			sandbox.stub(browser, 'setNotificationLevel').callsArg(2);
		});
		afterEach(() => sandbox.restore());
		[0, 1, 2].forEach((tl) => {
			it('should reject TL' + tl + ' users requests', () => {
				const topic = Math.random();
				const post = Math.random();
				const command = {
					post: {
						username: 'foobar',
						'trust_level': tl,
						'topic_id': topic,
						'post_number': post
					}
				};
				const message = notifications.getErrorMessage(command);
				notifications.mute(command);
				browser.setNotificationLevel.called.should.equal(false);
				browser.createPost.calledWith(topic, post, message).should.equal(true);
				browser.createPrivateMessage.called.should.equal(false);
			});
		});
		[3, 4, 5, 6, 7, 8, 9].forEach((tl) => {
			it('should accept TL' + tl + ' users requests', () => {
				const topic = Math.random();
				const post = Math.random();
				const url = Math.random();
				const command = {
					post: {
						username: 'foobar',
						'trust_level': tl,
						'topic_id': topic,
						'post_number': post,
						url: url,
						raw: 'this is the raw mute post'
					}
				};
				notifications.mute(command);
				browser.setNotificationLevel.calledWith(topic, 0).should.equal(true);
				browser.createPost.calledWith(topic, post, 'Muting this topic in 3... 2... 1...').should.equal(true);
				browser.createPrivateMessage.calledWith(['foobar', config.core.owner],
					'Complying with Mute Request by @foobar',
					'' + url + '\n\nthis is the raw mute post').should.equal(true);
			});
		});
	});
	describe('exports.watch()', () => {
		let sandbox;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			sandbox.stub(browser, 'createPost').callsArg(3);
			sandbox.stub(browser, 'createPrivateMessage').callsArg(3);
			sandbox.stub(browser, 'setNotificationLevel').callsArg(2);
		});
		afterEach(() => sandbox.restore());
		[0, 1, 2].forEach((tl) => {
			it('should reject TL' + tl + ' users requests', () => {
				const topic = Math.random();
				const post = Math.random();
				const command = {
					post: {
						username: 'foobar',
						'trust_level': tl,
						'topic_id': topic,
						'post_number': post
					}
				};
				const message = notifications.getErrorMessage(command);
				notifications.watch(command);
				browser.setNotificationLevel.called.should.equal(false);
				browser.createPost.calledWith(topic, post, message).should.equal(true);
				browser.createPrivateMessage.called.should.equal(false);
			});
		});
		[3, 4, 5, 6, 7, 8, 9].forEach((tl) => {
			it('should accept TL' + tl + ' users requests', () => {
				const topic = Math.random();
				const post = Math.random();
				const url = Math.random();
				const command = {
					post: {
						username: 'foobar',
						'trust_level': tl,
						'topic_id': topic,
						'post_number': post,
						url: url,
						raw: 'this is the raw watch post'
					}
				};
				notifications.watch(command);
				browser.setNotificationLevel.calledWith(topic, 3).should.equal(true);
				browser.createPost.calledWith(topic, post, 'Watching this topic in 3... 2... 1...').should.equal(true);
				browser.createPrivateMessage.calledWith(['foobar', config.core.owner],
					'Complying with Watch Request by @foobar',
					'' + url + '\n\nthis is the raw watch post').should.equal(true);
			});
		});
	});
	describe('exports.unwatch()', () => {
		let sandbox;
		beforeEach(() => {
			sandbox = sinon.sandbox.create();
			sandbox.stub(browser, 'createPost').callsArg(3);
			sandbox.stub(browser, 'createPrivateMessage').callsArg(3);
			sandbox.stub(browser, 'setNotificationLevel').callsArg(2);
		});
		afterEach(() => sandbox.restore());
		it('should alias exports.unmute', () => {
			expect(notifications.unmute).to.equal(notifications.unwatch);
		});
		[0, 1, 2].forEach((tl) => {
			it('should reject TL' + tl + ' users requests', () => {
				const topic = Math.random();
				const post = Math.random();
				const command = {
					post: {
						username: 'foobar',
						'trust_level': tl,
						'topic_id': topic,
						'post_number': post
					}
				};
				const message = notifications.getErrorMessage(command);
				notifications.unwatch(command);
				browser.setNotificationLevel.called.should.equal(false);
				browser.createPost.calledWith(topic, post, message).should.equal(true);
				browser.createPrivateMessage.called.should.equal(false);
			});
		});
		[3, 4, 5, 6, 7, 8, 9].forEach((tl) => {
			it('should accept TL' + tl + ' users requests', () => {
				const topic = Math.random();
				const post = Math.random();
				const url = Math.random();
				const command = {
					post: {
						username: 'foobar',
						'trust_level': tl,
						'topic_id': topic,
						'post_number': post,
						url: url,
						raw: 'this is the raw unwatch post'
					}
				};
				notifications.unwatch(command);
				browser.setNotificationLevel.calledWith(topic, 1).should.equal(true);
				browser.createPost.calledWith(topic, post,
					'Unwatching this topic in 3... 2... 1...').should.equal(true);
				browser.createPrivateMessage.calledWith(['foobar', config.core.owner],
					'Complying with Unwatch Request by @foobar',
					'' + url + '\n\nthis is the raw unwatch post').should.equal(true);
			});
		});
	});
});
