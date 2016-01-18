'use strict';
/*globals describe, it, beforeEach, afterEach*/

const sinon = require('sinon'),
    chai = require('chai');
chai.should();
const expect = chai.expect;

// The thing we're testing
const summoner = require('../../plugins/summoner'),
    utils = require('../../lib/utils');
const dummyCfg = {
    mergeObjects: utils.mergeObjects
};

describe('summoner plugin', () => {
    describe('exports', () => {
        const fns = ['mentionHandler', 'prepare', 'start', 'stop'],
            objs = ['internals', 'defaultConfig'];
        fns.forEach(fn => it('should export ' + fn + '()', () => {
            expect(summoner[fn]).to.be.a('function');
        }));
        objs.forEach(obj => it('should export ' + obj, () => {
            expect(summoner[obj]).to.be.an('object');
        }));
        it('should only export expected keys', () => {
            summoner.should.have.all.keys(fns.concat(objs));
        });
    });
    describe('start()', () => {
        it('should be a stub function', () => {
            summoner.start();
        });
    });
    describe('stop()', () => {
        it('should be a stub function', () => {
            summoner.stop();
        });
    });
    describe('prepare()', () => {
        let sandbox, events;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(dummyCfg, 'mergeObjects');
            events = {
                onNotification: sinon.spy(),
                registerHelp: sinon.spy()
            };
        });
        afterEach(() => sandbox.restore());
        it('should set browser', () => {
            const browser = {};
            summoner.prepare(null, dummyCfg, events, browser);
            expect(summoner.internals.browser).to.equal(browser);
        });
        it('should register for mentioned notification', () => {
            summoner.prepare(null, dummyCfg, events, null);
            events.onNotification.calledWith('mentioned', summoner.mentionHandler).should.be.true;
        });
        it('should use provided object config', () => {
            const config = {};
            summoner.prepare(config, dummyCfg, events, undefined);
            dummyCfg.mergeObjects.firstCall.args[0].should.be.true;
            dummyCfg.mergeObjects.firstCall.args[1].should.equal(summoner.defaultConfig);
            dummyCfg.mergeObjects.firstCall.args[2].should.equal(config);
        });
        it('should accept array config', () => {
            const config = ['this is a config'],
                expected = {
                    messages: config
                };
            summoner.prepare(config, dummyCfg, events, undefined);
            dummyCfg.mergeObjects.firstCall.args[0].should.be.true;
            dummyCfg.mergeObjects.firstCall.args[1].should.equal(summoner.defaultConfig);
            dummyCfg.mergeObjects.firstCall.args[2].should.deep.equal(expected);
        });
        it('should accept full config', () => {
            const config = {
                    cooldown: 1000,
                    messages: ['this is a config']
                },
                expected = {
                    cooldown: 1000,
                    messages: ['this is a config']
                };
            summoner.prepare(config, dummyCfg, events, undefined);
            dummyCfg.mergeObjects.firstCall.args[0].should.be.true;
            dummyCfg.mergeObjects.firstCall.args[1].should.equal(summoner.defaultConfig);
            dummyCfg.mergeObjects.firstCall.args[2].should.deep.equal(expected);
        });
        describe('non object configuration', () => {
            [null, undefined, 0, 3.14, true, false, 'string', () => 0].forEach((config) => {
                it('should use default config for: ' + config, () => {
                    summoner.prepare(config, dummyCfg, events, undefined);
                    dummyCfg.mergeObjects.firstCall.args[0].should.be.true;
                    dummyCfg.mergeObjects.firstCall.args[1].should.equal(summoner.defaultConfig);
                    dummyCfg.mergeObjects.firstCall.args[2].should.deep.equal({});
                });
            });
        });
        it('should register extended help', () => {
            summoner.prepare({}, dummyCfg, events);
            events.registerHelp.calledWith('summoner', summoner.internals.extendedHelp).should.be.true;
            expect(events.registerHelp.firstCall.args[2]).to.be.a('function');
            expect(events.registerHelp.firstCall.args[2]()).to.equal(0);
        });
    });
    describe('mentionHandler()', () => {
        let sandbox, browser, topic, post;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.useFakeTimers();
            sandbox.spy(Math, 'random');
            browser = {
                createPost: sinon.spy()
            };
            summoner.internals.browser = browser;
            summoner.internals.configuration = JSON.parse(JSON.stringify(summoner.defaultConfig));
            topic = {
                id: 314
            };
            post = {
                post_number: 456 //eslint-disable-line camelcase
            };
            summoner.internals.timeouts = {};
        });
        afterEach(() => sandbox.restore());
        it('should reply to triggering topic', () => {
            const topicid = Math.random();
            topic.id = topicid;
            summoner.mentionHandler(undefined, topic, post);
            browser.createPost.calledWith(topicid).should.be.true;
        });
        it('should reply to triggering post', () => {
            const postnumber = Math.random();
            post.post_number = postnumber; //eslint-disable-line camelcase
            summoner.mentionHandler(undefined, topic, post);
            browser.createPost.calledWith(topic.id, postnumber).should.be.true;
        });
        it('should reply with expected text', () => {
            const text = 'foo';
            summoner.internals.configuration.messages = [text];
            summoner.mentionHandler(undefined, topic, post);
            browser.createPost.calledWith(topic.id, post.post_number, text).should.be.true;
        });
        it('should reply with callback', () => {
            summoner.mentionHandler(undefined, topic, post);
            const callback = browser.createPost.firstCall.args[3];
            expect(callback).to.be.a('function');
            callback().should.equal(0);
        });
        describe('thread timeouts', () => {
            it('should set topic timeout on proper trigger', () => {
                sandbox.clock.tick(1e9 * Math.random());
                const now = Date.now();
                topic.id = Math.random() + '';
                summoner.mentionHandler(undefined, topic, post);
                summoner.internals.timeouts.should.have.key(topic.id);
                summoner.internals.timeouts[topic.id].should.equal(summoner.internals.configuration.cooldown + now);
            });
            it('should accept topic that has never been summoned', () => {
                summoner.mentionHandler(undefined, topic, post);
                // If timeout check passes random will be called
                Math.random.called.should.be.true;
            });
            it('should accept topic that is not on cooldown', () => {
                const now = Date.now();
                sandbox.clock.tick(4 * 60 * 60 * 1000);
                summoner.internals.timeouts[topic.id] = now;
                summoner.mentionHandler(undefined, topic, post);
                Math.random.called.should.be.true;
            });
            it('should accept topic that is coming off cooldown now', () => {
                sandbox.clock.tick(4 * 60 * 60 * 1000);
                const now = Date.now();
                summoner.internals.timeouts[topic.id] = now;
                summoner.mentionHandler(undefined, topic, post);
                Math.random.called.should.be.true;
            });
            it('should reject topic that is on cooldown', () => {
                sandbox.clock.tick(4 * 60 * 60 * 1000);
                const now = Date.now();
                summoner.internals.timeouts[topic.id] = now + 45 * 1000;
                summoner.mentionHandler(undefined, topic, post);
                Math.random.called.should.be.false;
            });
            it('should reject topic that is about to exit cooldown', () => {
                sandbox.clock.tick(4 * 60 * 60 * 1000);
                const now = Date.now();
                summoner.internals.timeouts[topic.id] = now + 1;
                summoner.mentionHandler(undefined, topic, post);
                Math.random.called.should.be.false;
            });
        });
        describe('@mention replacement', () => {
            it('should prevent @mention in input text', () => {
                const expected = '<a class="mention">@&zwj;mention</a>';
                summoner.internals.configuration.messages = ['@mention'];
                summoner.mentionHandler(undefined, topic, post);
                const text = browser.createPost.firstCall.args[2];
                text.should.equal(expected);
            });
            it('should prevent @mention at beginning of input text', () => {
                const expected = '<a class="mention">@&zwj;mention</a> is foo';
                summoner.internals.configuration.messages = ['@mention is foo'];
                summoner.mentionHandler(undefined, topic, post);
                const text = browser.createPost.firstCall.args[2];
                text.should.equal(expected);
            });
            it('should prevent @mention at end of input text', () => {
                const expected = 'foo is <a class="mention">@&zwj;mention</a>';
                summoner.internals.configuration.messages = ['foo is @mention'];
                summoner.mentionHandler(undefined, topic, post);
                const text = browser.createPost.firstCall.args[2];
                text.should.equal(expected);
            });
            it('should prevent @mention embedded in input text', () => {
                const expected = 'foo is <a class="mention">@&zwj;mention</a> is foo';
                summoner.internals.configuration.messages = ['foo is @mention is foo'];
                summoner.mentionHandler(undefined, topic, post);
                const text = browser.createPost.firstCall.args[2];
                text.should.equal(expected);
            });
            it('should prevent quoted @mention', () => {
                const expected = 'foo is \'<a class="mention">@&zwj;mention</a>\' is foo';
                summoner.internals.configuration.messages = ['foo is \'@mention\' is foo'];
                summoner.mentionHandler(undefined, topic, post);
                const text = browser.createPost.firstCall.args[2];
                text.should.equal(expected);
            });
            it('should prevent double quoted @mention', () => {
                const expected = 'foo is "<a class="mention">@&zwj;mention</a>" is foo';
                summoner.internals.configuration.messages = ['foo is "@mention" is foo'];
                summoner.mentionHandler(undefined, topic, post);
                const text = browser.createPost.firstCall.args[2];
                text.should.equal(expected);
            });
            it('should prevent @mention at end of sentence', () => {
                const expected = 'foo is <a class="mention">@&zwj;mention</a>. is foo';
                summoner.internals.configuration.messages = ['foo is @mention. is foo'];
                summoner.mentionHandler(undefined, topic, post);
                const text = browser.createPost.firstCall.args[2];
                text.should.equal(expected);
            });
            it('should prevent @mention with punctuation', () => {
                const expected = 'foo is <a class="mention">@&zwj;mention</a>, is foo';
                summoner.internals.configuration.messages = ['foo is @mention, is foo'];
                summoner.mentionHandler(undefined, topic, post);
                const text = browser.createPost.firstCall.args[2];
                text.should.equal(expected);
            });
            it('should not munge email address', () => {
                const expected = 'foo is foo@example.com';
                summoner.internals.configuration.messages = ['foo is foo@example.com'];
                summoner.mentionHandler(undefined, topic, post);
                const text = browser.createPost.firstCall.args[2];
                text.should.equal(expected);
            });
        });
        describe('post value replacements', () => {
            it('should not strip replacements that do not key into the post', () => {
                const expected = '%notakey%';
                summoner.internals.configuration.messages = ['%notakey%'];
                summoner.mentionHandler(undefined, topic, post);
                const text = browser.createPost.firstCall.args[2];
                text.should.equal(expected);
            });
            it('should not use replacements where key contains spaces', () => {
                const expected = '%not a key%';
                summoner.internals.configuration.messages = ['%not a key%'];
                post['not a key'] = 'foobar';
                summoner.mentionHandler(undefined, topic, post);
                const text = browser.createPost.firstCall.args[2];
                text.should.equal(expected);
            });
            it('should not replacements in replacement text', () => {
                const expected = '%value%';
                summoner.internals.configuration.messages = ['%key%'];
                post.key = '%value%';
                post.value = 'foobar';
                summoner.mentionHandler(undefined, topic, post);
                const text = browser.createPost.firstCall.args[2];
                text.should.equal(expected);
            });
            it('should suppress mention in replacement text', () => {
                const expected = '<a class="mention">@&zwj;mention</a>';
                summoner.internals.configuration.messages = ['%key%'];
                post.key = '@mention';
                summoner.mentionHandler(undefined, topic, post);
                const text = browser.createPost.firstCall.args[2];
                text.should.equal(expected);
            });
            it('should stringify complex replacement objects', () => {
                const expected = '{"foo":"bar"}';
                summoner.internals.configuration.messages = ['%key%'];
                post.key = {
                    foo: 'bar'
                };
                summoner.mentionHandler(undefined, topic, post);
                const text = browser.createPost.firstCall.args[2];
                text.should.equal(expected);
            });
        });
    });
});
