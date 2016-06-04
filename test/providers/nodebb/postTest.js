'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.should();

const sinon = require('sinon');
require('sinon-as-promised');

const postModule = require('../../../providers/nodebb/post');
const utils = require('../../../lib/utils');

describe('providers/nodebb/post', () => {
    it('should export bindPost()', () => {
        postModule.bindPost.should.be.a('function');
    });
    it('should return a class on call to bindPost()', () => {
        postModule.bindPost({}).should.be.a('function');
    });
    describe('Post', () => {
        const forum = {};
        const Post = postModule.bindPost(forum);
        beforeEach(() => {
            forum._emit = sinon.stub().resolves();
            forum.fetchObject = sinon.stub().resolves();
        });
        describe('ctor()', () => {
            it('should store instance data in utils.storage', () => {
                const post = new Post({});
                utils.mapGet(post).should.be.ok;
            });
            it('should accept serialized input', () => {
                const post = new Post('{}');
                utils.mapGet(post).should.be.ok;
            });
            [
                ['authorId', 'uid'],
                ['content', 'content'],
                ['id', 'pid'],
                ['topicId', 'tid']
            ].forEach((keys) => {
                const outKey = keys[0],
                    inKey = keys[1];
                it(`should store ${outKey} in utils.storage`, () => {
                    const expected = `a${Math.random()}b`;
                    const values = {};
                    values[inKey] = expected;
                    const post = new Post(values);
                    utils.mapGet(post, outKey).should.equal(expected);
                });
            });
            it('should parse timestamp for posted', () => {
                const expected = Math.round(Math.random() * (2 << 29));
                const user = new Post({
                    timestamp: expected
                });
                utils.mapGet(user, 'posted').getTime().should.equal(expected);
            });
        });
        describe('simple getters', () => {
            let post, data;
            beforeEach(() => {
                post = new Post({});
                data = utils.mapGet(post);
            });
            ['id', 'authorId', 'content', 'topicId', 'posted'].forEach((key) => {
                it(`should get value from utils.storage for ${key}`, () => {
                    const expected = `${Math.random()}${Math.random()}`;
                    data[key] = expected;
                    post[key].should.equal(expected);
                });
            });
        });
        describe('markup()', () => {
            let post = null,
                data = null,
                sandbox = null;
            beforeEach(() => {
                sandbox = sinon.sandbox.create();
                sandbox.stub(Post, 'preview').resolves();
                post = new Post({});
                data = utils.mapGet(post);
            });
            afterEach(() => sandbox.restore());
            it('should proxy markup() to Post.preview()', () => {
                return post.markup().then(() => {
                    Post.preview.called.should.be.true;
                });
            });
            it('should resolve to results toresults of Post.preview()', () => {
                const expected = Math.random();
                Post.preview.resolves(expected);
                return post.markup().should.become(expected);
            });
            it('should pass contents to Post.preview()', () => {
                const expected = Math.random();
                data.content = expected;
                return post.markup().then(() => {
                    Post.preview.calledWith(expected).should.be.true;
                });
            });
        });
        describe('url()', () => {
            let post = null,
                data = null;
            beforeEach(() => {
                post = new Post({});
                data = utils.mapGet(post);
                forum.Format = {
                    urlForPost: sinon.stub()
                };
            });
            it('should return a promise', () => {
                chai.expect(post.url()).to.be.an.instanceOf(Promise);
            });
            it('should pass postId to urlForPost', () => {
                const expected = Math.random();
                data.id = expected;
                return post.url().then(() => {
                    forum.Format.urlForPost.calledWith(expected).should.be.true;
                });
            });
            it('should resolve to result of urlForPost', () => {
                const expected = `/url/for/post/${Math.random()}`;
                forum.Format.urlForPost.returns(expected);
                return post.url().should.become(expected);
            });
            it('should reject when urlForPost throws', () => {
                const error = new Error(`/url/for/post/${Math.random()}`);
                forum.Format.urlForPost.throws(error);
                return post.url().should.be.rejectedWith(error);
            });
        });
        describe('reply()', () => {
            let post = null,
                data = null,
                sandbox = null;
            beforeEach(() => {
                sandbox = sinon.sandbox.create();
                sandbox.stub(Post, '_retryReply').resolves();
                post = new Post({});
                data = utils.mapGet(post);
            });
            afterEach(() => sandbox.restore());
            it('should proxy to Post._retryReply()', () => {
                return post.reply('').then(() => {
                    Post._retryReply.called.should.be.true;
                });
            });
            it('should pass post id, topicId and content to Post._retryReply()', () => {
                const id = Math.random();
                const topicId = Math.random();
                const content = `a${Math.random()}b`;
                data.id = id;
                data.topicId = topicId;
                return post.reply(content).then(() => {
                    Post._retryReply.calledWith(topicId, id, content, 5).should.be.true;
                });
            });
            it('should resolve to results of Post.reply()', () => {
                const expected = Math.random();
                Post._retryReply.resolves(expected);
                return post.reply('').should.become(expected);
            });
            it('should resolve to results of Post._retryReply()', () => {
                Post._retryReply.rejects('bad');
                return post.reply('').should.be.rejected;
            });
        });
        describe('edit()', () => {
            let post = null,
                data = null,
                sandbox = null;
            beforeEach(() => {
                sandbox = sinon.sandbox.create();
                sandbox.stub(Post, 'parse').resolves();
                post = new Post({});
                data = utils.mapGet(post);
                forum._emit = sinon.stub().resolves({});
            });
            afterEach(() => sandbox.restore());
            it('should emit `plugins.composer.push` to retrieve post values', () => {
                data.id = Math.random();
                return post.edit('').then(() => {
                    forum._emit.calledWith('plugins.composer.push', data.id).should.be.true;
                });
            });
            it('should emit `posts.edit` to edit post', () => {
                data.id = Math.random();
                return post.edit('').then(() => {
                    forum._emit.calledWith('posts.edit').should.be.true;
                });
            });
            it('should combine data from composer to pass to `posts.edit`', () => {
                const id = Math.random();
                const tags = Math.random();
                const title = Math.random();
                const content = Math.random();
                data.id = Math.random();
                forum._emit.onFirstCall().resolves({
                    pid: id,
                    tags: tags,
                    title: title
                });
                return post.edit(content).then(() => {
                    forum._emit.calledWith('posts.edit', {
                        pid: id,
                        tags: tags,
                        title: title,
                        content: content
                    }).should.be.true;
                });
            });
            it('should reject if `plugins.composer.push` rejects', () => {
                forum._emit.onFirstCall().rejects('bad');
                return post.edit('').should.be.rejected;
            });
            it('should reject if `posts.edit` rejects', () => {
                forum._emit.onSecondCall().rejects('bad');
                return post.edit('').should.be.rejected;
            });
            it('should parse edit results via Post.parse()', () => {
                const expected = Math.random();
                forum._emit.onSecondCall().resolves(expected);
                return post.edit('').then(() => {
                    Post.parse.calledWith(expected).should.be.true;
                });
            });
            it('should resolve to results of Post.parse()', () => {
                const expected = Math.random();
                Post.parse.resolves(expected);
                return post.edit('').should.become(expected);
            });
            it('should append reason to post when provided', () => {
                const text = 'text text text';
                const reason = 'rasin rasin';
                const expected = 'text text text\n\n###### rasin rasin';
                return post.edit(text, reason).then(() => {
                    forum._emit.secondCall.args[1].content.should.equal(expected);
                });
            });
        });
        describe('append()', () => {
            let post = null,
                data = null,
                sandbox = null;
            beforeEach(() => {
                sandbox = sinon.sandbox.create();
                sandbox.stub(Post, 'parse').resolves();
                post = new Post({});
                data = utils.mapGet(post);
                forum._emit = sinon.stub().resolves({});
            });
            afterEach(() => sandbox.restore());
            it('should emit `plugins.composer.push` to retrieve post values', () => {
                data.id = Math.random();
                return post.append('').then(() => {
                    forum._emit.calledWith('plugins.composer.push', data.id).should.be.true;
                });
            });
            it('should emit `posts.edit` to edit post', () => {
                data.id = Math.random();
                return post.append('').then(() => {
                    forum._emit.calledWith('posts.edit').should.be.true;
                });
            });
            it('should combine data from composer to pass to `posts.edit`', () => {
                const id = Math.random();
                const tags = Math.random();
                const title = Math.random();
                const content = Math.random();
                data.id = Math.random();
                forum._emit.onFirstCall().resolves({
                    pid: id,
                    tags: tags,
                    title: title,
                    body: ''
                });
                return post.append(content).then(() => {
                    forum._emit.calledWith('posts.edit', {
                        pid: id,
                        tags: tags,
                        title: title,
                        content: `\n\n---\n\n${content}`
                    }).should.be.true;
                });
            });
            it('should reject if `plugins.composer.push` rejects', () => {
                forum._emit.onFirstCall().rejects('bad');
                return post.append('').should.be.rejected;
            });
            it('should reject if `posts.edit` rejects', () => {
                forum._emit.onSecondCall().rejects('bad');
                return post.append('').should.be.rejected;
            });
            it('should parse edit results via Post.parse()', () => {
                const expected = Math.random();
                forum._emit.onSecondCall().resolves(expected);
                return post.append('').then(() => {
                    Post.parse.calledWith(expected).should.be.true;
                });
            });
            it('should resolve to results of Post.parse()', () => {
                const expected = Math.random();
                Post.parse.resolves(expected);
                return post.append('').should.become(expected);
            });
            it('should append content to existing post', () => {
                const existing = 'some text!';
                const text = 'text text text';
                const expected = 'some text!\n\n---\n\ntext text text';
                forum._emit.resolves({
                    body: existing
                });
                return post.append(text).then(() => {
                    forum._emit.secondCall.args[1].content.should.equal(expected);
                });
            });
            it('should append reason to post when provided', () => {
                const existing = 'some text!';
                const text = 'text text text';
                const reason = 'rasin rasin';
                const expected = 'some text!\n\n---\n\ntext text text\n\n###### rasin rasin';
                forum._emit.resolves({
                    body: existing
                });
                return post.append(text, reason).then(() => {
                    forum._emit.secondCall.args[1].content.should.equal(expected);
                });
            });
        });
        describe('post tools', () => {
            describe('delete()', () => {
                let post = null,
                    data = null;
                beforeEach(() => {
                    post = new Post({});
                    data = utils.mapGet(post);
                    forum._emit = sinon.stub().resolves({});
                });
                it('should emit `posts.delete`', () => {
                    return post.delete().then(() => {
                        forum._emit.calledWith('posts.delete').should.be.true;
                    });
                });
                it('should pass postId and topicId to `posts.delete`', () => {
                    data.id = Math.random();
                    data.topicId = Math.random();
                    return post.delete().then(() => {
                        forum._emit.calledWith('posts.delete', {
                            pid: data.id,
                            tid: data.topicId
                        }).should.be.true;
                    });
                });
                it('should resolve to self', () => {
                    return post.delete().should.become(post);
                });
                it('should reject when `posts.delete` rejects', () => {
                    forum._emit.rejects('bad');
                    return post.delete().should.be.rejected;
                });
            });
            describe('undelete()', () => {
                let post = null,
                    data = null;
                beforeEach(() => {
                    post = new Post({});
                    data = utils.mapGet(post);
                    forum._emit = sinon.stub().resolves({});
                });
                it('should emit `posts.restore`', () => {
                    return post.undelete().then(() => {
                        forum._emit.calledWith('posts.restore').should.be.true;
                    });
                });
                it('should pass postId and topicId to `posts.restore`', () => {
                    data.id = Math.random();
                    data.topicId = Math.random();
                    return post.undelete().then(() => {
                        forum._emit.calledWith('posts.restore', {
                            pid: data.id,
                            tid: data.topicId
                        }).should.be.true;
                    });
                });
                it('should resolve to self', () => {
                    return post.undelete().should.become(post);
                });
                it('should reject when `posts.delete` rejects', () => {
                    forum._emit.rejects('bad');
                    return post.undelete().should.be.rejected;
                });
            });
            describe('upvote()', () => {
                let post = null,
                    data = null;
                beforeEach(() => {
                    post = new Post({});
                    data = utils.mapGet(post);
                    forum._emit = sinon.stub().resolves({});
                });
                it('should emit `posts.upvote`', () => {
                    return post.upvote().then(() => {
                        forum._emit.calledWith('posts.upvote').should.be.true;
                    });
                });
                it('should pass postId and topicId to `posts.upvote`', () => {
                    data.id = Math.random();
                    data.topicId = Math.random();
                    return post.upvote().then(() => {
                        forum._emit.calledWith('posts.upvote', {
                            pid: data.id,
                            'room_id': `topic_${data.topicId}`
                        }).should.be.true;
                    });
                });
                it('should resolve to self', () => {
                    return post.upvote().should.become(post);
                });
                it('should reject when `posts.upvote` rejects', () => {
                    forum._emit.rejects('bad');
                    return post.upvote().should.be.rejected;
                });
            });
            describe('downvote()', () => {
                let post = null,
                    data = null;
                beforeEach(() => {
                    post = new Post({});
                    data = utils.mapGet(post);
                    forum._emit = sinon.stub().resolves({});
                });
                it('should emit `posts.downvote`', () => {
                    return post.downvote().then(() => {
                        forum._emit.calledWith('posts.downvote').should.be.true;
                    });
                });
                it('should pass postId and topicId to `posts.downvote`', () => {
                    data.id = Math.random();
                    data.topicId = Math.random();
                    return post.downvote().then(() => {
                        forum._emit.calledWith('posts.downvote', {
                            pid: data.id,
                            'room_id': `topic_${data.topicId}`
                        }).should.be.true;
                    });
                });
                it('should resolve to self', () => {
                    return post.downvote().should.become(post);
                });
                it('should reject when `posts.downvote` rejects', () => {
                    forum._emit.rejects('bad');
                    return post.downvote().should.be.rejected;
                });
            });
            describe('unvote()', () => {
                let post = null,
                    data = null;
                beforeEach(() => {
                    post = new Post({});
                    data = utils.mapGet(post);
                    forum._emit = sinon.stub().resolves({});
                });
                it('should emit `posts.unvote`', () => {
                    return post.unvote().then(() => {
                        forum._emit.calledWith('posts.unvote').should.be.true;
                    });
                });
                it('should pass postId and topicId to `posts.unvote`', () => {
                    data.id = Math.random();
                    data.topicId = Math.random();
                    return post.unvote().then(() => {
                        forum._emit.calledWith('posts.unvote', {
                            pid: data.id,
                            'room_id': `topic_${data.topicId}`
                        }).should.be.true;
                    });
                });
                it('should resolve to self', () => {
                    return post.unvote().should.become(post);
                });
                it('should reject when `posts.unvote` rejects', () => {
                    forum._emit.rejects('bad');
                    return post.unvote().should.be.rejected;
                });
            });
            describe('bookmark()', () => {
                let post = null,
                    data = null;
                beforeEach(() => {
                    post = new Post({});
                    data = utils.mapGet(post);
                    forum._emit = sinon.stub().resolves({});
                });
                it('should emit `posts.favorite`', () => {
                    return post.bookmark().then(() => {
                        forum._emit.calledWith('posts.favorite').should.be.true;
                    });
                });
                it('should pass postId and topicId to `posts.favorite`', () => {
                    data.id = Math.random();
                    data.topicId = Math.random();
                    return post.bookmark().then(() => {
                        forum._emit.calledWith('posts.favorite', {
                            pid: data.id,
                            'room_id': `topic_${data.topicId}`
                        }).should.be.true;
                    });
                });
                it('should resolve to self', () => {
                    return post.bookmark().should.become(post);
                });
                it('should reject when `posts.bookmark` rejects', () => {
                    forum._emit.rejects('bad');
                    return post.bookmark().should.be.rejected;
                });
            });
            describe('unbookmark()', () => {
                let post = null,
                    data = null;
                beforeEach(() => {
                    post = new Post({});
                    data = utils.mapGet(post);
                    forum._emit = sinon.stub().resolves({});
                });
                it('should emit `posts.unfavorite`', () => {
                    return post.unbookmark().then(() => {
                        forum._emit.calledWith('posts.unfavorite').should.be.true;
                    });
                });
                it('should pass postId and topicId to `posts.unfavorite`', () => {
                    data.id = Math.random();
                    data.topicId = Math.random();
                    return post.unbookmark().then(() => {
                        forum._emit.calledWith('posts.unfavorite', {
                            pid: data.id,
                            'room_id': `topic_${data.topicId}`
                        }).should.be.true;
                    });
                });
                it('should resolve to self', () => {
                    return post.unbookmark().should.become(post);
                });
                it('should reject when `posts.unbookmark` rejects', () => {
                    forum._emit.rejects('bad');
                    return post.unbookmark().should.be.rejected;
                });
            });
        });
        describe('functions', () => {

            describe('reply()', () => {
                let sandbox = null;
                beforeEach(() => {
                    sandbox = sinon.sandbox.create();
                    sandbox.stub(Post, '_retryReply').resolves();
                });
                afterEach(() => sandbox.restore());
                it('should proxy to Post._retryReply()', () => {
                    return Post.reply('').then(() => {
                        Post._retryReply.called.should.be.true;
                    });
                });
                it('should pass post id, topicId and content to Post._retryReply()', () => {
                    const id = Math.random();
                    const topicId = Math.random();
                    const content = `a${Math.random()}b`;
                    return Post.reply(topicId, id, content).then(() => {
                        Post._retryReply.calledWith(topicId, id, content, 5).should.be.true;
                    });
                });
                it('should resolve to results of Post.reply()', () => {
                    const expected = Math.random();
                    Post._retryReply.resolves(expected);
                    return Post.reply(1, 2, '').should.become(expected);
                });
                it('should resolve to results of Post._retryReply()', () => {
                    Post._retryReply.rejects('bad');
                    return Post.reply(1, 2, '').should.be.rejected;
                });
            });
            describe('_retryDelay()', () => {
                it('should return expected delay', () => {
                    Post._retryDelay().should.equal(10 * 1000);
                });
            });
            describe('_retryReply()', () => {
                let sandbox = null;
                beforeEach(() => {
                    sandbox = sinon.sandbox.create();
                    sandbox.stub(Post, '_retryDelay').returns(5);
                    sandbox.stub(Post, 'parse').resolves();
                    forum._emit = sinon.stub().resolves();
                });
                afterEach(() => sandbox.restore());
                it('should emit `posts.reply`', () => {
                    return Post.reply(1, 2, '').then(() => {
                        forum._emit.calledWith('posts.reply').should.be.true;
                    });
                });
                it('should pass post spec to `posts.reply`', () => {
                    const topic = Math.random();
                    const post = Math.random();
                    const content = `${Math.random()}${Math.random()}`;
                    return Post.reply(topic, post, content).then(() => {
                        forum._emit.calledWith('posts.reply', {
                            tid: topic,
                            toPid: post,
                            lock: false,
                            content: content
                        }).should.be.true;
                        forum._emit.callCount.should.equal(1);
                    });
                });
                it('should reject if `posts.reply` rejects', () => {
                    forum._emit.rejects('bad');
                    return Post.reply(1, 2, '').should.be.rejected;
                });
                it('should pass results of `posts.reply` to Post.parse()', () => {
                    const expected = Math.random();
                    forum._emit.resolves(expected);
                    return Post.reply(1, 2, '').then(() => {
                        Post.parse.calledWith(expected).should.be.true;
                    });
                });
                it('should resolve to results of Post.parse()', () => {
                    const expected = Math.random();
                    Post.parse.resolves(expected);
                    return Post.reply(1, 2, '').should.become(expected);
                });
                it('should retry when first request failes with rate limit error', () => {
                    forum._emit.onFirstCall().rejects({
                        message: '[[error:too-many-posts'
                    });
                    return Post.reply(1, 2, '').then(() => {
                        forum._emit.callCount.should.equal(2);
                    });
                });
                it('should retry when first request failes with rate limit error', () => {
                    forum._emit.rejects({
                        message: '[[error:too-many-posts'
                    });
                    return Post.reply(1, 2, '').then(() => {
                        chai.assert.fail('should not have resolved');
                    }, () => {
                        forum._emit.callCount.should.equal(5);
                    });
                });
                it('should call _retryDelay() to determine wait time', () => {
                    forum._emit.onFirstCall().rejects({
                        message: '[[error:too-many-posts'
                    });
                    return Post.reply(1, 2, '').then(() => {
                        forum._emit.callCount.should.equal(2);
                        Post._retryDelay.called.should.be.true;
                    });
                });
            });
            describe('get()', () => {
                it('should load via function `posts.getPost`', () => {
                    const expected = Math.random();
                    return Post.get(expected).then(() => {
                        forum.fetchObject.calledWith('posts.getPost', expected, Post.parse).should.be.true;
                    });
                });
                it('should resolve to result of forum.fetchObject()', () => {
                    const expected = Math.random();
                    forum.fetchObject.resolves(expected);
                    return Post.get(5).should.become(expected);
                });
                it('should reject when websocket rejects', () => {
                    forum.fetchObject.rejects('bad');
                    return Post.get(5).should.be.rejected;
                });
            });
            describe('preview()', () => {
                beforeEach(() => {
                    forum._emit = sinon.stub().resolves();
                });
                it('should emit `plugins.composer.renderPreview`', () => {
                    return Post.preview('').then(() => {
                        forum._emit.calledWith('plugins.composer.renderPreview').should.be.true;
                    });
                });
                it('should pass content `plugins.composer.renderPreview`', () => {
                    const content = `a${Math.random()}b`;
                    return Post.preview(content).then(() => {
                        forum._emit.calledWith('plugins.composer.renderPreview', content).should.be.true;
                    });
                });
                it('should resolve to results of `plugins.composer.renderPreview`', () => {
                    const content = `a${Math.random()}b`;
                    forum._emit.resolves(content);
                    return Post.preview('').should.become(content);
                });
                it('should reject when `plugins.composer.renderPreview` rejects', () => {
                    forum._emit.rejects('bad');
                    return Post.preview('').should.be.rejected;
                });
            });
            describe('parse()', () => {
                it('should store instance data in utils.storage', () => {
                    const post = Post.parse({});
                    utils.mapGet(post).should.be.ok;
                });
                it('should accept serialized input', () => {
                    const post = Post.parse('{}');
                    utils.mapGet(post).should.be.ok;
                });
                [
                    ['authorId', 'uid'],
                    ['content', 'content'],
                    ['id', 'pid'],
                    ['topicId', 'tid']
                ].forEach((keys) => {
                    const outKey = keys[0],
                        inKey = keys[1];
                    it(`should store ${outKey} in utils.storage`, () => {
                        const expected = `a${Math.random()}b`;
                        const values = {};
                        values[inKey] = expected;
                        const post = Post.parse(values);
                        utils.mapGet(post, outKey).should.equal(expected);
                    });
                });
                it('should parse timestamp for posted', () => {
                    const expected = Math.round(Math.random() * (2 << 29));
                    const user = Post.parse({
                        timestamp: expected
                    });
                    utils.mapGet(user, 'posted').getTime().should.equal(expected);
                });
            });
        });
    });
});
