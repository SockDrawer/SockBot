'use strict';
/*globals describe, it, before, after*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon');
chai.should();
const expect = chai.expect;

// The thing we're testing
const browser = require('../browser');

describe('browser', () => {
    describe('exports', () => {
        const fns = [],
            objs = ['internals'],
            vals = [];
        describe('should export expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(browser[fn]).to.be.a('function'));
            });
        });
        describe('should export expected objects', () => {
            objs.forEach((obj) => {
                it(obj, () => expect(browser[obj]).to.be.a('object'));
            });
        });
        describe('should export expected values', () => {
            vals.forEach((val) => {
                it(val, () => browser.should.have.key(val));
            });
        });
        it('should export only expected keys', () => {
            browser.should.have.all.keys(fns.concat(objs, vals));
        });
    });
    describe('internals', () => {
        const fns = ['queueWorker', 'requestComplete', 'request'],
            objs = ['defaults', 'queue'],
            vals = [];
        describe('should include expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(browser.internals[fn]).to.be.a('function'));
            });
        });
        describe('should include expected objects', () => {
            objs.forEach((obj) => {
                it(obj, () => expect(browser.internals[obj]).to.be.a('object'));
            });
        });
        describe('should include expected values', () => {
            vals.forEach((val) => {
                it(val, () => browser.internals.should.have.key(val));
            });
        });
        it('should include only expected keys', () => {
            browser.internals.should.have.all.keys(fns.concat(objs, vals));
        });
    });
    describe('queueWorker()', () => {
        const queueWorker = browser.internals.queueWorker,
            request = browser.internals.request;
        let clock;
        before(() => {
            clock = sinon.useFakeTimers();
        });
        it('should delay completion by five seconds to throttle requests', (done) => {
            browser.internals.request = (_, cb) => cb(null, null, '"foobar"');
            const spy = sinon.spy();
            queueWorker({}, spy);
            spy.called.should.be.false;
            clock.tick(5000);
            spy.called.should.be.true;
            done();
        });
        it('should select default callback delay when omitted', (done) => {
            browser.internals.request = (_, cb) => cb();
            const queueSpy = sinon.spy(),
                callbackSpy = sinon.spy();
            queueWorker({
                callback: callbackSpy
            }, queueSpy);
            clock.tick(0);
            queueSpy.called.should.be.false;
            callbackSpy.called.should.be.true;
            clock.tick(5000);
            queueSpy.called.should.be.true;
            done();
        });
        it('should select callback delay from task', (done) => {
            browser.internals.request = (_, cb) => cb();
            const queueSpy = sinon.spy(),
                callbackSpy = sinon.spy();
            queueWorker({
                callback: callbackSpy,
                delay: 1000
            }, queueSpy);
            clock.tick(0);
            queueSpy.called.should.be.false;
            callbackSpy.called.should.be.false;
            clock.tick(1000);
            callbackSpy.called.should.be.true;
            clock.tick(5000);
            queueSpy.called.should.be.true;
            done();
        });
        it('should accept invalid JSON', (done) => {
            browser.internals.request = (_, cb) => cb(null, null, '"foobar');
            const queueSpy = sinon.spy(),
                callbackSpy = sinon.spy();
            queueWorker({
                callback: callbackSpy
            }, queueSpy);
            clock.tick(0);
            queueSpy.called.should.be.false;
            callbackSpy.called.should.be.true;
            callbackSpy.lastCall.args.should.have.length(2);
            expect(callbackSpy.lastCall.args[0]).to.be.null;
            callbackSpy.lastCall.args[1].should.equal('"foobar');
            clock.tick(5000);
            queueSpy.called.should.be.true;
            done();
        });
        it('should pass errors to task.callback', (done) => {
            browser.internals.request = (_, cb) => cb('ERROR', null, null);
            const queueSpy = sinon.spy(),
                callbackSpy = sinon.spy();
            queueWorker({
                callback: callbackSpy
            }, queueSpy);
            clock.tick(0);
            callbackSpy.called.should.be.true;
            callbackSpy.lastCall.args.should.have.length(2);
            callbackSpy.lastCall.args[0].should.equal('ERROR');
            expect(callbackSpy.lastCall.args[1]).to.be.null;
            clock.tick(5000);
            queueSpy.called.should.be.true;
            done();
        });
        it('should use default method when omitted', (done) => {
            let req;
            browser.internals.request = (opts, cb) => {
                req = opts;
                cb();
            };
            const queueSpy = sinon.spy();
            queueWorker({}, queueSpy);
            clock.tick(5000);
            queueSpy.called.should.be.true;
            req.method.should.equal('GET');
            done();
        });
        it('should select method from task', (done) => {
            let req;
            browser.internals.request = (opts, cb) => {
                req = opts;
                cb();
            };
            const queueSpy = sinon.spy();
            queueWorker({
                method: 'FRED'
            }, queueSpy);
            clock.tick(5000);
            queueSpy.called.should.be.true;
            req.method.should.equal('FRED');
            done();
        });
        it('should select URL from task', (done) => {
            let req;
            browser.internals.request = (opts, cb) => {
                req = opts;
                cb();
            };
            const queueSpy = sinon.spy();
            queueWorker({
                url: 'http://example.com'
            }, queueSpy);
            clock.tick(5000);
            queueSpy.called.should.be.true;
            req.url.should.equal('http://example.com');
            done();
        });

        it('should select form from task', (done) => {
            const form = {
                a: 1,
                b: 2,
                c: 4,
                d: 3
            };
            let req;
            browser.internals.request = (opts, cb) => {
                req = opts;
                cb();
            };
            const queueSpy = sinon.spy();
            queueWorker({
                form: form
            }, queueSpy);
            clock.tick(5000);
            queueSpy.called.should.be.true;
            req.form.should.deep.equal(form);
            done();
        });
        after(() => {
            clock.restore();
            browser.internals.request = request;
        });
    });
    describe('documentation stubs', () => {
        const internals = browser.internals,
            stubs = ['requestComplete'];
        stubs.forEach((stub) => {
            it(stub + '() should be a stub function', () => internals[stub]());
        });
    });
});
