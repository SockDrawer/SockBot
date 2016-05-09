'use strict';

const chai = require('chai');

chai.use(require('chai-as-promised'));
chai.use(require('chai-string'));
chai.should();


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
    describe('urlForTopic()', () => {
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
    describe('quoteText()', () => {
        it('should quote text as expected', () => {
            const input = 'a\n\n\tb\n \t c';
            const expected = '> a\n> \n> \tb\n>  \t c';
            testModule.quoteText(input).should.equal(expected);
        });
        it('should include bare attribution', () => {
            const username = `User${Math.random()}`;
            const expected = `@${username} said:\n`;
            testModule.quoteText('foo', username).should.startWith(expected);
        });
        it('should include linked attribution', () => {
            const username = `User${Math.random()}`;
            const link = '/URL${Math.random()}';
            const expected = `@${username} [said](${link}):\n`;
            testModule.quoteText('foo', username, link).should.startWith(expected);
        });
        it('should include titled attribution', () => {
            const username = `User${Math.random()}`;
            const link = '/URL${Math.random()}';
            const title = `thread${Math.random()}`;
            const expected = `@${username} said in [${title}](${link}):\n`;
            testModule.quoteText('foo', username, link, title).should.startWith(expected);
        });
    });
});
