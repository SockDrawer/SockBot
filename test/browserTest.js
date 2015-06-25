'use strict';
/*globals describe, it, before, after*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon');
chai.should();
const expect = chai.expect;

// The thing we're testing
const browser = require('../browser');

describe('browser', () => {
    describe('exports', () => {
        const fns = [],
            objs = ['internals'],
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
    describe('internals', () => {
        const fns = ['queueWorker', 'requestComplete', 'request', 'cleanPost'],
            objs = ['defaults', 'queue'],
            vals = [];
        describe('should include expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(browser.internals[fn]).to.be.a('function'));
            });
        });
        describe('should include expected objects', () => {
            objs.forEach((obj) => {
                it(obj, () => (typeof browser.internals[obj]).should.equal('object'));
            });
        });
        describe('should include expected values', () => {
            vals.forEach((val) => {
                it(val, () => browser.internals.should.have.key(val));
            });
        });
        it('should include only expected keys', () => {
            browser.internals.should.have.all.keys(fns.concat(objs, vals));
        });
    });
    describe('queueWorker()', () => {
        const queueWorker = browser.internals.queueWorker,
            request = browser.internals.request;
        let clock;
        before(() => {
            clock = sinon.useFakeTimers();
        });
        it('should delay completion by five seconds to throttle requests', (done) => {
            browser.internals.request = (_, cb) => cb(null, null, '"foobar"');
            const spy = sinon.spy();
            queueWorker({}, spy);
            spy.called.should.be.false;
            clock.tick(5000);
            spy.called.should.be.true;
            done();
        });
        it('should select default callback delay when omitted', (done) => {
            browser.internals.request = (_, cb) => cb();
            const queueSpy = sinon.spy(),
                callbackSpy = sinon.spy();
            queueWorker({
                callback: callbackSpy
            }, queueSpy);
            clock.tick(0);
            queueSpy.called.should.be.false;
            callbackSpy.called.should.be.true;
            clock.tick(5000);
            queueSpy.called.should.be.true;
            done();
        });
        it('should select callback delay from task', (done) => {
            browser.internals.request = (_, cb) => cb();
            const queueSpy = sinon.spy(),
                callbackSpy = sinon.spy();
            queueWorker({
                callback: callbackSpy,
                delay: 1000
            }, queueSpy);
            clock.tick(0);
            queueSpy.called.should.be.false;
            callbackSpy.called.should.be.false;
            clock.tick(1000);
            callbackSpy.called.should.be.true;
            clock.tick(5000);
            queueSpy.called.should.be.true;
            done();
        });
        it('should accept invalid JSON', (done) => {
            browser.internals.request = (_, cb) => cb(null, null, '"foobar');
            const queueSpy = sinon.spy(),
                callbackSpy = sinon.spy();
            queueWorker({
                callback: callbackSpy
            }, queueSpy);
            clock.tick(0);
            queueSpy.called.should.be.false;
            callbackSpy.called.should.be.true;
            callbackSpy.lastCall.args.should.have.length(2);
            expect(callbackSpy.lastCall.args[0]).to.be.null;
            callbackSpy.lastCall.args[1].should.equal('"foobar');
            clock.tick(5000);
            queueSpy.called.should.be.true;
            done();
        });
        it('should pass errors to task.callback', (done) => {
            browser.internals.request = (_, cb) => cb('ERROR', null, null);
            const queueSpy = sinon.spy(),
                callbackSpy = sinon.spy();
            queueWorker({
                callback: callbackSpy
            }, queueSpy);
            clock.tick(0);
            callbackSpy.called.should.be.true;
            callbackSpy.lastCall.args.should.have.length(2);
            callbackSpy.lastCall.args[0].should.equal('ERROR');
            expect(callbackSpy.lastCall.args[1]).to.be.null;
            clock.tick(5000);
            queueSpy.called.should.be.true;
            done();
        });
        it('should use default method when omitted', (done) => {
            let req;
            browser.internals.request = (opts, cb) => {
                req = opts;
                cb();
            };
            const queueSpy = sinon.spy();
            queueWorker({}, queueSpy);
            clock.tick(5000);
            queueSpy.called.should.be.true;
            req.method.should.equal('GET');
            done();
        });
        it('should select method from task', (done) => {
            let req;
            browser.internals.request = (opts, cb) => {
                req = opts;
                cb();
            };
            const queueSpy = sinon.spy();
            queueWorker({
                method: 'FRED'
            }, queueSpy);
            clock.tick(5000);
            queueSpy.called.should.be.true;
            req.method.should.equal('FRED');
            done();
        });
        it('should select URL from task', (done) => {
            let req;
            browser.internals.request = (opts, cb) => {
                req = opts;
                cb();
            };
            const queueSpy = sinon.spy();
            queueWorker({
                url: 'http://example.com'
            }, queueSpy);
            clock.tick(5000);
            queueSpy.called.should.be.true;
            req.url.should.equal('http://example.com');
            done();
        });

        it('should select form from task', (done) => {
            const form = {
                a: 1,
                b: 2,
                c: 4,
                d: 3
            };
            let req;
            browser.internals.request = (opts, cb) => {
                req = opts;
                cb();
            };
            const queueSpy = sinon.spy();
            queueWorker({
                form: form
            }, queueSpy);
            clock.tick(5000);
            queueSpy.called.should.be.true;
            req.form.should.deep.equal(form);
            done();
        });
        after(() => {
            clock.restore();
            browser.internals.request = request;
        });
    });
    describe('documentation stubs', () => {
        const internals = browser.internals,
            stubs = ['requestComplete'];
        stubs.forEach((stub) => {
            it(stub + '() should be a stub function', () => internals[stub]());
        });
    });
    describe('internals.cleanPost()', () => {
        const cleanPost = browser.internals.cleanPost;
        it('should add `cleaned` attribute to input', () => {
            const post = {
                raw: 'hello!'
            };
            post.should.not.have.any.key('cleaned');
            cleanPost(post);
            post.should.have.any.key('cleaned');
        });
        it('should accept empty post', () => cleanPost({}).cleaned.should.equal(''));
        describe('should pass match to sample tests', () => {
            [
                ['Full quote empty', '[quote="accalia, post:108, topic:49440, full:true"][/quote]', ''],
                ['Full quote with text', '[quote="accalia, post:108, topic:49440, full:true"]\nthis is ' +
                    'a quote[/quote]', ''
                ],
                ['Full quote with multiline text', '[quote="accalia, post:108, topic:49440, full:true"]\r\n' +
                    'this is a quote\r\n\r\n[/quote]', ''
                ],
                ['Partial quote empty', '[quote="accalia, post:108, topic:49440"][/quote]', ''],
                ['Partial quote with text', '[quote="accalia, post:108, topic:49440"]this is a quote[/quote]', ''],
                ['Partial quote with multiline text', '[quote="accalia, post:108, topic:49440"]\n' +
                    'this is a quote [/quote]', ''
                ],
                ['Topic quote with multiline text', '[quote="accalia, post:108"]\nthis is a quote\n\r\n[/quote]', ''],
                ['Topic quote empty', '[quote="accalia, post:108"][/quote]', ''],
                ['Username quote empty', '[quote="accalia"][/quote]', ''],
                ['Username quote with text', '[quote="accalia"]this is a quote\r\n\r\n[/quote]', ''],
                ['Unquoted username quote empty', '[quote=accalia][/quote]', ''],
                ['Unquoted username quote', '[quote=accalia]this is a quote[/quote]', ''],
                ['Bare quote empty', '[quote][/quote]', ''],
                ['Bare quote', '[quote]\n\nthis is a quote[/quote]', ''],
                ['Only open quote', '[quote="accalia, post:108, topic:49440, full:true"]',
                    '[quote="accalia, post:108, topic:49440, full:true"]'
                ],
                ['Malformed open quote', '[quote="accalia, post:108, topic:49440, full:true"this is a quote[/quote]',
                    '[quote="accalia, post:108, topic:49440, full:true"this is a quote[/quote]'
                ],
                ['Malformed close quote', '[quote="accalia, post:108, topic:49440, full:true"]this is a quote/quote]',
                    '[quote="accalia, post:108, topic:49440, full:true"]this is a quote/quote]'
                ],
                ['Malformed close quote 2', '[quote="accalia, post:108, topic:49440"][/quote',
                    '[quote="accalia, post:108, topic:49440"][/quote'
                ],
                ['Malformed open quote 2', '[quote="accalia, post:108, topic:49440"]this is a quote [quote]',
                    '[quote="accalia, post:108, topic:49440"]this is a quote [quote]'
                ],
                ['Only close quote', '[/quote]', '[/quote]'],
                ['Malformed open quote 2', '[quoteaccalia, post:108"][/quote]', '[quoteaccalia, post:108"][/quote]'],
                ['Only a quote', '[quote=a]i am stripped[/quote]', ''],
                ['Embedded quote', 'this is\n[quote=accalia][/quote] \r\na quote', 'this is\n \na quote'],
                ['Nested quote simple', 'this[quote]nope[quote]no[/quote]nada[/quote] survives', 'this survives'],
                ['Unmatched quote block', 'i am not a [quote]', 'i am not a [quote]'],
                ['Unmatched quote in valid quote', 'this[quote]nope[quote]no[quote]nada[/quote] survives',
                    'this survives'
                ],
                ['Multiple quotes', '[quote="accalia, post:108, topic:49440, full:true"]\nthis is a quote[/quote] ' +
                    'inner words [quote="accalia, post:108, topic:49440, full:true"]\nthis is another quote[/quote]',
                    ' inner words '
                ],
                ['Multiple quotes 2', 'before words\n[quote="accalia, post:108, topic:49440, full:true"]\nthis is a ' +
                    'quote[/quote] inner words [quote="accalia, post:108, topic:49440, full:true"]\nthis is another ' +
                    'quote[/quote]\nafter words',
                    'before words\n inner words \nafter words'
                ],
                ['Only a GFM with embedded backticks', '```\n``\n```', ''],
                ['Empty Line in a GFM block', '```\n\n```', ''],
                ['Empty GFM block', '```\n```', ''],
                ['GFM with space for typehint', '``` \nfoo();\n```', ''],
                ['Only a GFM code block', '```\ncode\n```', ''],
                ['GFM with text before', 'before\n```\ncode\n```', 'before\n'],
                ['GFM with text before 2', 'before2\n```\ncode\n```\n', 'before2\n'],
                ['GFM with text between', '```\ncode\n```\nbetween\n```\ncode\n```', 'between\n'],
                ['GFM with text between 2', '```\ncode\n```\nbetween2\n```\ncode\n```\n', 'between2\n'],
                ['GFM with text after', '```\ncode\n```\nafter', 'after'],
                ['Only a type hinted GFM', '```type\ncode\n```', ''],
                ['GFM with unpaired tripletic', '```\ncode\n```\nnotcode\n```\n', 'notcode\n```\n'],
                ['GFM with before/after text', 'before\n```\n```\nafter', 'before\nafter'],
                ['Multiple GFM blocks', 'before\n```\n```\nmiddle\n```\nafter', 'before\nmiddle\n```\nafter'],
                ['Multiple GFM blocks 2', 'before\n```\n1\n```\nmiddle\n```\n2\n```\nafter', 'before\nmiddle\nafter'],
                ['GFM with trailing text', '```\n```test', '```\n```test'],
                ['GFM wit trailing space on close', '```\n``` ', '```\n``` '],
                ['GFM without line breaks', '```foo```', '```foo```'],
                ['GFM missing with close not on new line', '```\ntest();```', '```\ntest();```'],
                ['GFM with space before open', ' ```\ntest();\n```', ' ```\ntest();\n```'],
                ['Inline code block', 'this `is` code', 'this `is` code'],
                ['inline code block in quote', 'a[quote]`code`[/quote]b', 'ab'],
                ['Inline code with quote inside', '`[quote]a[/quote]`', '`[quote]a[/quote]`'],
                ['Not an inline code with quote "inside"', '`\n[quote][/quote]\n`', '`\n\n`']
            ].forEach((test) => {
                const name = test[0],
                    input = test[1],
                    expected = test[2];
                it('should handle: ' + name, () => cleanPost({
                    raw: input
                }).cleaned.should.equal(expected));
            });
        });
        describe('should normalize newlines', () => {
            [
                ['this is normal\r\n', 'this is normal\n'],
                ['this is normal\r\n\r\n', 'this is normal\n\n'],
                ['this\ris normal\r\n', 'this\nis normal\n'],
                ['this is\nnormal\r\n', 'this is\nnormal\n'],
                ['this\r\nis normal\r\n', 'this\nis normal\n']
            ].forEach((test) => {
                const input = test[0],
                    output = test[1];
                it('should correctly noprmalize: ' + JSON.stringify(input), () => {
                    const result = cleanPost({
                        raw: input
                    }).cleaned;
                    result.should.to.equal(output);
                });
            });
        });
        it('should strip GFM code blocks', () => cleanPost({
            raw: '```\ncode\n```\n'
        }).cleaned.should.to.equal(''));
        it('should strip quotes blocks', () => cleanPost({
            raw: '[quote]quoted[/quote]\n'
        }).cleaned.should.to.equal('\n'));
    });
});
