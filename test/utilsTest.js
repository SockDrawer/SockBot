'use strict';
/*globals describe, it*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon');
chai.should();
const expect = chai.expect;

// The thing we're testing
const utils = require('../utils');

describe('utils', () => {
    describe('exports', () => {
        let fns = ['uuid', 'log', 'warn', 'error', 'addTimestamp'],
            objs = [],
            vals = [];
        describe('should export expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(utils[fn]).to.be.a('function'));
            });
        });
        describe('should export expected objects', () => {
            objs.forEach((obj) => {
                it(obj, () => expect(utils[obj]).to.be.a('object'));
            });
        });
        describe('should export expected values', () => {
            vals.forEach((val) => {
                it(val, () => utils.should.have.key(val));
            });
        });
        it('should export only expected keys', () => {
            utils.should.have.all.keys(fns.concat(objs, vals));
        });
    });
    describe('uuid()', () => {
        it('should generate correct format', () => {
            const uuid = utils.uuid();
            uuid.should.match(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[\da-f]{4}-[\da-f]{12}$/);
        });
    });
    describe('addTimestamp()', () => {
        it('should add correct format time format', () => {
            let message = utils.addTimestamp('message');
            message.should.match(/^\[\d{2}:\d{2}:\d{2}\] message$/);
        });
    });
    describe('log()', () => {
        it('should call console.log()', () => {
            /* eslint-disable no-console */
            const log = console.log;
            try {
                console.log = sinon.spy();
                utils.log('message');
                console.log.called.should.be.true;
                console.log.lastCall.args.should.have.length(1);
                console.log.lastCall.args[0].should.match(/^\[\d{2}:\d{2}:\d{2}\] message$/);
            } finally {
                console.log = log;
            }
            /* eslint-enable no-console */
        });
    });
    describe('warn()', () => {
        it('should call console.warn()', () => {
            /* eslint-disable no-console */
            const warn = console.warn;
            try {
                console.warn = sinon.spy();
                utils.warn('message');
                console.warn.called.should.be.true;
                console.warn.lastCall.args.should.have.length(1);
                console.warn.lastCall.args[0].should.match(/^\[\d{2}:\d{2}:\d{2}\] message$/);
            } finally {
                console.warn = warn;
            }
            /* eslint-enable no-console */
        });
    });
    describe('error()', () => {
        it('should call console.error()', () => {
            /* eslint-disable no-console */
            const error = console.error;
            try {
                console.error = sinon.spy();
                utils.error('message');
                console.error.called.should.be.true;
                console.error.lastCall.args.should.have.length(1);
                console.error.lastCall.args[0].should.match(/^\[\d{2}:\d{2}:\d{2}\] message$/);
            } finally {
                console.error = error;
            }
            /* eslint-enable no-console */
        });
    });
});
