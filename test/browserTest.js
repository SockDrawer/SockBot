'use strict';
/*globals describe, it*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon');
chai.should();
const expect = chai.expect;

// The thing we're testing
const browser = require('../browser');

describe('browser', () => {
    describe('exports', () => {
        let fns = ['uuid'],
            objs = [],
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
    describe('uuid()', () => {
        it('should generate correct format', () => {
            const uuid = browser.uuid();
            uuid.should.match(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[\da-f]{4}-[\da-f]{12}$/);
        });
    });
});
