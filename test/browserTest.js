'use strict';
/*globals describe, it, before, beforeEach, after, afterEach*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon'),
    async = require('async'),
    packageInfo = require('../package.json');
chai.should();
const expect = chai.expect;

// The thing we're testing
const browserModule = require('../browser'),
    utils = require('../utils'),
    config = require('../config'),
    PostBuffer = require('../classes/PostBuffer');
const coreBrowser = browserModule.internals.core,
    pluginBrowser = browserModule.internals.plugins;

describe('browser', () => {
    beforeEach(() => browserModule.internals.current = coreBrowser);
    describe('exports', () => {
        const objs = ['internals', 'externals', 'privateFns'];
        describe('should export expected objects', () => {
            objs.forEach((obj) => {
                it(obj, () => expect(browserModule[obj]).to.be.a('object'));
            });
        });
        it('should export only expected keys', () => {
            browserModule.should.have.all.keys(objs);
        });
        it('should be a function', () => {
            browserModule.should.be.a('function');
        });
        it('should return current browser', () => {
            browserModule.internals.current = Math.random();
            browserModule().should.equal(browserModule.internals.current);
        });
    });
    describe('internals', () => {
        const fns = ['request'],
            objs = ['core', 'plugins', 'current', 'defaults', 'coreQueue', 'pluginQueue'],
            vals = ['signature', 'postBufferDelay', 'postSeparator'],
            nulls = ['postBuffer'];
        describe('should include expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(browserModule.internals[fn]).to.be.a('function'));
            });
        });
        describe('should include expected objects', () => {
            objs.forEach((obj) => {
                it(obj, () => expect(browserModule.internals[obj]).to.be.a('object'));
            });
        });
        describe('should include expected values', () => {
            vals.forEach((val) => {
                it(val, () => expect(browserModule.internals[val]).to.not.be.undefined);
            });
        });
        describe('should include expected nulls', () => {
            nulls.forEach((val) => {
                it(val, () => expect(browserModule.internals[val]).to.be.null);
            });
        });
        it('should include only expected keys', () => {
            browserModule.internals.should.have.all.keys(fns.concat(objs, vals, nulls));
        });
    });
    describe('core mode', () => {
        const externalKeys = Object.keys(browserModule.externals);
        it('should expose expected keys', () => {
            coreBrowser.should.have.all.keys(externalKeys.concat(['setCore', 'setPlugins', 'prepare',
                'start', 'stop'
            ]));

        });
        describe('non-function keys', () => {
            externalKeys.forEach((key) => {
                if (typeof browserModule.externals[key] === 'function') {
                    return;
                }
                it('should copy externals object: ' + key, () => {
                    coreBrowser[key].should.equal(browserModule.externals[key]);
                });
            });
        });
        describe('function keys', () => {
            externalKeys.forEach((key) => {
                if (typeof browserModule.externals[key] !== 'function') {
                    return;
                }
                it('should wrap externals function: ' + key, () => {
                    sinon.stub(browserModule.externals, key);
                    coreBrowser[key].should.not.equal(browserModule.externals[key]);
                    coreBrowser[key]();
                    browserModule.externals[key].called.should.be.true;
                    browserModule.externals[key].lastCall.thisValue.should.equal(browserModule.internals.coreQueue);
                    browserModule.externals[key].restore();
                });
            });
        });
        it('should set core mode', () => {
            coreBrowser.setCore().should.equal(coreBrowser);
            browserModule.internals.current.should.equal(coreBrowser);
        });
        it('should set plugin mode', () => {
            coreBrowser.setPlugins().should.equal(pluginBrowser);
            browserModule.internals.current.should.equal(pluginBrowser);
        });
        describe('prepare()', () => {
            it('should call providec callback when complete', () => {
                const spy = sinon.spy();
                coreBrowser.prepare({}, spy);
                spy.calledWith(null).should.be.true;
            });
        });
        describe('start()', () => {
            const ua = browserModule.internals.defaults.headers['User-Agent'];
            beforeEach(() => {
                browserModule.internals.defaults.headers['User-Agent'] = ua;
            });
            it('should update useragent', () => {
                config.core.username = 'bob';
                config.core.owner = 'joe';
                const expected = 'SockBot/' + packageInfo.version + ' (' + packageInfo.releaseName
                    + '; owner:joe; user:bob)';
                coreBrowser.start();
                browserModule.internals.defaults.headers['User-Agent'].should.equal(expected);
            });
            it('should update signature', () => {
                config.core.username = 'fred';
                config.core.owner = 'billy';
                const expected = '\n\n<!-- SockBot/' + packageInfo.version + ' (' + packageInfo.releaseName
                    + '; owner:billy; user:fred) %NOW% -->';
                coreBrowser.start();
                browserModule.internals.signature.should.equal(expected);
            });
            it('should update request defaults', () => {
                const old = browserModule.internals.request;
                coreBrowser.start();
                browserModule.internals.request.should.not.equal(old);
            });
        });
        describe('stop()', () => {
            let sandbox;
            beforeEach(() => {
                sandbox = sinon.sandbox.create();
                sandbox.stub(browserModule.internals.coreQueue.queue, 'kill');
                sandbox.stub(browserModule.internals.pluginQueue.queue, 'kill');
            });
            afterEach(() => sandbox.restore());
            it('should kill the coreBrowser queue', () => {
                coreBrowser.stop();
                browserModule.internals.coreQueue.queue.kill.called.should.be.true;
            });
            it('should kill the pluginBrowser queue', () => {
                coreBrowser.stop();
                browserModule.internals.pluginQueue.queue.kill.called.should.be.true;
            });
        });
    });
    describe('plugins mode', () => {
        it('should expose expected keys', () => {
            pluginBrowser.should.have.all.keys(Object.keys(browserModule.externals));

        });
        describe('non-function keys', () => {
            Object.keys(browserModule.externals).forEach((key) => {
                if (typeof browserModule.externals[key] === 'function') {
                    return;
                }
                it('should copy externals object: ' + key, () => {
                    pluginBrowser[key].should.equal(browserModule.externals[key]);
                });
            });
        });
        describe('function keys', () => {
            Object.keys(browserModule.externals).forEach((key) => {
                if (typeof browserModule.externals[key] !== 'function') {
                    return;
                }
                it('should wrap externals function: ' + key, () => {
                    sinon.stub(browserModule.externals, key);
                    pluginBrowser[key].should.not.equal(browserModule.externals[key]);
                    pluginBrowser[key]();
                    browserModule.externals[key].called.should.be.true;
                    browserModule.externals[key].lastCall.thisValue.should.equal(browserModule.internals.pluginQueue);
                    browserModule.externals[key].restore();
                });
            });
        });
    });
    describe('externals', () => {
        const fns = ['createPost', 'createPrivateMessage', 'editPost', 'login', 'messageBus', 'getPost', 'getTopic',
                'getNotifications', 'postAction', 'getPosts', 'getTopics', 'readPosts'
            ],
            objs = ['trustLevels', 'postActions'];
        describe('should include expected functions:', () => {
            fns.forEach((fn) => {
                it('should have: ' + fn + '()', () => expect(browserModule.externals[fn]).to.be.a('function'));
            });
        });
        describe('should include expected objects:', () => {
            objs.forEach((obj) => {
                it('should have: ' + obj, () => expect(browserModule.externals[obj]).to.be.a('object'));
            });
        });
        it('should include only expected keys', () => {
            browserModule.externals.should.have.all.keys(fns.concat(objs));
        });
        describe('post operations', () => {
            describe('createPost()', () => {
                const object = {
                        createPost: browserModule.externals.createPost,
                        delay: Math.ceil(1500 + Math.random() * 5000),
                        queue: {
                            push: sinon.stub()
                        }
                    },
                    queue = object.queue,
                    bufferTicks = browserModule.internals.postBufferDelay;
                let clock;
                before(() => clock = sinon.useFakeTimers());
                beforeEach(() => {
                    queue.push.reset();
                    browserModule.internals.postBuffer = null;
                });
                after(() => clock.restore());
                describe('parameters', () => {
                    it('should accept four parameters version', () => {
                        object.createPost(1, 2, '', () => 0);
                        clock.tick(bufferTicks);
                        queue.push.called.should.be.true;
                    });
                    it('should accept three parameters version', () => {
                        object.createPost(1, '', () => 0);
                        clock.tick(bufferTicks);
                        queue.push.called.should.be.true;
                    });
                    it('should reject four parameters version with no callback', () => {
                        expect(() => object.createPost(1, 2, '', null)).to.throw('callback must be supplied');
                        clock.tick(bufferTicks);
                        queue.push.called.should.be.false;
                    });
                    it('should reject three parameters version with no callback', () => {
                        expect(() => object.createPost(1, 2, '')).to.throw('callback must be supplied');
                        clock.tick(bufferTicks);
                        queue.push.called.should.be.false;
                    });
                    it('should set http method to POST', () => {
                        object.createPost(100, '', () => 0);
                        clock.tick(bufferTicks);
                        const args = queue.push.lastCall.args;
                        args.should.have.length(1);
                        args[0].should.have.any.key('method');
                        args[0].method.should.equal('POST');
                    });
                    it('should set url', () => {
                        object.createPost(100, '', () => 0);
                        clock.tick(bufferTicks);
                        const args = queue.push.lastCall.args;
                        args.should.have.length(1);
                        args[0].should.have.any.key('url');
                        args[0].url.should.equal('/posts');
                    });
                    it('should set form', () => {
                        object.createPost(100, '', () => 0);
                        clock.tick(bufferTicks);
                        const args = queue.push.lastCall.args;
                        args.should.have.length(1);
                        args[0].should.have.any.key('form');
                        args[0].form.should.be.a('object');
                    });
                    it('should set callback', () => {
                        object.createPost(100, '', () => 0);
                        clock.tick(bufferTicks);
                        const args = queue.push.lastCall.args;
                        args.should.have.length(1);
                        args[0].should.have.any.key('callback');
                        args[0].callback.should.be.a('function');
                    });
                    it('should set delay', () => {
                        object.createPost(100, '', () => 0);
                        clock.tick(bufferTicks);
                        const args = queue.push.lastCall.args;
                        args.should.have.length(1);
                        args[0].should.have.any.key('delay');
                        args[0].delay.should.equal(object.delay);
                    });
                });
                describe('form', () => {
                    it('should set `raw`', () => {
                        browserModule.internals.signature = '\nthis is my signature';
                        object.createPost(100, 'i have content', () => 0);
                        clock.tick(bufferTicks);
                        const form = queue.push.lastCall.args[0].form;
                        form.should.have.any.key('raw');
                        form.raw.should.equal('i have content\nthis is my signature');
                    });
                    it('should replace %NOW% in signature', () => {
                        browserModule.internals.signature = '%NOW%';
                        object.createPost(100, '', () => 0);
                        clock.tick(bufferTicks);
                        const form = queue.push.lastCall.args[0].form,
                            now = new Date().toISOString();
                        form.should.have.any.key('raw');
                        form.raw.should.equal(now);
                    });
                    it('should set `topic_id`', () => {
                        object.createPost(100, '', () => 0);
                        clock.tick(bufferTicks);
                        const form = queue.push.lastCall.args[0].form;
                        form.should.have.any.key('topic_id');
                        form.topic_id.should.equal(100);
                    });
                    it('should set `is_warning`', () => {
                        object.createPost(100, '', () => 0);
                        clock.tick(bufferTicks);
                        const form = queue.push.lastCall.args[0].form;
                        form.should.have.any.key('is_warning');
                        form.is_warning.should.equal(false);
                    });
                    it('should set `reply_to_post_number`', () => {
                        object.createPost(100, 42, '', () => 0);
                        clock.tick(bufferTicks);
                        const form = queue.push.lastCall.args[0].form;
                        form.should.have.any.key('reply_to_post_number');
                        form.reply_to_post_number.should.equal(42);
                    });
                    it('should set undefined `reply_to_post_number` to undefined', () => {
                        object.createPost(100, undefined, '', () => 0);
                        clock.tick(bufferTicks);
                        const form = queue.push.lastCall.args[0].form;
                        form.should.have.any.key('reply_to_post_number');
                        expect(form.reply_to_post_number).to.be.undefined;
                    });
                    it('should set null `reply_to_post_number` to undefined', () => {
                        object.createPost(100, null, '', () => 0);
                        clock.tick(bufferTicks);
                        const form = queue.push.lastCall.args[0].form;
                        form.should.have.any.key('reply_to_post_number');
                        expect(form.reply_to_post_number).to.be.undefined;
                    });
                    it('should set `category`', () => {
                        object.createPost(100, '', () => 0);
                        clock.tick(bufferTicks);
                        const form = queue.push.lastCall.args[0].form;
                        form.should.have.any.key('category');
                        form.category.should.equal('');
                    });
                    it('should set `archetype`', () => {
                        object.createPost(100, '', () => 0);
                        clock.tick(bufferTicks);
                        const form = queue.push.lastCall.args[0].form;
                        form.should.have.any.key('archetype');
                        form.archetype.should.equal('regular');
                    });
                    it('should set `auto_close_time`', () => {
                        object.createPost(100, '', () => 0);
                        clock.tick(bufferTicks);
                        const form = queue.push.lastCall.args[0].form;
                        form.should.have.any.key('auto_close_time');
                        form.auto_close_time.should.equal('');
                    });
                });
                describe('callbacks', () => {
                    it('should pass err to external callback on completion', () => {
                        queue.push.yieldsTo('callback', new Error('test error!'));
                        const spy = sinon.spy();
                        object.createPost(100, '', spy);
                        clock.tick(bufferTicks);
                        spy.called.should.be.true;
                        spy.lastCall.args.should.have.length(2);
                        spy.lastCall.args[0].should.be.an.instanceOf(Error);
                        expect(spy.lastCall.args[1]).to.be.null;
                    });
                    it('should pass post to external callback on completion', () => {
                        queue.push.yieldsTo('callback', null, {});
                        const spy = sinon.spy();
                        object.createPost(100, '', spy);
                        clock.tick(bufferTicks);
                        spy.called.should.be.true;
                        spy.lastCall.args.should.have.length(2);
                        expect(spy.lastCall.args[0]).to.equal(null);
                        // cleanPost should have been called, adding these keys
                        spy.lastCall.args[1].should.have.keys('cleaned', 'url', 'reply_to');
                    });
                });
                describe('buffering', () => {
                    it('should create the post buffer on first call', () => {
                        expect(browserModule.internals.postBuffer).to.be.null;
                        object.createPost(100, '', () => 0);
                        clock.tick(bufferTicks);
                        expect(browserModule.internals.postBuffer).to.not.be.null;
                    });
                    it('should not create the post buffer on second call', () => {
                        const pb = new PostBuffer(bufferTicks, () => 0);
                        browserModule.internals.postBuffer = pb;
                        object.createPost(100, '', () => 0);
                        clock.tick(bufferTicks);
                        browserModule.internals.postBuffer.should.equal(pb);
                    });
                    it('should combine two posts posted within the buffer period', () => {
                        const p1 = '\npost one';
                        const p2 = '\npost two';
                        const p = [p1, p2].join(browserModule.internals.postSeparator);
                        const sig = '\nmerged signature';
                        browserModule.internals.signature = sig;
                        object.createPost(100, p1, () => 0);
                        clock.tick(bufferTicks - 1);
                        object.createPost(100, p2, () => 0);
                        clock.tick(bufferTicks);
                        const form = queue.push.lastCall.args[0].form;
                        form.raw.should.equal(p + sig);
                    });
                    it('should not combine two posts posted outside the buffer period', () => {
                        const p1 = '\npost one';
                        const p2 = '\npost two';
                        const sig = '\nmerged signature';
                        browserModule.internals.signature = sig;
                        object.createPost(100, p1, () => 0);
                        clock.tick(bufferTicks);
                        object.createPost(100, p2, () => 0);
                        clock.tick(bufferTicks);
                        let form = queue.push.firstCall.args[0].form;
                        form.raw.should.equal(p1 + sig);
                        form = queue.push.lastCall.args[0].form;
                        form.raw.should.equal(p2 + sig);
                    });
                    it('should combine two posts with the same topic and replyTo', () => {
                        const p1 = '\npost one';
                        const p2 = '\npost two';
                        const p = [p1, p2].join(browserModule.internals.postSeparator);
                        const sig = '\nmerged signature';
                        browserModule.internals.signature = sig;
                        object.createPost(100, 1, p1, () => 0);
                        object.createPost(100, 1, p2, () => 0);
                        clock.tick(bufferTicks);
                        const form = queue.push.lastCall.args[0].form;
                        form.raw.should.equal(p + sig);
                    });
                    it('should not combine two posts with the same topic and different replyTo', () => {
                        const p1 = '\npost one';
                        const p2 = '\npost two';
                        const sig = '\nmerged signature';
                        browserModule.internals.signature = sig;
                        object.createPost(100, 1, p1, () => 0);
                        object.createPost(100, 2, p2, () => 0);
                        clock.tick(bufferTicks);
                        let form = queue.push.firstCall.args[0].form;
                        form.raw.should.equal(p1 + sig);
                        form = queue.push.lastCall.args[0].form;
                        form.raw.should.equal(p2 + sig);
                    });
                    it('should not combine two posts with different topic', () => {
                        const p1 = '\npost one';
                        const p2 = '\npost two';
                        const sig = '\nmerged signature';
                        browserModule.internals.signature = sig;
                        object.createPost(100, p1, () => 0);
                        object.createPost(101, p2, () => 0);
                        clock.tick(bufferTicks);
                        let form = queue.push.firstCall.args[0].form;
                        form.raw.should.equal(p1 + sig);
                        form = queue.push.lastCall.args[0].form;
                        form.raw.should.equal(p2 + sig);
                    });
                    it('should call both callbacks for merged post', () => {
                        const spy = sinon.stub();
                        object.createPost(100, '', spy);
                        object.createPost(100, '', spy);
                        clock.tick(bufferTicks);
                        spy.calledTwice.should.be.true;
                    });
                    it('should call both callbacks for unmerged posts', () => {
                        const spy = sinon.stub();
                        object.createPost(100, '', spy);
                        clock.tick(bufferTicks);
                        object.createPost(100, '', spy);
                        clock.tick(bufferTicks);
                        spy.calledTwice.should.be.true;
                    });
                });
            });
            describe('createPrivateMessage()', () => {
                const object = {
                        createPrivateMessage: browserModule.externals.createPrivateMessage,
                        delay: Math.ceil(1500 + Math.random() * 5000),
                        queue: {
                            push: sinon.stub()
                        }
                    },
                    queue = object.queue;
                beforeEach(() => queue.push.reset());
                it('should accept four parameters', () => {
                    object.createPrivateMessage('', '', '', () => 0);
                    queue.push.called.should.be.true;
                });
                it('should reject four parameters with no callback', () => {
                    expect(() => object.createPrivateMessage('', '', '', null)).to.throw('callback must be supplied');
                    queue.push.called.should.be.false;
                });
                it('should set http method to POST', () => {
                    object.createPrivateMessage('', '', '', () => 0);
                    const args = queue.push.lastCall.args;
                    args.should.have.length(1);
                    args[0].should.have.any.key('method');
                    args[0].method.should.equal('POST');
                });
                it('should set url', () => {
                    object.createPrivateMessage('', '', '', () => 0);
                    const args = queue.push.lastCall.args;
                    args.should.have.length(1);
                    args[0].should.have.any.key('url');
                    args[0].url.should.equal('/posts');
                });
                it('should set form', () => {
                    object.createPrivateMessage('', '', '', () => 0);
                    const args = queue.push.lastCall.args;
                    args.should.have.length(1);
                    args[0].should.have.any.key('form');
                    args[0].form.should.be.a('object');
                });
                it('should set callback', () => {
                    object.createPrivateMessage('', '', '', () => 0);
                    const args = queue.push.lastCall.args;
                    args.should.have.length(1);
                    args[0].should.have.any.key('callback');
                    args[0].callback.should.be.a('function');
                });
                it('should set delay', () => {
                    object.delay = Math.ceil(1500 + Math.random() * 5000);
                    object.createPrivateMessage('', '', '', () => 0);
                    const args = queue.push.lastCall.args;
                    args.should.have.length(1);
                    args[0].should.have.any.key('delay');
                    args[0].delay.should.equal(object.delay);
                });
                describe('form', () => {
                    it('should set `raw`', () => {
                        browserModule.internals.signature = '\nthis is my signature';
                        object.createPrivateMessage('', '', 'i have content', () => 0);
                        const form = queue.push.lastCall.args[0].form;
                        form.should.have.any.key('raw');
                        form.raw.should.equal('i have content\nthis is my signature');
                    });
                    it('should set `title`', () => {
                        object.createPrivateMessage('', 'this is title', '', () => 0);
                        const form = queue.push.lastCall.args[0].form;
                        form.should.have.any.key('title');
                        form.title.should.equal('this is title');
                    });
                    it('should set `is_warning`', () => {
                        object.createPrivateMessage('', 100, '', () => 0);
                        const form = queue.push.lastCall.args[0].form;
                        form.should.have.any.key('is_warning');
                        form.is_warning.should.equal(false);
                    });
                    it('should set `target_usernames` with single target', () => {
                        object.createPrivateMessage('accalia', 42, '', () => 0);
                        const form = queue.push.lastCall.args[0].form;
                        form.should.have.any.key('target_usernames');
                        form.target_usernames.should.equal('accalia');
                    });
                    it('should set `target_usernames` with multiple targets', () => {
                        object.createPrivateMessage(['accalia', 'sockbot'], 100, '', () => 0);
                        const form = queue.push.lastCall.args[0].form;
                        form.should.have.any.key('target_usernames');
                        form.target_usernames.should.deep.equal(['accalia', 'sockbot']);
                    });
                    it('should set `archetype`', () => {
                        object.createPrivateMessage('', 100, '', () => 0);
                        const form = queue.push.lastCall.args[0].form;
                        form.should.have.any.key('archetype');
                        form.archetype.should.equal('private_message');
                    });
                });
                it('should pass err to external callback on completion', () => {
                    queue.push.yieldsTo('callback', new Error('test error!'));
                    const spy = sinon.spy();
                    object.createPrivateMessage('', 100, '', spy);
                    spy.called.should.be.true;
                    spy.lastCall.args.should.have.length(1);
                    spy.lastCall.args[0].should.be.an.instanceOf(Error);
                });
                it('should pass post to external callback on completion', () => {
                    queue.push.yieldsTo('callback', null, {});
                    const spy = sinon.spy();
                    object.createPrivateMessage('', 100, '', spy);
                    spy.called.should.be.true;
                    spy.lastCall.args.should.have.length(2);
                    expect(spy.lastCall.args[0]).to.equal(null);
                    // cleanPost should have been called, adding these keys
                    spy.lastCall.args[1].should.have.keys('cleaned', 'url', 'reply_to');
                });
            });
            describe('editPost()', () => {
                const object = {
                        editPost: browserModule.externals.editPost,
                        delay: Math.ceil(1500 + Math.random() * 5000),
                        queue: {
                            push: sinon.stub()
                        }
                    },
                    queue = object.queue;
                beforeEach(() => queue.push.reset());
                it('should accept four parameters version', () => {
                    object.editPost(1, '', '', () => 0);
                    queue.push.called.should.be.true;
                });
                it('should accept three parameters version', () => {
                    object.editPost(1, '', () => 0);
                    queue.push.called.should.be.true;
                });
                it('should reject four parameters version with no callback', () => {
                    expect(() => object.editPost(1, 2, '', null)).to.throw('callback must be supplied');
                    queue.push.called.should.be.false;
                });
                it('should reject three parameters version with no callback', () => {
                    expect(() => object.editPost(1, 2, '')).to.throw('callback must be supplied');
                    queue.push.called.should.be.false;
                });
                it('should set http method to PUT', () => {
                    object.editPost(100, '', () => 0);
                    const args = queue.push.lastCall.args;
                    args.should.have.length(1);
                    args[0].should.have.any.key('method');
                    args[0].method.should.equal('PUT');
                });
                it('should set url', () => {
                    object.editPost(100, '', () => 0);
                    const args = queue.push.lastCall.args;
                    args.should.have.length(1);
                    args[0].should.have.any.key('url');
                    args[0].url.should.equal('/posts/100');
                });
                it('should set form', () => {
                    object.editPost(100, '', () => 0);
                    const args = queue.push.lastCall.args;
                    args.should.have.length(1);
                    args[0].should.have.any.key('form');
                    args[0].form.should.be.a('object');
                });
                it('should set callback', () => {
                    object.editPost(100, '', () => 0);
                    const args = queue.push.lastCall.args;
                    args.should.have.length(1);
                    args[0].should.have.any.key('callback');
                    args[0].callback.should.be.a('function');
                });
                it('should set delay', () => {
                    object.delay = Math.ceil(1500 + Math.random() * 5000);
                    object.editPost(100, '', () => 0);
                    const args = queue.push.lastCall.args;
                    args.should.have.length(1);
                    args[0].should.have.any.key('delay');
                    args[0].delay.should.equal(object.delay);
                });
                it('should set `form.post` without edit reason', () => {
                    browserModule.internals.signature = '\nthis is my signature';
                    object.editPost(100, 'i have content', () => 0);
                    const form = queue.push.lastCall.args[0].form;
                    form.should.have.any.key('post');
                    form.post.should.deep.equal({
                        raw: 'i have content\nthis is my signature',
                        'edit_reason': ''
                    });
                });
                it('should set `form.post` with edit reason', () => {
                    browserModule.internals.signature = '\nthis is my signature';
                    object.editPost(100, 'i have content', 'i have my reasons', () => 0);
                    const form = queue.push.lastCall.args[0].form;
                    form.should.have.any.key('post');
                    form.post.should.deep.equal({
                        raw: 'i have content\nthis is my signature',
                        'edit_reason': 'i have my reasons'
                    });
                });
                it('should pass err to external callback on completion', () => {
                    queue.push.yieldsTo('callback', new Error('test error!'));
                    const spy = sinon.spy();
                    object.editPost(100, '', spy);
                    spy.called.should.be.true;
                    spy.lastCall.args.should.have.length(1);
                    spy.lastCall.args[0].should.be.an.instanceOf(Error);
                });
                it('should pass post to external callback on completion', () => {
                    queue.push.yieldsTo('callback', null, {});
                    const spy = sinon.spy();
                    object.editPost(100, '', spy);
                    spy.called.should.be.true;
                    spy.lastCall.args.should.have.length(2);
                    expect(spy.lastCall.args[0]).to.equal(null);
                    // cleanPost should have been called, adding these keys
                    spy.lastCall.args[1].should.have.keys('cleaned', 'url', 'reply_to');
                });
            });
            describe('readPosts()', () => {
                const object = {
                        readPosts: browserModule.externals.readPosts,
                        delay: Math.ceil(1500 + Math.random() * 5000),
                        queue: {
                            push: sinon.stub()
                        }
                    },
                    queue = object.queue;
                beforeEach(() => queue.push.reset());
                it('should reject no callback', () => {
                    expect(() => object.readPosts(null, null, null)).to.throw('callback must be supplied');
                    queue.push.called.should.be.false;
                });
                it('should set http method to POST', () => {
                    object.readPosts(1, [2], () => 0);
                    const args = queue.push.lastCall.args;
                    args.should.have.length(1);
                    args[0].should.have.any.key('method');
                    args[0].method.should.equal('POST');
                });
                it('should set url', () => {
                    object.readPosts(1, [2], () => 0);
                    const args = queue.push.lastCall.args;
                    args.should.have.length(1);
                    args[0].should.have.any.key('url');
                    args[0].url.should.equal('/topics/timings');
                });
                it('should set form', () => {
                    object.readPosts(1, [2], () => 0);
                    const args = queue.push.lastCall.args;
                    args.should.have.length(1);
                    args[0].should.have.any.key('form');
                    args[0].form.should.be.a('object');
                });
                it('should set callback', () => {
                    object.readPosts(1, [2], () => 0);
                    const args = queue.push.lastCall.args;
                    args.should.have.length(1);
                    args[0].should.have.any.key('callback');
                    args[0].callback.should.be.a('function');
                });
                it('should set delay', () => {
                    object.delay = Math.ceil(1500 + Math.random() * 5000);
                    object.readPosts(1, [2], () => 0);
                    const args = queue.push.lastCall.args;
                    args.should.have.length(1);
                    args[0].should.have.any.key('delay');
                    args[0].delay.should.equal(object.delay);
                });
                /*eslint-disable camelcase */
                it('should set form contents based on an array of one element', () => {
                    object.readPosts(1, [2], () => 0);
                    const form = queue.push.lastCall.args[0].form;
                    form.should.deep.equal({
                        topic_id: 1,
                        topic_time: 4242,
                        'timings[2]': 4242
                    });
                });
                it('should set form contents based on an array of two elements', () => {
                    object.readPosts(1, [2, 3], () => 0);
                    const form = queue.push.lastCall.args[0].form;
                    form.should.deep.equal({
                        topic_id: 1,
                        topic_time: 4242,
                        'timings[2]': 4242,
                        'timings[3]': 4242
                    });
                });
                it('should form contents based on a number', () => {
                    object.readPosts(1, 2, () => 0);
                    const form = queue.push.lastCall.args[0].form;
                    form.should.deep.equal({
                        topic_id: 1,
                        topic_time: 4242,
                        'timings[2]': 4242
                    });
                });
                /*eslint-enable camelcase */
            });
        });
        describe('login', () => {
            const object = {
                    login: browserModule.externals.login,
                    delay: Math.ceil(1500 + Math.random() * 5000),
                    queue: {
                        push: sinon.stub()
                    }
                },
                queue = object.queue;
            beforeEach(() => queue.push.reset());
            it('should require a callback', () => {
                expect(() => object.login()).to.throw('callback must be supplied');
            });
            it('should require a callback 2', () => {
                expect(() => object.login('not callback')).to.throw('callback must be supplied');
            });
            it('should pass error on CSRF failure', () => {
                const spy = sinon.spy(),
                    error = new Error('testErrot');
                queue.push
                    .throws(new Error('unexpected call'))
                    .onFirstCall().yieldsTo('callback', error);
                object.login(spy);
                spy.firstCall.args[0].should.equal(error);
                queue.push.lastCall.args[0].url.should.equal('/session/csrf.json');
            });
            it('should call doLogin on csrf success', () => {
                const spy = sinon.spy();
                queue.push
                    .throws(new Error('unexpected call'))
                    .onFirstCall().yieldsTo('callback', null, 'CSRF')
                    .onSecondCall().yieldsTo('callback', null, {
                        user: 'user info'
                    });
                object.login(spy);
                expect(spy.firstCall.args[0]).to.equal(null);
                spy.firstCall.args[1].should.equal('user info');
                queue.push.lastCall.args[0].url.should.equal('/session');
            });
        });
        describe('messageBus()', () => {
            const object = {
                    delay: 0,
                    queue: {
                        push: sinon.stub()
                    },
                    messageBus: browserModule.externals.messageBus
                },
                queue = object.queue;
            beforeEach(() => queue.push.reset());
            it('should set http method to POST', () => {
                object.messageBus({}, '', () => 0);
                const args = queue.push.lastCall.args;
                args.should.have.length(1);
                args[0].should.have.any.key('method');
                args[0].method.should.equal('POST');
            });
            it('should set url', () => {
                object.messageBus({}, 'foobarbaz', () => 0);
                const args = queue.push.lastCall.args;
                args.should.have.length(1);
                args[0].should.have.any.key('url');
                args[0].url.should.equal('/message-bus/foobarbaz/poll');
            });
            it('should set form', () => {
                const form = {};
                object.messageBus(form, '', () => 0);
                const args = queue.push.lastCall.args;
                args.should.have.length(1);
                args[0].should.have.any.key('form');
                args[0].form.should.equal(form);
            });
            it('should set callback', () => {
                const fn = () => 0;
                object.messageBus({}, '', fn);
                const args = queue.push.lastCall.args;
                args.should.have.length(1);
                args[0].should.have.any.key('callback');
                args[0].callback.should.equal(fn);
            });
            it('should set delay', () => {
                const delay = Math.ceil(1500 + Math.random() * 5000);
                object.delay = delay;
                object.messageBus({}, '', () => 0);
                const args = queue.push.lastCall.args;
                args.should.have.length(1);
                args[0].should.have.any.key('delay');
                args[0].delay.should.equal(delay);
            });
            it('should pass err to external callback on completion', () => {
                queue.push.yieldsTo('callback', new Error('test error!'));
                const spy = sinon.spy();
                object.messageBus({}, '', spy);
                spy.called.should.be.true;
                spy.lastCall.args.should.have.length(1);
                spy.lastCall.args[0].should.be.an.instanceOf(Error);
            });
            it('should pass post to external callback on completion', () => {
                queue.push.yieldsTo('callback', null, {});
                const spy = sinon.spy();
                object.messageBus({}, '', spy);
                spy.called.should.be.true;
                spy.lastCall.args.should.have.length(2);
                expect(spy.lastCall.args[0]).to.equal(null);
            });
        });
        describe('getPost()', () => {
            const object = {
                    delay: 0,
                    queue: {
                        push: sinon.stub()
                    },
                    getPost: browserModule.externals.getPost
                },
                queue = object.queue;
            beforeEach(() => queue.push.reset());
            it('should set HTTP get method', () => {
                object.getPost(0, () => 0);
                queue.push.lastCall.args[0].should.have.any.key('method');
                queue.push.lastCall.args[0].method.should.equal('GET');
            });
            it('should set URL', () => {
                const id = Math.ceil(5000 + Math.random() * 5000);
                object.getPost(id, () => 0);
                queue.push.lastCall.args[0].should.have.any.key('url');
                queue.push.lastCall.args[0].url.should.equal('/posts/' + id + '.json');
            });
            it('should set delay', () => {
                const delay = Math.ceil(5000 + Math.random() * 5000);
                object.delay = delay;
                object.getPost(0, () => 0);
                queue.push.lastCall.args[0].should.have.any.key('delay');
                queue.push.lastCall.args[0].delay.should.equal(delay);
            });
            it('should set callback', () => {
                object.getPost(0, () => 0);
                queue.push.lastCall.args[0].should.have.any.key('callback');
                queue.push.lastCall.args[0].callback.should.be.a('function');
            });
            it('should pass callbac error to callback', () => {
                const spy = sinon.spy(),
                    err = new Error('this is an error');
                queue.push.yieldsTo('callback', err);
                object.getPost(0, spy);
                spy.lastCall.args.should.deep.equal([err]);
            });
            it('should use cleanPostRaw()', () => {
                const post = {
                        'raw': 'this is [quote]not[/quote]passing'
                    },
                    expected = 'this is passing',
                    spy = sinon.spy();
                queue.push.yieldsTo('callback', null, post);
                object.getPost(0, spy);
                expect(spy.lastCall.args[0]).to.equal(null);
                spy.lastCall.args[1].should.have.any.key('cleaned');
                spy.lastCall.args[1].cleaned.should.equal(expected);
            });
            it('should use setTrustLevel()', () => {
                const post = {
                        admin: true,
                        'trust_level': coreBrowser.trustLevels.tl2
                    },
                    spy = sinon.spy();
                queue.push.yieldsTo('callback', null, post);
                object.getPost(0, spy);
                expect(spy.lastCall.args[0]).to.equal(null);
                spy.lastCall.args[1].trust_level.should.equal(coreBrowser.trustLevels.admin);
            });
            it('should use setPostUrl()', () => {
                const post = {
                        'topic_slug': 'topic',
                        'topic_id': 1234,
                        'post_number': 17
                    },
                    expected = 'https://what.thedailywtf.com/t/topic/1234/17',
                    spy = sinon.spy();
                queue.push.yieldsTo('callback', null, post);
                object.getPost(0, spy);
                expect(spy.lastCall.args[0]).to.equal(null);
                spy.lastCall.args[1].should.have.any.key('url');
                spy.lastCall.args[1].url.should.deep.equal(expected);
            });
        });
        describe('getPosts()', () => {
            let object, queue, sandbox;
            beforeEach(() => {
                sandbox = sinon.sandbox.create();
                sandbox.useFakeTimers();
                async.setImmediate = (fn) => setTimeout(fn, 0);
                async.nextTick = (fn) => setTimeout(fn, 0);
                object = {
                    delay: 0,
                    queue: {
                        push: sinon.stub()
                    },
                    getPosts: browserModule.externals.getPosts
                };
                queue = object.queue;
            });
            afterEach(() => sandbox.restore());
            describe('Phase 1: get postIds', () => {
                it('should set HTTP get method', () => {
                    object.getPosts(0, () => 0, () => 0);
                    queue.push.lastCall.args[0].should.have.any.key('method');
                    queue.push.lastCall.args[0].method.should.equal('GET');
                });
                it('should set URL', () => {
                    const url = '/t/314159/posts.json?include_raw=1&post_ids=0';
                    object.getPosts(314159, () => 0, () => 0);
                    queue.push.lastCall.args[0].should.have.any.key('url');
                    queue.push.lastCall.args[0].url.should.equal(url);
                });
                it('should not set delay', () => {
                    const delay = Math.ceil(5000 + Math.random() * 5000);
                    object.delay = delay;
                    object.getPosts(0, () => 0, () => 0);
                    queue.push.lastCall.args[0].should.not.have.any.key('delay');
                });
                it('should set callback', () => {
                    object.getPosts(0, () => 0, () => 0);
                    queue.push.lastCall.args[0].should.have.any.key('callback');
                    queue.push.lastCall.args[0].callback.should.be.a('function');
                });
                it('should pass callback error to callback', () => {
                    const spy = sinon.spy(),
                        err = new Error('this is an error');
                    queue.push.yieldsTo('callback', err);
                    object.getPosts(0, () => 0, spy);
                    spy.lastCall.args.should.deep.equal([err]);
                });
                it('should pass success to complete to callback', () => {
                    const spy = sinon.spy(),
                        eachSpy = sinon.spy(),
                        topic = {
                            'post_stream': {
                                stream: []
                            }
                        };
                    queue.push.yieldsTo('callback', null, topic);
                    object.getPosts(0, eachSpy, spy);
                    eachSpy.called.should.be.false;
                    spy.lastCall.args.should.deep.equal([null]);
                });
            });
            describe('Phase 2: get all the posts', () => {
                it('should set HTTP get method', () => {
                    const spy = sinon.spy(),
                        eachSpy = sinon.spy(),
                        topic = {
                            'post_stream': {
                                stream: [2]
                            }
                        };
                    queue.push.onFirstCall().yieldsTo('callback', null, topic);
                    object.getPosts(0, eachSpy, spy);
                    sandbox.clock.tick(0);
                    queue.push.lastCall.args[0].should.have.any.key('method');
                    queue.push.lastCall.args[0].method.should.equal('GET');
                });
                it('should set URL', () => {
                    const url = '/t/314159/posts.json?include_raw=1&post_ids[]=2';
                    const spy = sinon.spy(),
                        eachSpy = sinon.spy(),
                        topic = {
                            'post_stream': {
                                stream: [2]
                            }
                        };
                    queue.push.onFirstCall().yieldsTo('callback', null, topic);
                    object.getPosts(314159, eachSpy, spy);
                    sandbox.clock.tick(0);
                    queue.push.lastCall.args[0].should.have.any.key('url');
                    queue.push.lastCall.args[0].url.should.equal(url);
                });
                it('should set delay', () => {
                    const spy = sinon.spy(),
                        eachSpy = sinon.spy(),
                        topic = {
                            'post_stream': {
                                stream: [2]
                            }
                        },
                        delay = Math.ceil(5000 + Math.random() * 5000);
                    object.delay = delay;
                    queue.push.onFirstCall().yieldsTo('callback', null, topic);
                    object.getPosts(0, eachSpy, spy);
                    sandbox.clock.tick(0);
                    queue.push.lastCall.args[0].should.have.any.key('delay');
                    queue.push.lastCall.args[0].delay.should.equal(delay);
                });
                it('should set callback', () => {
                    const spy = sinon.spy(),
                        eachSpy = sinon.spy(),
                        topic = {
                            'post_stream': {
                                stream: [2]
                            }
                        };
                    queue.push.onFirstCall().yieldsTo('callback', null, topic);
                    object.getPosts(314159, eachSpy, spy);
                    sandbox.clock.tick(0);
                    queue.push.lastCall.args[0].should.have.any.key('callback');
                    queue.push.lastCall.args[0].callback.should.be.a('function');
                });
                it('should pass callback error to callback', () => {
                    const spy = sinon.spy(),
                        err = new Error('this is an error'),
                        eachSpy = sinon.spy(),
                        topic = {
                            'post_stream': {
                                stream: [2]
                            }
                        };
                    queue.push.onFirstCall().yieldsTo('callback', null, topic);
                    queue.push.onSecondCall().yieldsTo('callback', err);
                    object.getPosts(314159, eachSpy, spy);
                    sandbox.clock.tick(0);
                    spy.lastCall.args.should.deep.equal([err]);
                });
                it('should not call eachChunk with no results', () => {
                    const spy = sinon.spy(),
                        eachSpy = sinon.spy(),
                        topic = {
                            'post_stream': {
                                stream: [2]
                            }
                        },
                        posts = {
                            'post_stream': {
                                posts: []
                            }
                        };
                    queue.push.onFirstCall().yieldsTo('callback', null, topic);
                    queue.push.onSecondCall().yieldsTo('callback', null, posts);
                    object.getPosts(314159, eachSpy, spy);
                    sandbox.clock.tick(0);
                    eachSpy.called.should.be.false;
                    spy.lastCall.args.should.deep.equal([null]);
                });
                it('should call eachChunk with results', () => {
                    const spy = sinon.spy(),
                        eachSpy = sinon.stub(),
                        topic = {
                            'post_stream': {
                                stream: [2]
                            }
                        },
                        posts = {
                            'post_stream': {
                                posts: [{}, {}, {}]
                            }
                        };
                    eachSpy.yields(null);
                    queue.push.onFirstCall().yieldsTo('callback', null, topic);
                    queue.push.onSecondCall().yieldsTo('callback', null, posts);
                    object.getPosts(314159, eachSpy, spy);
                    sandbox.clock.tick(0);
                    eachSpy.callCount.should.equal(3);
                    spy.lastCall.args.should.deep.equal([null]);
                });
                it('should pass results to cleanPost', () => {
                    const spy = sinon.spy(),
                        eachSpy = sinon.stub(),
                        topic = {
                            'post_stream': {
                                stream: [2]
                            }
                        },
                        posts = {
                            'post_stream': {
                                posts: [{}]
                            }
                        };
                    eachSpy.yields(null);
                    queue.push.onFirstCall().yieldsTo('callback', null, topic);
                    queue.push.onSecondCall().yieldsTo('callback', null, posts);
                    object.getPosts(314159, eachSpy, spy);
                    sandbox.clock.tick(0);
                    eachSpy.lastCall.args[0].should.deep.equal({
                        cleaned: '',
                        'reply_to': 'https://what.thedailywtf.com/t/undefined/undefined/',
                        url: 'https://what.thedailywtf.com/t/undefined/undefined/undefined'
                    });
                    spy.lastCall.args.should.deep.equal([null]);
                });
            });
        });
        describe('getTopic()', () => {
            const object = {
                    delay: 0,
                    queue: {
                        push: sinon.stub()
                    },
                    getTopic: browserModule.externals.getTopic
                },
                queue = object.queue;
            beforeEach(() => queue.push.reset());
            it('should set HTTP get method', () => {
                object.getTopic(0, () => 0);
                queue.push.lastCall.args[0].should.have.any.key('method');
                queue.push.lastCall.args[0].method.should.equal('GET');
            });
            it('should set URL', () => {
                const id = Math.ceil(5000 + Math.random() * 5000),
                    expected = '/t/' + id + '.json?include_raw=1&track_visit=true';
                object.getTopic(id, () => 0);
                queue.push.lastCall.args[0].should.have.any.key('url');
                queue.push.lastCall.args[0].url.should.equal(expected);
            });
            it('should set delay', () => {
                const delay = Math.ceil(5000 + Math.random() * 5000);
                object.delay = delay;
                object.getTopic(0, () => 0);
                queue.push.lastCall.args[0].should.have.any.key('delay');
                queue.push.lastCall.args[0].delay.should.equal(delay);
            });
            it('should set callback', () => {
                object.getTopic(0, () => 0);
                queue.push.lastCall.args[0].should.have.any.key('callback');
                queue.push.lastCall.args[0].callback.should.be.a('function');
            });
            it('should pass callback error to callback', () => {
                const spy = sinon.spy(),
                    err = new Error('this is an error');
                queue.push.yieldsTo('callback', err);
                object.getTopic(0, spy);
                spy.lastCall.args.should.deep.equal([err]);
            });
            it('should pass result topic to callback', () => {
                const spy = sinon.spy(),
                    topic = {};
                queue.push.yieldsTo('callback', null, topic);
                object.getTopic(0, spy);
                spy.lastCall.args.should.deep.equal([null, topic]);
            });
            it('should remove post_stream from result topic', () => {
                const spy = sinon.spy(),
                    topic = {
                        'post_stream': true
                    };
                queue.push.yieldsTo('callback', null, topic);
                object.getTopic(0, spy);
                topic.should.not.have.any.key('post_stream');
            });
            it('should remove details.links from result topic', () => {
                const spy = sinon.spy(),
                    topic = {
                        details: {
                            links: true
                        }
                    };
                queue.push.yieldsTo('callback', null, topic);
                object.getTopic(0, spy);
                topic.details.should.not.have.any.key('links');
            });
            it('should remove details.participants from result topic', () => {
                const spy = sinon.spy(),
                    topic = {
                        details: {
                            participants: true
                        }
                    };
                queue.push.yieldsTo('callback', null, topic);
                object.getTopic(0, spy);
                topic.details.should.not.have.any.key('participants');
            });
            it('should remove details.suggested_topics from result topic', () => {
                const spy = sinon.spy(),
                    topic = {
                        details: {
                            'suggested_topics': true
                        }
                    };
                queue.push.yieldsTo('callback', null, topic);
                object.getTopic(0, spy);
                topic.details.should.not.have.any.key('suggested_topics');
            });
            it('should set url for result topic', () => {
                const spy = sinon.spy(),
                    topic = {
                        slug: 'i-am-topic',
                        id: Math.ceil(5000 + Math.random() * 5000)
                    },
                    expected = '/t/' + topic.slug + '/' + topic.id;
                queue.push.yieldsTo('callback', null, topic);
                object.getTopic(0, spy);
                topic.url.should.equal(expected);
            });
        });
        describe('getTopics()', () => {
            let object, queue, sandbox;
            beforeEach(() => {
                sandbox = sinon.sandbox.create();
                sandbox.useFakeTimers();
                sandbox.stub(async, 'whilst');
                object = {
                    delay: 0,
                    queue: {
                        push: sinon.stub()
                    },
                    getTopics: browserModule.externals.getTopics
                };
                queue = object.queue;
            });
            afterEach(() => sandbox.restore());
            it('should set whilst for latest url', () => {
                object.getTopics(() => 0, () => 0);
                async.whilst.firstCall.args[0].should.be.a('function');
                async.whilst.firstCall.args[0]().should.equal('/latest.json?no_definitions=true');
            });
            it('should set HTTP method for call', () => {
                async.whilst.callsArgWith(1, null);
                object.getTopics(() => 0, () => 0);
                queue.push.firstCall.args[0].method.should.equal('GET');
            });
            it('should set URL for call', () => {
                async.whilst.callsArgWith(1, null);
                object.getTopics(() => 0, () => 0);
                queue.push.firstCall.args[0].url.should.equal('/latest.json?no_definitions=true');
            });
            it('should set delay for call', () => {
                object.delay = Math.random();
                async.whilst.callsArgWith(1, null);
                object.getTopics(() => 0, () => 0);
                queue.push.firstCall.args[0].delay.should.equal(object.delay);
            });
            it('should set callback for call', () => {
                async.whilst.callsArgWith(1, null);
                object.getTopics(() => 0, () => 0);
                queue.push.firstCall.args[0].callback.should.be.a('function');
            });
            it('should pass error to eachCallback on error', () => {
                const spy = sinon.spy();
                async.whilst.callsArgWith(1, spy);
                object.getTopics(() => 0, () => 0);
                const each = queue.push.firstCall.args[0].callback,
                    err = new Error();
                each(err);
                spy.calledWith(err).should.be.true;
            });
            it('should set next url on success', () => {
                const spy = sinon.spy(),
                    list = {
                        'topic_list': {
                            'more_topics_url': 3.1415926,
                            topics: []
                        }
                    };
                async.whilst.callsArgWith(1, spy);
                object.getTopics(() => 0, () => 0);
                const each = queue.push.firstCall.args[0].callback;
                each(null, list);
                async.whilst.firstCall.args[0]().should.equal(3.1415926);
            });
            it('should not call eachTopic on no results', () => {
                const spy = sinon.spy(),
                    list = {
                        'topic_list': {
                            'more_topics_url': 3.1415926,
                            topics: []
                        }
                    };
                async.whilst.callsArgWith(1, () => 0);
                object.getTopics(spy, () => 0);
                const each = queue.push.firstCall.args[0].callback;
                each(null, list);
                spy.called.should.be.false;
            });
            it('should call eachTopic fore each result', () => {
                const spy = sinon.stub(),
                    list = {
                        'topic_list': {
                            'more_topics_url': 3.1415926,
                            topics: [1, 2, 3]
                        }
                    };
                spy.yields(null);
                async.whilst.callsArgWith(1, () => 0);
                object.getTopics(spy, () => 0);
                const each = queue.push.firstCall.args[0].callback;
                each(null, list);
                sandbox.clock.tick(0);
                spy.callCount.should.equal(3);
                spy.calledWith(1).should.be.true;
                spy.calledWith(2).should.be.true;
                spy.calledWith(3).should.be.true;
            });
        });
        describe('getNotifications()', () => {
            const object = {
                    delay: Math.random(),
                    queue: {
                        push: sinon.stub()
                    },
                    getNotifications: browserModule.externals.getNotifications
                },
                queue = object.queue;
            beforeEach(() => queue.push.reset());
            it('frist request should set HTTP status', () => {
                object.getNotifications(() => 0);
                queue.push.callCount.should.equal(1);
                const task = queue.push.firstCall.args[0];
                task.should.be.a('object');
                task.method.should.equal('GET');
            });
            it('frist request should set URL', () => {
                object.getNotifications(() => 0);
                queue.push.callCount.should.equal(1);
                const task = queue.push.firstCall.args[0];
                task.should.be.a('object');
                task.url.should.equal('/notifications.json');
            });
            it('frist request should set delay', () => {
                object.getNotifications(() => 0);
                queue.push.callCount.should.equal(1);
                const task = queue.push.firstCall.args[0];
                task.should.be.a('object');
                task.delay.should.equal(object.delay);
            });
            it('frist request should not set form', () => {
                object.getNotifications(() => 0);
                queue.push.callCount.should.equal(1);
                const task = queue.push.firstCall.args[0];
                task.should.be.a('object');
                expect(task.form).to.be.undefined;
            });
            it('second request should set HTTP status', () => {
                object.getNotifications(() => 0);
                const callback1 = queue.push.firstCall.args[0].callback;
                callback1(null, null);
                queue.push.callCount.should.equal(2);
                const task = queue.push.secondCall.args[0];
                task.should.be.a('object');
                task.method.should.equal('PUT');
            });
            it('second request should set URL', () => {
                object.getNotifications(() => 0);
                const callback1 = queue.push.firstCall.args[0].callback;
                callback1(null, null);
                queue.push.callCount.should.equal(2);
                const task = queue.push.secondCall.args[0];
                task.should.be.a('object');
                task.url.should.equal('/notifications/mark-read');
            });
            it('second request should set delay', () => {
                object.getNotifications(() => 0);
                const callback1 = queue.push.firstCall.args[0].callback;
                callback1(null, null);
                queue.push.callCount.should.equal(2);
                const task = queue.push.secondCall.args[0];
                task.should.be.a('object');
                task.delay.should.equal(object.delay);
            });
            it('second request should not set form', () => {
                object.getNotifications(() => 0);
                const callback1 = queue.push.firstCall.args[0].callback;
                callback1(null, null);
                queue.push.callCount.should.equal(2);
                const task = queue.push.secondCall.args[0];
                task.should.be.a('object');
                expect(task.form).to.be.undefined;
            });
            it('should not make second request if frist failed', () => {
                object.getNotifications(() => 0);
                const callback1 = queue.push.firstCall.args[0].callback;
                callback1('error', null);
                queue.push.callCount.should.equal(1);
            });
            it('should pass error onto callback from first request', () => {
                const spy = sinon.spy();
                object.getNotifications(spy);
                const callback1 = queue.push.firstCall.args[0].callback;
                callback1('error', null);
                spy.calledWith('error').should.be.true;
            });
            it('should pass error onto callback from second request', () => {
                const spy = sinon.spy();
                object.getNotifications(spy);
                const callback1 = queue.push.firstCall.args[0].callback;
                callback1(null, 'notifications');
                const callback2 = queue.push.secondCall.args[0].callback;
                callback2('error2');
                spy.calledWith('error2', 'notifications').should.be.true;
            });
            it('should pass notifications from first request onto callback on success', () => {
                const spy = sinon.spy();
                object.getNotifications(spy);
                const callback1 = queue.push.firstCall.args[0].callback;
                callback1(null, 'notifications');
                const callback2 = queue.push.secondCall.args[0].callback;
                callback2(null);
                spy.calledWith(null, 'notifications').should.be.true;
            });
        });
        describe('postAction()', () => {
            let object, queue;
            beforeEach(() => {
                object = {
                    delay: 0,
                    queue: {
                        push: sinon.stub()
                    },
                    postAction: browserModule.externals.postAction
                };
                queue = object.queue;
            });
            it('should set HTTP method', () => {
                object.postAction('like', 0, '', () => 0);
                queue.push.firstCall.args[0].method.should.equal('POST');
            });
            it('should set URL', () => {
                object.postAction('like', 0, '', () => 0);
                queue.push.firstCall.args[0].url.should.equal('/post_actions');
            });
            it('should set delay', () => {
                object.delay = Math.random();
                object.postAction('like', 0, '', () => 0);
                queue.push.firstCall.args[0].delay.should.equal(object.delay);
            });
            it('should set form.id', () => {
                const id = Math.random();
                object.postAction('like', id, '', () => 0);
                queue.push.firstCall.args[0].form.id.should.equal(id);
            });
            it('should set form.post_action_type_id method', () => {
                object.postAction('like', 0, '', () => 0);
                queue.push.firstCall.args[0].form.post_action_type_id.should.equal(2);
            });
            it('should set form.flag_topic', () => {
                object.postAction('like', 0, '', () => 0);
                queue.push.firstCall.args[0].form.flag_topic.should.be.false;
            });
            it('should set form.message', () => {
                const message = Math.random();
                object.postAction('like', 0, message, () => 0);
                queue.push.firstCall.args[0].form.message.should.equal(message);
            });
            it('should set callback', () => {
                const spy = sinon.spy();
                object.postAction('like', 0, '', spy);
                queue.push.firstCall.args[0].callback.should.equal(spy);
            });
        });
    });
    describe('privateFns', () => {
        const fns = ['queueWorker', 'setTrustLevel', 'setPostUrl', 'cleanPostRaw', 'cleanPost', 'getCSRF', 'doLogin'];
        describe('should include expected functions:', () => {
            fns.forEach((fn) => {
                it('should have: ' + fn + '()', () => expect(browserModule.privateFns[fn]).to.be.a('function'));
            });
        });
        it('should include only expected keys', () => {
            browserModule.privateFns.should.have.all.keys(fns);
        });
        describe('queueWorker()', () => {
            const queueWorker = browserModule.privateFns.queueWorker,
                request = browserModule.internals.request;
            let clock;
            before(() => {
                clock = sinon.useFakeTimers();
            });
            it('should delay completion according to delay parameter to throttle requests', (done) => {
                browserModule.internals.request = (_, cb) => cb(null, null, '"foobar"');
                const spy = sinon.spy(),
                    delay = Math.ceil(1500 + Math.random() * 5000);
                queueWorker({
                    delay: delay
                }, spy);
                clock.tick(delay - 1);
                spy.called.should.be.false;
                clock.tick(2);
                spy.called.should.be.true;
                done();
            });
            it('should not delay completion if delay parameter omitted', (done) => {
                browserModule.internals.request = (_, cb) => cb(null, null, '"foobar"');
                const spy = sinon.spy();
                queueWorker({}, spy);
                clock.tick(0);
                spy.called.should.be.true;
                done();
            });
            it('should accept invalid JSON', (done) => {
                browserModule.internals.request = (_, cb) => cb(null, null, '"foobar');
                const queueSpy = sinon.spy(),
                    callbackSpy = sinon.spy();
                queueWorker({
                    callback: callbackSpy
                }, queueSpy);
                clock.tick(0);
                callbackSpy.called.should.be.true;
                callbackSpy.lastCall.args.should.have.length(2);
                expect(callbackSpy.lastCall.args[0]).to.be.null;
                callbackSpy.lastCall.args[1].should.equal('"foobar');
                done();
            });
            it('should pass errors to task.callback', (done) => {
                browserModule.internals.request = (_, cb) => cb('ERROR', null, null);
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
                browserModule.internals.request = (opts, cb) => {
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
                browserModule.internals.request = (opts, cb) => {
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
                browserModule.internals.request = (opts, cb) => {
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
                browserModule.internals.request = (opts, cb) => {
                    req = opts;
                    cb();
                };
                const queueSpy = sinon.spy();
                queueWorker({
                    url: '/posts'
                }, queueSpy);
                clock.tick(5000);
                queueSpy.called.should.be.true;
                req.url.should.equal(config.core.forum + '/posts');
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
                browserModule.internals.request = (opts, cb) => {
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
                browserModule.internals.request = request;
            });
        });
        describe('getCSRF()', () => {
            const queue = {
                    push: sinon.stub()
                },
                getCSRF = browserModule.privateFns.getCSRF;
            it('should set http method to GET', () => {
                queue.push.reset();
                getCSRF(0, queue, () => 0);
                const args = queue.push.lastCall.args;
                args.should.have.length(1);
                args[0].should.have.any.key('method');
                args[0].method.should.equal('GET');
            });
            it('should set url', () => {
                queue.push.reset();
                getCSRF(0, queue, () => 0);
                const args = queue.push.lastCall.args;
                args.should.have.length(1);
                args[0].should.have.any.key('url');
                args[0].url.should.equal('/session/csrf.json');
            });
            it('should not set form', () => {
                queue.push.reset();
                getCSRF(0, queue, () => 0);
                const args = queue.push.lastCall.args;
                args.should.have.length(1);
                args[0].should.not.have.any.key('form');
            });
            it('should set callback', () => {
                queue.push.reset();
                getCSRF(0, queue, () => 0);
                const args = queue.push.lastCall.args;
                args.should.have.length(1);
                args[0].should.have.any.key('callback');
                args[0].callback.should.be.a('function');
            });
            it('should set delay', () => {
                const delay = Math.ceil(1500 + Math.random() * 5000);
                queue.push.reset();
                getCSRF(delay, queue, () => 0);
                const args = queue.push.lastCall.args;
                args.should.have.length(1);
                args[0].should.have.any.key('delay');
                args[0].delay.should.equal(delay);
            });
            it('should pass err to external callback on completion', () => {
                queue.push.reset();
                queue.push.yieldsTo('callback', new Error('test error!'));
                const spy = sinon.spy();
                getCSRF(0, queue, spy);
                spy.called.should.be.true;
                spy.lastCall.args.should.have.length(1);
                spy.lastCall.args[0].should.be.an.instanceOf(Error);
            });
            it('should pass null as err on successful completion', () => {
                queue.push.reset();
                queue.push.yieldsTo('callback', null, {});
                const spy = sinon.spy();
                getCSRF(0, queue, spy);
                spy.called.should.be.true;
                spy.lastCall.args.should.have.length(1);
                expect(spy.lastCall.args[0]).to.equal(null);
            });
            it('should set defaults CSRF token', () => {
                queue.push.reset();
                queue.push.yieldsTo('callback', null, {
                    csrf: 'madness? this is CSRF!'
                });
                const spy = sinon.spy();
                getCSRF(0, queue, spy);
                browserModule.internals.defaults.headers.should.have.any.key('X-CSRF-Token');
                browserModule.internals.defaults.headers['X-CSRF-Token'].should.equal('madness? this is CSRF!');
            });
            it('should set allow non json response', () => {
                queue.push.reset();
                queue.push.yieldsTo('callback', null, 'CSRF!');
                const spy = sinon.spy();
                getCSRF(0, queue, spy);
                browserModule.internals.defaults.headers.should.have.any.key('X-CSRF-Token');
                expect(browserModule.internals.defaults.headers['X-CSRF-Token']).to.equal(undefined);
            });
            it('should set allow non response', () => {
                queue.push.reset();
                queue.push.yieldsTo('callback', null, null);
                const spy = sinon.spy();
                getCSRF(0, queue, spy);
                browserModule.internals.defaults.headers.should.have.any.key('X-CSRF-Token');
                expect(browserModule.internals.defaults.headers['X-CSRF-Token']).to.equal(undefined);
            });
            it('should update request', () => {
                queue.push.reset();
                queue.push.yieldsTo('callback', null, {
                    csrf: 'other CSRF!'
                });
                const spy = sinon.spy(),
                    request = browserModule.internals.request;
                getCSRF(0, queue, spy);
                browserModule.internals.request.should.not.equal(request);
            });
        });
        describe('doLogin()', () => {
            const queue = {
                    push: sinon.stub()
                },
                doLogin = browserModule.privateFns.doLogin;
            it('should set http method to POST', () => {
                queue.push.reset();
                doLogin(0, queue, () => 0);
                const args = queue.push.lastCall.args;
                args.should.have.length(1);
                args[0].should.have.any.key('method');
                args[0].method.should.equal('POST');
            });
            it('should set url', () => {
                queue.push.reset();
                doLogin(0, queue, () => 0);
                const args = queue.push.lastCall.args;
                args.should.have.length(1);
                args[0].should.have.any.key('url');
                args[0].url.should.equal('/session');
            });
            it('should set form', () => {
                queue.push.reset();
                doLogin(0, queue, () => 0);
                const args = queue.push.lastCall.args;
                args.should.have.length(1);
                args[0].should.have.any.key('form');
            });
            it('should set callback', () => {
                queue.push.reset();
                doLogin(0, queue, () => 0);
                const args = queue.push.lastCall.args;
                args.should.have.length(1);
                args[0].should.have.any.key('callback');
                args[0].callback.should.be.a('function');
            });
            it('should pass err to external callback on failure', () => {
                queue.push.reset();
                queue.push.yieldsTo('callback', new Error('test error!'));
                const spy = sinon.spy();
                doLogin(0, queue, spy);
                spy.called.should.be.true;
                spy.lastCall.args.should.have.length(1);
                spy.lastCall.args[0].should.be.an.instanceOf(Error);
            });
            it('should pass err to external callback on completion without data', () => {
                queue.push.reset();
                queue.push.yieldsTo('callback', null, '');
                const spy = sinon.spy();
                doLogin(0, queue, spy);
                spy.called.should.be.true;
                spy.lastCall.args.should.have.length(1);
                spy.lastCall.args[0].should.equal('Unknown Login Failure');
            });
            it('should pass post to external callback on completion', () => {
                queue.push.reset();
                queue.push.yieldsTo('callback', null, {});
                const spy = sinon.spy();
                doLogin(0, queue, spy);
                spy.called.should.be.true;
                spy.lastCall.args.should.have.length(2);
                expect(spy.lastCall.args[0]).to.equal(null);
            });
        });
        describe('cleanPostRaw()', () => {
            const cleanPostRaw = browserModule.privateFns.cleanPostRaw;
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
                    ['Topic quote with multiline text', '[quote="accalia, post:108"]\nthis is a quote\n\r\n[/quote]',
                        ''
                    ],
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
                    ['Malformed open quote', '[quote="accalia, post:108, topic:49440, full:true"this is a quote' +
                        '[/quote]', '[quote="accalia, post:108, topic:49440, full:true"this is a quote[/quote]'
                    ],
                    ['Malformed close quote', '[quote="accalia, post:108, topic:49440, full:true"]this is a quote' +
                        '/quote]', '[quote="accalia, post:108, topic:49440, full:true"]this is a quote/quote]'
                    ],
                    ['Malformed close quote 2', '[quote="accalia, post:108, topic:49440"][/quote',
                        '[quote="accalia, post:108, topic:49440"][/quote'
                    ],
                    ['Malformed open quote 2', '[quote="accalia, post:108, topic:49440"]this is a quote [quote]',
                        '[quote="accalia, post:108, topic:49440"]this is a quote [quote]'
                    ],
                    ['Only close quote', '[/quote]', '[/quote]'],
                    ['Malformed open quote 2', '[quoteaccalia, post:108"][/quote]',
                        '[quoteaccalia, post:108"][/quote]'
                    ],
                    ['Only a quote', '[quote=a]i am stripped[/quote]', ''],
                    ['Embedded quote', 'this is\n[quote=accalia][/quote] \r\na quote', 'this is\n \na quote'],
                    ['Nested quote simple', 'this[quote]nope[quote]no[/quote]nada[/quote] survives', 'this survives'],
                    ['Unmatched quote block', 'i am not a [quote]', 'i am not a [quote]'],
                    ['Unmatched quote in valid quote', 'this[quote]nope[quote]no[quote]nada[/quote] survives',
                        'this survives'
                    ],
                    ['Multiple quotes', '[quote="accalia, post:108, topic:49440, full:true"]\nthis is a quote' +
                        '[/quote] inner words [quote="accalia, post:108, topic:49440, full:true"]\nthis is another' +
                        ' quote[/quote]', ' inner words '
                    ],
                    ['Multiple quotes 2', 'before words\n[quote="accalia, post:108, topic:49440, full:true"]\n' +
                        'this is a quote[/quote] inner words [quote="accalia, post:108, topic:49440, full:true"]\n' +
                        'this is another quote[/quote]\nafter words', 'before words\n inner words \nafter words'
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
                    ['Multiple GFM blocks 2', 'before\n```\n1\n```\nmiddle\n```\n2\n```\nafter',
                        'before\nmiddle\nafter'
                    ],
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
                    ['double backtick with embedded singletick', ' ``code with ` embedded``',
                        ' ``code with ` embedded``'
                    ],
                    ['double backtick with embedded singletick and quote', ' `` ` [quote][/quote] ``',
                        ' `` ` [quote][/quote] ``'
                    ],
                    ['multiline double backtick', 'before ``code\ncode2`` after', 'before ``code\ncode2`` after'],
                    ['multiline double backtick with quote',
                        'before ``[quote]\n[/quote]`` after',
                        'before ``[quote]\n[/quote]`` after'
                    ],
                    ['multiline double backtick 2', 'before ``\ncode\ncode2\n`` after',
                        'before ``\ncode\ncode2\n`` after'
                    ],
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
                    ['inline triple backtick with singletick', '```code with ` embedded```',
                        '```code with ` embedded```'
                    ],
                    ['inline triple backtick with doubletick', '```code with `` embedded```',
                        '```code with `` embedded```'
                    ],
                    ['inline triple backtick with linebreak', '```code with\nlinebreak```',
                        '```code with\nlinebreak```'
                    ],
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
        describe('setTrustLevel()', () => {
            /*eslint-disable camelcase */
            const setTrustLevel = browserModule.privateFns.setTrustLevel,
                trust = coreBrowser.trustLevels,
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
                let owner;
                beforeEach(() => {
                    owner = 'owner' + Math.random();
                    config.core.owner = owner;
                });
                normalLevels.forEach((trustLevel) => {
                    it('should set to owner trust_level for owner tl' + trustLevel, () => {
                        const post = {
                            username: owner,
                            trust_level: trustLevel,
                            staff: false,
                            admin: false,
                            moderator: false
                        };
                        setTrustLevel(post).trust_level.should.equal(trust.owner);
                    });
                });
            });
            describe('trust hierarchy ', () => {
                let owner;
                beforeEach(() => {
                    owner = 'owner' + Math.random();
                    config.core.owner = owner;
                });
                it('Owner status should trump Admin flag', () => {
                    const post = {
                        username: owner,
                        trust_level: trust.tl3,
                        staff: false,
                        admin: true,
                        moderator: false
                    };
                    setTrustLevel(post).trust_level.should.equal(trust.owner);
                });
                it('Owner status should trump Moderator flag', () => {
                    const post = {
                        username: config.core.owner,
                        trust_level: trust.tl3,
                        staff: false,
                        admin: false,
                        moderator: true
                    };
                    setTrustLevel(post).trust_level.should.equal(trust.owner);
                });
                it('Owner status should trump staff flag', () => {
                    const post = {
                        username: config.core.owner,
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
        describe('setPostUrl()', () => {
            const setPostUrl = browserModule.privateFns.setPostUrl;
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
        describe('cleanPost()', () => {
            const cleanPost = browserModule.privateFns.cleanPost;
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
                    'trust_level': coreBrowser.trustLevels.tl2
                };
                cleanPost(post);
                post.trust_level.should.equal(coreBrowser.trustLevels.admin);
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
    });
});
