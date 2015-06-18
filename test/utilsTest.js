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
});
