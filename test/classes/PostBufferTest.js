'use strict';
/*globals describe, it*/

const chai = require('chai');
chai.should();
const expect = chai.expect;

const PostBuffer = require('../../classes/PostBuffer');

describe('PostBuffer', () => {
    it('should export add()', () => {
        expect(PostBuffer.prototype.add).to.be.a('function');
    });
    it('should throw with no delay', () => {
        expect(() => new PostBuffer()).to.throw('delay must be supplied');
    });
    it('should throw with no callback', () => {
        expect(() => new PostBuffer(1)).to.throw('callback must be supplied');
    });
});
