'use strict';
/*globals describe, it, before, after*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon');
chai.should();
const expect = chai.expect;

// The thing we're testing
const browser = require('../browser'),
    utils = require('../utils'),
    config = require('../config');

describe('browser', () => {
    describe('exports', () => {
        const fns = ['createPost'],
            objs = ['internals', 'trustLevels', 'stubs'],
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
        const fns = ['queueWorker', 'request', 'cleanPostRaw', 'setTrustLevel', 'setPostUrl', 'cleanPost'],
            objs = ['defaults', 'queue'],
            vals = ['signature'];
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
                it(val, () => browser.internals.should.have.any.key(val));
            });
        });
        it('should include only expected keys', () => {
            browser.internals.should.have.all.keys(fns.concat(objs, vals));
        });
    });
    describe('documentation stubs', () => {
        const stubs = browser.stubs;
        Object.keys(stubs).forEach((stub) => {
            it(stub + '() should be a stub function', () => stubs[stub]());
        });
    });
    describe('internals.queueWorker()', () => {
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
        it('should prefix default forum for relative URL', (done) => {
            let req;
            browser.internals.request = (opts, cb) => {
                req = opts;
                cb();
            };
            const queueSpy = sinon.spy();
            queueWorker({
                url: '/posts'
            }, queueSpy);
            clock.tick(5000);
            queueSpy.called.should.be.true;
            req.url.should.equal(config.config.core.forum + '/posts');
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
    describe('internals.cleanPost()', () => {
        const cleanPostRaw = browser.internals.cleanPostRaw;
        it('should add `cleaned` attribute to input', () => {
            const post = {
                raw: 'hello!'
            };
            post.should.not.have.any.key('cleaned');
            cleanPostRaw(post);
            post.should.have.any.key('cleaned');
        });
        it('should accept empty post', () => cleanPostRaw({}).cleaned.should.equal(''));
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
                ['GFM with trailing space on close', '```\n``` ', '```\n``` '],
                ['GFM without line breaks', '```foo```', '```foo```'],
                ['GFM missing with close not on new line', '```\ntest();```', '```\ntest();```'],
                ['GFM with space before open', ' ```\ntest();\n```', ' ```\ntest();\n```'],
                ['Inline code block', 'this `is` code', 'this `is` code'],
                ['inline code block in quote', 'a[quote]`code`[/quote]b', 'ab'],
                ['Inline code with quote inside', '`[quote]a[/quote]`', '`[quote]a[/quote]`'],
                ['Inline multiline code with quote inside', '`\n[quote][/quote]\n`', '`\n[quote][/quote]\n`'],
                ['Newline Normalization - windows single', 'this is normal\r\n', 'this is normal\n'],
                ['Newline Normalization - windows multiple', 'this is normal\r\n\r\n', 'this is normal\n\n'],
                ['Newline Normalization - mac', 'this\ris normal\r', 'this\nis normal\n'],
                ['Newline normalization - mixed', 'this\ris\nnormal\r\n', 'this\nis\nnormal\n'],
                ['Newline Normalization - windows multiple 2', 'this\r\nis normal\r\n', 'this\nis normal\n'],
                ['One backtick around code', 'One backtick around `code`', 'One backtick around `code`'],
                ['Bare quote in inline code', '`[quote][/quote]`', '`[quote][/quote]`'],
                ['Bare quote with backtick', '`[quote][/quote]', '`'],
                ['"inline" code on multiline', 'a `code\ncode` b', 'a `code\ncode` b'],
                ['multiline inline code', '`\ncode\n`', '`\ncode\n`'],
                ['multiline with aftertext', '`name\ncode`\ntext', '`name\ncode`\ntext'],
                ['double backtick inline code', '``inline code``', '``inline code``'],
                ['double backtick with quote', '``[quote][/quote]``', '``[quote][/quote]``'],
                ['inline code before quote', '``code``[quote][/quote]``', '``code````'],
                ['double backtick with embedded singletick', ' ``code with ` embedded``', ' ``code with ` embedded``'],
                ['double backtick with embedded singletick and quote', ' `` ` [quote][/quote] ``',
                    ' `` ` [quote][/quote] ``'
                ],
                ['multiline double backtick', 'before ``code\ncode2`` after', 'before ``code\ncode2`` after'],
                ['multiline double backtick with quote',
                    'before ``[quote]\n[/quote]`` after',
                    'before ``[quote]\n[/quote]`` after'
                ],
                ['multiline double backtick 2', 'before ``\ncode\ncode2\n`` after', 'before ``\ncode\ncode2\n`` after'],
                ['multiline double backtick with quote 2',
                    'before ``\n[quote]\n[/quote]\n`` after',
                    'before ``\n[quote]\n[/quote]\n`` after'
                ],
                ['multiline double backtick 3', 'before ``javascript\ncode\ncode2\n`` after',
                    'before ``javascript\ncode\ncode2\n`` after'
                ],
                ['multiline double backtick with quote 3',
                    'before ``javascript\n[quote]\n[/quote]\n`` after',
                    'before ``javascript\n[quote]\n[/quote]\n`` after'
                ],
                ['inline triple backtick', '```code```', '```code```'],
                ['inline triple backtick with quote',
                    '```[quote][/quote]```',
                    '```[quote][/quote]```'
                ],
                ['inline triple backtick with singletick', '```code with ` embedded```', '```code with ` embedded```'],
                ['inline triple backtick with doubletick', '```code with `` embedded```',
                    '```code with `` embedded```'
                ],
                ['inline triple backtick with linebreak', '```code with\nlinebreak```', '```code with\nlinebreak```'],
                ['inline triple backtick with singletick and quote',
                    '```code with ` [quote][/quote]embedded```',
                    '```code with ` [quote][/quote]embedded```'
                ],
                ['inline triple backtick with doubletick and quote',
                    '```code with `` [quote][/quote]embedded```',
                    '```code with `` [quote][/quote]embedded```'
                ],
                ['inline triple backtick with linebreak and quote',
                    '```code with\n[quote][/quote]linebreak```',
                    '```code with\n[quote][/quote]linebreak```'
                ],
                ['tripletick with embedded tripletick', '```\ncode```\n```', ''],
                ['language hinted tripletick with embedded tripletick', '```ruby\ncode```\n```', ''],
                ['quadruple tick', '````code````', '````code````'],
                ['quadruple tick with singletick', '````code ` code2````', '````code ` code2````'],
                ['quadruple tick with doubletick', '````code `` code2````', '````code `` code2````'],
                ['quadruple tick with tripletick', '````code ``` code2````', '````code ``` code2````'],
                ['quadruple tick with newline', '````code\ncode2````', '````code\ncode2````'],
                ['quadruple tick with quote', '````code````', '````code````'],
                ['quadruple tick with singletick and quote',
                    '````code ` [quote][/quote]code2````',
                    '````code ` [quote][/quote]code2````'
                ],
                ['quadruple tick with doubletick and quote',
                    '````code `` [quote][/quote]code2````',
                    '````code `` [quote][/quote]code2````'
                ],
                ['quadruple tick with tripletick and quote',
                    '````code ``` [quote][/quote]code2````',
                    '````code ``` [quote][/quote]code2````'
                ],
                ['quadruple tick with newline and quote',
                    '````code\n[quote][/quote]code2````',
                    '````code\n[quote][/quote]code2````'
                ],
                ['Inline code before multiline quote',
                    '``code``[quote]\n[/quote]``',
                    '``code````'
                ],
                ['Bogus GFM fence creation hazard',
                    '`\ncode\n`[quote=zippy]Yow!\n[/quote]``\ncode\n``\ntext\n' +
                    '``\ncode\n``[quote=zippy]Are we having fun yet?\n[/quote]`\ncode\n`\ntext\n',
                    '`\ncode\n` ``\ncode\n``\ntext\n' +
                    '``\ncode\n`` `\ncode\n`\ntext\n'
                ],
                ['Greedy GFM fence',
                    '````befunge\ncode\n```\nstill code\n```\nmore code\n```\ntext',
                    'text'
                ],
                ['GFM fence with leading and internal quotes',
                    '[quote]Yow![/quote]```INTERCAL\nPLEASE DO [quote]FAIL[/quote]\n```',
                    ''
                ]
            ].forEach((test) => {
                const name = test[0],
                    input = test[1],
                    expected = test[2];
                it(name, () => cleanPostRaw({
                    raw: input
                }).cleaned.should.equal(expected));
            });
        });
    });
    describe('internals.setTrustLevel()', () => {
        /*eslint-disable camelcase */
        const setTrustLevel = browser.internals.setTrustLevel,
            trust = browser.trustLevels,
            normalLevels = [trust.tl0, trust.tl1, trust.tl2, trust.tl3, trust.tl4];
        describe('normal user trust levels', () => {
            Object.keys(trust).forEach((trustLevel) => {
                const post = {
                    username: 'trustLevel' + trustLevel,
                    trust_level: trust[trustLevel],
                    staff: false,
                    admin: false,
                    moderator: false
                };
                it('should maintain trust_level ' + trustLevel, () => {
                    setTrustLevel(post).trust_level.should.equal(trust[trustLevel]);
                });
            });
        });
        describe('ignored users', () => {
            normalLevels.forEach((trustLevel) => {
                const post = {
                    username: 'PaulaBean', // Paula is ignored by default
                    trust_level: trustLevel,
                    staff: false,
                    admin: false,
                    moderator: false
                };
                it('should set to ignored trust_level for tl' + trustLevel, () => {
                    setTrustLevel(post).trust_level.should.equal(trust.ignored);
                });
            });
        });
        describe('staff users', () => {
            normalLevels.forEach((trustLevel) => {
                const post = {
                    username: 'trustLevel' + trustLevel,
                    trust_level: trustLevel,
                    staff: true,
                    admin: false,
                    moderator: false
                };
                it('should set to staff trust_level for staff tl' + trustLevel, () => {
                    setTrustLevel(post).trust_level.should.equal(trust.staff);
                });
            });
        });
        describe('moderator users', () => {
            normalLevels.forEach((trustLevel) => {
                const post = {
                    username: 'trustLevel' + trustLevel,
                    trust_level: trustLevel,
                    staff: false,
                    admin: false,
                    moderator: true
                };
                it('should set to moderator trust_level for moderator tl' + trustLevel, () => {
                    setTrustLevel(post).trust_level.should.equal(trust.moderator);
                });
            });
        });
        describe('admin users', () => {
            normalLevels.forEach((trustLevel) => {
                const post = {
                    username: 'trustLevel' + trustLevel,
                    trust_level: trustLevel,
                    staff: false,
                    admin: true,
                    moderator: false
                };
                it('should set to admin trust_level for admin tl' + trustLevel, () => {
                    setTrustLevel(post).trust_level.should.equal(trust.admin);
                });
            });
        });
        describe('owner users', () => {
            normalLevels.forEach((trustLevel) => {
                const post = {
                    username: 'accalia', //accalia is default owner
                    trust_level: trustLevel,
                    staff: false,
                    admin: false,
                    moderator: false
                };
                it('should set to owner trust_level for owner tl' + trustLevel, () => {
                    setTrustLevel(post).trust_level.should.equal(trust.owner);
                });
            });
        });
        describe('trust hierarchy ', () => {
            it('Owner status should trump Admin flag', () => {
                const post = {
                    username: 'accalia', //accalia is default owner
                    trust_level: trust.tl3,
                    staff: false,
                    admin: true,
                    moderator: false
                };
                setTrustLevel(post).trust_level.should.equal(trust.owner);
            });
            it('Owner status should trump Moderator flag', () => {
                const post = {
                    username: 'accalia', //accalia is default owner
                    trust_level: trust.tl3,
                    staff: false,
                    admin: false,
                    moderator: true
                };
                setTrustLevel(post).trust_level.should.equal(trust.owner);
            });
            it('Owner status should trump staff flag', () => {
                const post = {
                    username: 'accalia', //accalia is default owner
                    trust_level: trust.tl3,
                    staff: true,
                    admin: false,
                    moderator: false
                };
                setTrustLevel(post).trust_level.should.equal(trust.owner);
            });
            it('Admin status should trump Moderator flag', () => {
                const post = {
                    username: 'admin',
                    trust_level: trust.tl3,
                    staff: false,
                    admin: true,
                    moderator: true
                };
                setTrustLevel(post).trust_level.should.equal(trust.admin);
            });
            it('Admin status should trump Staff flag', () => {
                const post = {
                    username: 'admin',
                    trust_level: trust.tl3,
                    staff: true,
                    admin: true,
                    moderator: false
                };
                setTrustLevel(post).trust_level.should.equal(trust.admin);
            });
            it('Moderator status should trump Staff flag', () => {
                const post = {
                    username: 'moderator',
                    trust_level: trust.tl3,
                    staff: true,
                    admin: false,
                    moderator: true
                };
                setTrustLevel(post).trust_level.should.equal(trust.moderator);
            });
            it('Should not ignore Admin', () => {
                const post = {
                    username: 'PaulaBean',
                    trust_level: trust.tl3,
                    staff: false,
                    admin: true,
                    moderator: false
                };
                setTrustLevel(post).trust_level.should.equal(trust.admin);
            });
            it('Should not ignore Moderator', () => {
                const post = {
                    username: 'PaulaBean',
                    trust_level: trust.tl3,
                    staff: false,
                    admin: false,
                    moderator: true
                };
                setTrustLevel(post).trust_level.should.equal(trust.moderator);
            });
            it('Should not ignore Staff', () => {
                const post = {
                    username: 'PaulaBean',
                    trust_level: trust.tl3,
                    staff: true,
                    admin: false,
                    moderator: false
                };
                setTrustLevel(post).trust_level.should.equal(trust.staff);
            });
        });
        /*eslint-enable camelcase */
    });
    describe('internals.setPostUrl()', () => {
        const setPostUrl = browser.internals.setPostUrl;
        describe('it adds expected keys to post', () => {
            ['url', 'reply_to'].forEach((key) => {
                it(': adds ' + key, () => {
                    const post = {
                        'topic_slug': 'topic',
                        'topic_id': 1000,
                        'post_number': 42
                    };
                    setPostUrl(post).should.have.any.key(key);
                });
            });
        });
        it('should return updated post', () => {
            const post = {
                    'topic_slug': 'topic',
                    'topic_id': 1000,
                    'post_number': 42
                },
                expected = utils.mergeObjects({
                    url: 'https://what.thedailywtf.com/t/topic/1000/42',
                    'reply_to': 'https://what.thedailywtf.com/t/topic/1000/'
                }, post);
            setPostUrl(post).should.deep.equal(expected);
        });
        it('should update post in place', () => {
            const post = {
                    'topic_slug': 'topic',
                    'topic_id': 1000,
                    'post_number': 42
                },
                expected = utils.mergeObjects({
                    url: 'https://what.thedailywtf.com/t/topic/1000/42',
                    'reply_to': 'https://what.thedailywtf.com/t/topic/1000/'
                }, post);
            setPostUrl(post);
            post.should.deep.equal(expected);
        });
        it('should set URL for post', () => {
            const post = {
                    'topic_slug': 'cipot',
                    'topic_id': 1234,
                    'post_number': 4243
                },
                expected = 'https://what.thedailywtf.com/t/cipot/1234/4243';
            setPostUrl(post).url.should.deep.equal(expected);
        });
        it('should set reply for non reply post', () => {
            const post = {
                    'topic_slug': 'cipot',
                    'topic_id': 1234,
                    'post_number': 4243
                },
                expected = 'https://what.thedailywtf.com/t/cipot/1234/';
            setPostUrl(post).reply_to.should.deep.equal(expected);
        });
        it('should set reply for reply post', () => {
            const post = {
                    'topic_slug': 'cipot',
                    'topic_id': 1234,
                    'post_number': 4243,
                    'reply_to_post_number': 17
                },
                expected = 'https://what.thedailywtf.com/t/cipot/1234/17';
            setPostUrl(post).reply_to.should.deep.equal(expected);
        });
    });
    describe('internals.cleanPost()', () => {
        const cleanPost = browser.internals.cleanPost;
        it('should modify post in place', () => {
            const post = {
                'raw': 'this is passing'
            };
            post.should.not.have.any.key('cleaned');
            cleanPost(post);
            post.should.have.any.key('cleaned');
        });
        it('should return updated post', () => {
            const post = {
                'raw': 'this is passing'
            };
            cleanPost(post).should.equal(post);
        });
        it('should use cleanPostRaw()', () => {
            const post = {
                    'raw': 'this is [quote]not[/quote]passing'
                },
                expected = 'this is passing';
            post.should.not.have.any.key('cleaned');
            cleanPost(post);
            post.should.have.any.key('cleaned');
            post.cleaned.should.equal(expected);
        });
        it('should use setTrustLevel()', () => {
            const post = {
                admin: true,
                'trust_level': browser.trustLevels.tl2
            };
            cleanPost(post);
            post.trust_level.should.equal(browser.trustLevels.admin);
        });
        it('should use setPostUrl()', () => {
            const post = {
                    'topic_slug': 'topic',
                    'topic_id': 1234,
                    'post_number': 17
                },
                expected = 'https://what.thedailywtf.com/t/topic/1234/17';
            post.should.not.have.any.key('url');
            cleanPost(post);
            post.should.have.any.key('url');
            post.url.should.deep.equal(expected);
        });
        it('should handle empty post object', () => {
            const post = {};
            expect(() => cleanPost(post)).to.not.throw();
            post.should.have.any.key('cleaned');
        });
    });
    describe('createPost()', () => {
        const queue = browser.internals.queue;
        before(() => sinon.stub(queue, 'push'));
        it('should accept four parameters version', () => {
            queue.push.reset();
            browser.createPost(1, 2, '', () => 0);
            queue.push.called.should.be.true;
        });
        it('should accept three parameters version', () => {
            queue.push.reset();
            browser.createPost(1, '', () => 0);
            queue.push.called.should.be.true;
        });
        it('should reject four parameters version with no callback', () => {
            queue.push.reset();
            expect(() => browser.createPost(1, 2, '', null)).to.throw('callback must be supplied');
            queue.push.called.should.be.false;
        });
        it('should reject three parameters version with no callback', () => {
            queue.push.reset();
            expect(() => browser.createPost(1, 2, '')).to.throw('callback must be supplied');
            queue.push.called.should.be.false;
        });
        it('should set http method to POST', () => {
            queue.push.reset();
            browser.createPost(100, '', () => 0);
            const args = queue.push.lastCall.args;
            args.should.have.length(1);
            args[0].should.have.any.key('method');
            args[0].method.should.equal('POST');
        });
        it('should set url', () => {
            queue.push.reset();
            browser.createPost(100, '', () => 0);
            const args = queue.push.lastCall.args;
            args.should.have.length(1);
            args[0].should.have.any.key('url');
            args[0].url.should.equal('/posts');
        });
        it('should set form', () => {
            queue.push.reset();
            browser.createPost(100, '', () => 0);
            const args = queue.push.lastCall.args;
            args.should.have.length(1);
            args[0].should.have.any.key('form');
            args[0].form.should.be.a('object');
        });
        it('should set callback', () => {
            queue.push.reset();
            browser.createPost(100, '', () => 0);
            const args = queue.push.lastCall.args;
            args.should.have.length(1);
            args[0].should.have.any.key('callback');
            args[0].callback.should.be.a('function');
        });
        describe('form', () => {
            it('should set `raw`', () => {
                queue.push.reset();
                browser.internals.signature = '\nthis is my signature';
                browser.createPost(100, 'i have content', () => 0);
                const form = queue.push.lastCall.args[0].form;
                form.should.have.any.key('raw');
                form.raw.should.equal('i have content\nthis is my signature');
            });
            it('should set `topic_id`', () => {
                queue.push.reset();
                browser.createPost(100, '', () => 0);
                const form = queue.push.lastCall.args[0].form;
                form.should.have.any.key('topic_id');
                form.topic_id.should.equal(100);
            });
            it('should set `is_warning`', () => {
                queue.push.reset();
                browser.createPost(100, '', () => 0);
                const form = queue.push.lastCall.args[0].form;
                form.should.have.any.key('is_warning');
                form.is_warning.should.equal(false);
            });
            it('should set `reply_to_post_number`', () => {
                queue.push.reset();
                browser.createPost(100, 42, '', () => 0);
                const form = queue.push.lastCall.args[0].form;
                form.should.have.any.key('reply_to_post_number');
                form.reply_to_post_number.should.equal(42);
            });
            it('should set `category`', () => {
                queue.push.reset();
                browser.createPost(100, '', () => 0);
                const form = queue.push.lastCall.args[0].form;
                form.should.have.any.key('category');
                form.category.should.equal('');
            });
            it('should set `archetype`', () => {
                queue.push.reset();
                browser.createPost(100, '', () => 0);
                const form = queue.push.lastCall.args[0].form;
                form.should.have.any.key('archetype');
                form.archetype.should.equal('regular');
            });
            it('should set `auto_close_time`', () => {
                queue.push.reset();
                browser.createPost(100, '', () => 0);
                const form = queue.push.lastCall.args[0].form;
                form.should.have.any.key('auto_close_time');
                form.auto_close_time.should.equal('');
            });
        });
        it('should pass err to external callback on completion', () => {
            queue.push.reset();
            queue.push.yieldsTo('callback', new Error('test error!'));
            const spy = sinon.spy();
            browser.createPost(100, '', spy);
            spy.called.should.be.true;
            spy.lastCall.args.should.have.length(1);
            spy.lastCall.args[0].should.be.an.instanceOf(Error);
        });
        it('should pass post to external callback on completion', () => {
            queue.push.reset();
            queue.push.yieldsTo('callback', null, {});
            const spy = sinon.spy();
            browser.createPost(100, '', spy);
            spy.called.should.be.true;
            spy.lastCall.args.should.have.length(2);
            expect(spy.lastCall.args[0]).to.equal(null);
            // cleanPost should have been called, adding these keys
            spy.lastCall.args[1].should.have.keys('cleaned', 'url', 'reply_to');
        });
        after(() => queue.push.restore());
    });
});
