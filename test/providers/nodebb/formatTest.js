'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.should();

const sinon = require('sinon');
require('sinon-as-promised');

const testModule = require('../../../providers/nodebb/format');
describe('providers/nodebb/format', () => {
    describe('exports', () => {
        const fns = ['urlForPost', 'urlForTopic'];
        fns.forEach((fn) => {
            it(`should export '${fn}()'`, () => {
                chai.expect(testModule[fn]).to.be.a('function');
            });
        });
    });
    describe('urlForPost()', () => {
        it('should return expected URL', () => {
            const expected = '/post/honey-badger';
            testModule.urlForPost('honey-badger').should.equal(expected);
        });
    });
    describe('urlForTopic', () => {
        it('should return expected URL for bare topic', () => {
            const expected = '/topic/1234';
            testModule.urlForTopic(1234).should.equal(expected);
        });
        it('should return expected URL for topic/postIndex', () => {
            const expected = '/topic/1234/topic/5678';
            testModule.urlForTopic(1234, 5678).should.equal(expected);
        });
        it('should return expected URL for topic/slug', () => {
            const expected = '/topic/1234/honey-badger';
            testModule.urlForTopic(1234, 'honey-badger').should.equal(expected);
        });
        it('should return expected URL for topic/slug/index', () => {
            const expected = '/topic/1234/honey-badger/5678';
            testModule.urlForTopic(1234, 'honey-badger', 5678).should.equal(expected);
        });
    });
});
