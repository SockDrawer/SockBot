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
        const fns = ['start', 'stop', 'reloadConfig'],
            objs = [],
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
                it(val, () => expect(SockBot[val]).to.not.be.undefined);
            });
        });
        it('should export only expected keys', () => {
            SockBot.should.have.all.keys(fns.concat(objs, vals));
        });
    });
    describe('start', () => {
		let sandbox;
		beforeEach(function() {
			sandbox = sinon.sandbox.create();
			sandbox.stub(console, 'log');
		});
		afterEach(function() {
			sandbox.restore();
		});
		it('should load the config', () => {
			sandbox.stub(config, 'loadConfiguration').yields();
			sandbox.stub(browser.externals, 'login').yields(null, {});
			SockBot.start('example.config.yml');
			browser.externals.login.called.should.be.true;
			config.loadConfiguration.calledWith('example.config.yml').should.be.true;
		});
	});
    describe('stop', () => {
		let sandbox;
		beforeEach(function() {
			sandbox = sinon.sandbox.create();
		});
		afterEach(function() {
			sandbox.restore();
		});
		it('should do nothing', () => {
			SockBot.stop();
		});
	});
    describe('reloadConfig', () => {
		let sandbox;
		beforeEach(function() {
			sandbox = sinon.sandbox.create();
		});
		afterEach(function() {
			sandbox.restore();
		});
		it('should do nothing', () => {
			SockBot.reloadConfig();
		});
	});
});
