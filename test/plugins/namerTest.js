'use strict';
/*globals describe, it*/

const chai = require('chai'),
    sinon = require('sinon');
chai.should();
const expect = chai.expect;

const namer = require('../../plugins/namer');
describe('namer', () => {
    describe('exports', () => {
        it('should export prepare()', () => {
            expect(namer.prepare).to.be.a('function');
        });
        it('should export start()', () => {
            expect(namer.start).to.be.a('function');
        });
        it('should export stop()', () => {
            expect(namer.stop).to.be.a('function');
        });
        it('should export setName()', () => {
            expect(namer.setName).to.be.a('function');
        });
        it('should export internals{}', () => {
            expect(namer.internals).to.be.an('object');
        });
    });
    describe('prepare()', () => {
        let events, config;
        beforeEach(() => {
            events = {
                registerHelp: sinon.stub(),
                emit: sinon.stub()
            };
            config = {
                core: {
                    username: undefined
                }
            };
        });
        it('should set internals.config', () => {
            const expected = Math.random();
            namer.prepare(expected, config, events, null);
            namer.internals.config.should.equal(expected);
        });
        it('should set internals.events', () => {
            namer.prepare(null, config, events, null);
            namer.internals.events.should.equal(events);
        });
        it('should set internals.browser', () => {
            const expected = Math.random();
            namer.prepare(null, config, events, expected);
            namer.internals.browser.should.equal(expected);
        });
        it('should set internals.profileUrl', () => {
            const name = Math.random();
            const expected = '/users/' + name;
            config.core.username = name;
            namer.prepare(null, config, events, expected);
            namer.internals.profileUrl.should.equal(expected);
        });
        it('should register help topic', () => {
            const expected = Math.random();
            namer.prepare(expected, config, events, null);
            const args = events.registerHelp.firstCall.args;
            args[0].should.equal('namer');
            args[1].should.equal(namer.internals.extendedHelp);
            args[2].should.be.a('function');
            args[2]().should.equal(0);
        });
    });
    describe('start()', () => {
        const events = {};
        before(() => {
            namer.internals.events = events;
            namer.internals.config = {
                schedule: undefined
            };
        });
        beforeEach(() => {
            events.emit = sinon.stub();
            namer.internals.interval = undefined;
        });
        afterEach(() => {
            if (namer.internals.interval) {
                namer.internals.interval.clear();
            }
        });
        it('should set interval on valid schecule', () => {
            namer.internals.config.schedule = 'at 00:00';
            namer.start();
            expect(namer.internals.interval).to.not.equal(undefined);
        });
        it('should not set interval on valid schecule', () => {
            namer.internals.config.schedule = 'asdfhadkdkdkdk';
            namer.start();
            expect(namer.internals.interval).to.equal(undefined);
        });
        it('should log warning on invalid schedue', () => {
            namer.internals.config.schedule = 'asdfhadkdkdkdk';
            namer.start();
            events.emit.called.should.equal(true);
            const args = events.emit.firstCall.args;
            args[0].should.equal('logWarning');
            args[1].should.equal('Parse error in scedule. Cannot start `namer` plugin.');
        });
    });
    describe('stop()', () => {
        it('should not throw on missing interval', () => {
            namer.internals.interval = undefined;
            expect(namer.stop).to.not.throw();
        });
        it('should not throw on invalid interval', () => {
            namer.internals.interval = 5;
            expect(namer.stop).to.not.throw();
        });
        it('should clear valid interval', () => {
            namer.internals.interval = {
                clear: sinon.spy()
            };
            expect(namer.stop).to.not.throw();
            namer.internals.interval.clear.called.should.equal(true);
        });
    });
    describe('setName()', () => {
        const browser = {};
        let names = [];
        beforeEach(() => {
            browser.putData = sinon.stub();
            names = [];
            namer.internals.config.names = names;
            namer.internals.browser = browser;
        });
        it('should fail to set name on zero configured names', () => {
            namer.setName();
            browser.putData.called.should.equal(false);
        });
        it('should fail to set name on one configured name', () => {
            names.push('a');
            namer.setName();
            browser.putData.called.should.equal(false);
        });
        it('should set name for multiple configured names', () => {
            names.push('a');
            names.push('b');
            names.push('c');
            namer.setName();
            browser.putData.called.should.equal(true);
        });
        it('should put data to expected URL', () => {
            names.push('a');
            names.push('b');
            const expected = Math.random();
            namer.internals.profileUrl = expected;
            namer.setName();
            const args = browser.putData.firstCall.args;
            args[0].should.equal(expected);
        });
        it('should put data to expected data', () => {
            names.push('a');
            names.push('b');
            const expected = {
                name: 'b'
            };
            const rand = Math.random;
            Math.random = () => 0.999;
            namer.setName();
            Math.random = rand;
            const args = browser.putData.firstCall.args;
            args[1].should.deep.equal(expected);
        });
        
        it('should put data with callback', () => {
            names.push('a');
            names.push('b');
            const expected = Math.random();
            namer.internals.profileUrl = expected;
            namer.setName();
            const args = browser.putData.firstCall.args;
            args[2].should.be.a('function');
            args[2]().should.equal(0);
        });
    });
});
