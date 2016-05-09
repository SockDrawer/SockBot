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
    describe('headers', () => {
        [
            ['H1', 'header1', '# test text'],
            ['H2', 'header2', '## test text'],
            ['H3', 'header3', '### test text'],
            ['H4', 'header4', '#### test text'],
            ['H5', 'header5', '##### test text'],
            ['H6', 'header6', '###### test text']
        ].forEach((cfg) => {
            it(`should generate a ${cfg[0]} header`, () => {
                testModule[cfg[1]]('test text').should.equal(cfg[2]);
            });
        });
    });
    describe('emphasis', () => {
        [
            ['italic', '*test text*'],
            ['bold', '**test text**'],
            ['bolditalic', '***test text***']
        ].forEach((cfg) => {
            it(`should generate ${cfg[0]} text`, () => {
                testModule[cfg[0]]('test text').should.equal(cfg[1]);
            });
            it(`should remove leading whitespace for ${cfg[0]} text`, () => {
                testModule[cfg[0]](' \t test text').should.equal(cfg[1]);
            });
            it(`should remove trailing whitespace for ${cfg[0]} text`, () => {
                testModule[cfg[0]]('test text \t\t ').should.equal(cfg[1]);
            });
            it(`should remove leading and trailing whitespace for ${cfg[0]} text`, () => {
                testModule[cfg[0]](' \t test text \t  \t\t ').should.equal(cfg[1]);
            });
        });
    });
    describe('hyperlinks', () => {
        it('should generate link for bare url', () => {
            const expected = '[Click Me.](/some/link)';
            testModule.link('/some/link').should.equal(expected);
        });
        it('should generate link with blank link text', () => {
            const expected = '[Click Me.](/some/link)';
            testModule.link('/some/link', '').should.equal(expected);
        });
        it('should generate link with link text', () => {
            const expected = '[hi there](/some/link)';
            testModule.link('/some/link', 'hi there').should.equal(expected);
        });
    });
    describe('images', () => {
        it('should generate basic image', () => {
            const expected = '![a.png](/a.png "a.png")';
            testModule.image('/a.png').should.equal(expected);
        });
        it('should generate alt text and title text from url', () => {
            const expected = '![a.png](https://example.com/some/weird/path/a.png "a.png")';
            testModule.image('https://example.com/some/weird/path/a.png').should.equal(expected);
        });
        it('should include alt and title text', () => {
            const expected = '![some text](/a.png "some text")';
            testModule.image('/a.png', 'some text').should.equal(expected);
        });
        it('should sanitize alt and title text', () => {
            const expected = '![some "bad" text](/a.png "some bad text")';
            testModule.image('/a.png', 'some "bad" text').should.equal(expected);
        });
    });
    describe('spoilers', () => {
        it('should generate spoiler', () => {
            const expected = '<details><summary>SPOILER!</summary>they were dead all along</details>';
            testModule.spoiler('they were dead all along').should.equal(expected);
        });
        it('should generate spoilerwith title', () => {
            const expected = '<details><summary>surprise!</summary>they were dead all along</details>';
            testModule.spoiler('they were dead all along', 'surprise!').should.equal(expected);
        });
    });
});
