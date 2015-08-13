'use strict';
/*globals describe, it, before, beforeEach, after, afterEach*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon');
chai.should();
const expect = chai.expect;

// The thing we're testing
const cli = require('../../lib/cli'),
    utils = require('../../lib/utils'),
    SockBot = require('../../SockBot');

describe('cli', () => {
    describe('privateFns', () => {
        const fns = ['bootstrap'];
        describe('should export expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(cli.privateFns[fn]).to.be.a('function'));
            });
        });
    });
    describe('bootstrap()', () => {
        let sandbox, prepare;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            prepare = sandbox.stub(SockBot, 'prepare');
            sandbox.stub(SockBot, 'start').yields();
            sandbox.stub(utils, 'log');
            sandbox.stub(utils, 'error');
        });
        describe('no switches', () => {
            it('run as normal', () => {
                prepare.yields();
                cli.privateFns.bootstrap(null, false);
                SockBot.start.called.should.be.true;
                utils.log.called.should.be.false;
                utils.error.called.should.be.false;
            });
            it('error as normal', () => {
                prepare.yields(new Error('I ain\'t got no time for jibba-jabba, foo!'));
                cli.privateFns.bootstrap(null, false);
                SockBot.start.called.should.be.false;
                utils.log.called.should.be.false;
                utils.error.called.should.be.true;
            });
        });
        describe('--checkCfg switch', () => {
            it('report valid configuration file', () => {
                prepare.yields();
                cli.privateFns.bootstrap(null, true);
                SockBot.start.called.should.be.false;
                utils.log.called.should.be.true;
                utils.error.called.should.be.false;
            });
            it('report invalid configuration file', () => {
                prepare.yields(new Error('I ain\'t got no time for jibba-jabba, foo!'));
                cli.privateFns.bootstrap(null, true);
                SockBot.start.called.should.be.false;
                utils.log.called.should.be.false;
                utils.error.called.should.be.true;
            });
        });
        afterEach(function () {
            sandbox.restore();
        });
    });
});
