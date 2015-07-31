'use strict';
/*globals describe, it, beforeEach, afterEach*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon');
chai.should();
const expect = chai.expect;

// The thing we're testing
const SockBot = require('../SockBot'),
    browser = require('../browser'),
    config = require('../config');

describe('SockBot', () => {
    describe('exports', () => {
        const fns = ['start', 'stop', 'prepare'],
            objs = ['privateFns'],
            vals = ['version'];
        describe('should export expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(SockBot[fn]).to.be.a('function'));
            });
        });
        describe('should export expected objects', () => {
            objs.forEach((obj) => {
                it(obj, () => expect(SockBot[obj]).to.be.a('object'));
            });
        });
        describe('should export expected values', () => {
            vals.forEach((val) => {
                it(val, () => SockBot.should.have.any.key(val));
            });
        });
        it('should export only expected keys', () => {
            SockBot.should.have.all.keys(fns.concat(objs, vals));
        });
    });
    describe('privateFns', () => {
        const fns = ['doPluginRequire', 'loadConfig', 'loadPlugins', 'prepareEvents'];
        describe('should export expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(SockBot.privateFns[fn]).to.be.a('function'));
            });
        });
        it('should export only expected keys', () => {
            SockBot.privateFns.should.have.all.keys(fns);
        });
        describe('doPluginRequire()', () => {
            const doPluginRequire = SockBot.privateFns.doPluginRequire;
            let requireIt;
            beforeEach(() => requireIt = sinon.stub());
            it('should call requireIt parameter', () => {
                doPluginRequire('foo', requireIt);
                requireIt.called.should.be.true;
            });
            it('should call requireIt with munged path first', () => {
                doPluginRequire('foo', requireIt);
                requireIt.firstCall.args[0].should.equal('./plugins/foo');
            });
            it('should return results of requireIt with munged path first', () => {
                const value = Math.random();
                requireIt.returns(value);
                expect(doPluginRequire('foo', requireIt)).to.equal(value);
            });
            it('should call requireIt with unmunged path if munged is ENOENT', () => {
                requireIt.onFirstCall().throws(new Error('Cannot find module this is ignored nonsensical text'));
                doPluginRequire('foo', requireIt);
                requireIt.firstCall.args[0].should.equal('./plugins/foo');
                requireIt.secondCall.args[0].should.equal('foo');
            });
            it('should return results of requireIt with unmunged path if munged is ENOENT', () => {
                const value = Math.random();
                requireIt.onFirstCall().throws(new Error('Cannot find module this is ignored nonsensical text'));
                requireIt.onSecondCall().returns(value);
                expect(doPluginRequire('foo', requireIt)).to.equal(value);
            });
            it('should rethrow error from munged path if is not ENOENT', () => {
                const value = new Error('i am nonsensical error text');
                requireIt.onFirstCall().throws(value);
                requireIt.onSecondCall().returns(value);
                expect(() => doPluginRequire('foo', requireIt)).to.throw(value);
            });
            it('should rethrow error from unmunged path if is ENOENT', () => {
                const value = new Error('Cannot find module this is ignored nonsensical text');
                requireIt.onFirstCall().throws(value);
                requireIt.onSecondCall().throws(value);
                expect(() => doPluginRequire('foo', requireIt)).to.throw(value);
            });
            it('should rethrow error from unmunged path if is not ENOENT', () => {
                const value = new Error('this is ignored nonsensical text');
                requireIt.onFirstCall().throws(new Error('Cannot find module this is ignored nonsensical text'));
                requireIt.onSecondCall().throws(value);
                expect(() => doPluginRequire('foo', requireIt)).to.throw(value);
            });
        });
    });
    describe('start', () => {
        let sandbox;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            sandbox.stub(console, 'log');
        });
        afterEach(function () {
            sandbox.restore();
        });
    });
});
