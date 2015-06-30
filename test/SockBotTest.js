'use strict';
/*globals describe, it*/
/*eslint no-unused-expressions:0 */

const chai = require('chai');
const expect = chai.expect;

// The thing we're testing
const SockBot = require('../SockBot');

describe('SockBot', () => {
    describe('exports', () => {
        const fns = [],
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
                it(val, () => SockBot.should.have.key(val));
            });
        });
        it('should export only expected keys', () => {
            SockBot.should.have.all.keys(fns.concat(objs, vals));
        });
    });
});
