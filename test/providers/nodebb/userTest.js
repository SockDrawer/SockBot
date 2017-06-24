'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.should();

const sinon = require('sinon');
chai.use(require('sinon-chai'));

const userModule = require('../../../providers/nodebb/user');
const utils = require('../../../lib/utils');

describe('providers/nodebb/user', () => {
    it('should export bindUser()', () => {
        userModule.bindUser.should.be.a('function');
    });
    it('should return a class on call to bindUser()', () => {
        userModule.bindUser({}).should.be.a('function');
    });
    describe('User', () => {
        const forum = {};
        const User = userModule.bindUser(forum);
        beforeEach(() => {
            forum._emit = sinon.stub().resolves();
            forum.fetchObject = sinon.stub().resolves();
            forum.Chat = {
                create: sinon.stub().resolves()
            };
        });
        describe('ctor()', () => {
            it('should store instance data in utils.storage', () => {
                const user = new User({});
                utils.mapGet(user).should.be.ok;
            });
            it('should accept serialized input', () => {
                const user = new User('{}');
                utils.mapGet(user).should.be.ok;
            });
            [
                ['username', 'username'],
                ['name', 'fullname'],
                ['email', 'email'],
                ['avatar', 'picture'],
                ['id', 'uid'],
                ['postCount', 'postcount'],
                ['topicCount', 'topiccount'],
                ['reputation', 'reputation']
            ].forEach((keys) => {
                const outKey = keys[0],
                    inKey = keys[1];
                it(`should store ${outKey} in utils.storage`, () => {
                    const expected = `a${Math.random()}b`;
                    const values = {};
                    values[inKey] = expected;
                    const user = new User(values);
                    utils.mapGet(user, outKey).should.equal(expected);
                });
            });
            it('should parse timestamp for lastPosted', () => {
                const expected = Math.round(Math.random() * (2 << 29));
                const user = new User({
                    lastposttime: expected
                });
                utils.mapGet(user, 'lastPosted').getTime().should.equal(expected);
            });
            it('should parse timestamp for lastSeen', () => {
                const expected = Math.round(Math.random() * (2 << 29));
                const user = new User({
                    lastonline: expected
                });
                utils.mapGet(user, 'lastSeen').getTime().should.equal(expected);
            });
        });
        describe('simple getters', () => {
            let user, data;
            beforeEach(() => {
                user = new User({});
                data = utils.mapGet(user);
            });
            ['id', 'name', 'username', 'email', 'avatar', 'postCount',
                'topicCount', 'reputation', 'lastPosted', 'lastSeen'
            ].forEach((key) => {
                it(`should get value from utils.storage for ${key}`, () => {
                    const expected = `${Math.random()}${Math.random()}`;
                    data[key] = expected;
                    user[key].should.equal(expected);
                });
            });
        });
        it('should construct URL correctly', () => {
            forum.url = 'foobar';
            const user = new User({
                username: 'xyyzy'
            });
            return user.url().should.become('foobar/user/xyyzy');
        });
        ['follow', 'unfollow'].forEach((method) => {
            describe(`${method}()`, () => {
                let user;
                beforeEach(() => {
                    user = new User({
                        uid: Math.random()
                    });
                });
                it(`should emit 'user.${method}' over websocket`, () => {
                    return user[method]().then(() => {
                        forum._emit.calledWith(`user.${method}`, {
                            uid: user.id
                        }).should.be.true;
                    });
                });
                it('should resolve to user object for chaining', () => {
                    return user[method]().should.become(user);
                });
                it('should reject when websocket rejects', () => {
                    forum._emit.rejects('bad');
                    return user[method]().should.be.rejected;
                });
            });
        });
        describe('whisper()', () => {
            let user = null;
            beforeEach(() => {
                user = new User({
                    username: `username${Math.random()}`
                });
            });
            it('should proxy request to forum.Chat.create()', () => {
                const message = `message${Math.random()}`,
                    title = `title${Math.random()}`;
                return user.whisper(message, title).then(() => {
                    forum.Chat.create.should.be.calledWith(user.username, message, title);
                });
            });
        });
        describe('static get()', () => {
            it('should load via function `user.getUserByUID`', () => {
                const expected = Math.random();
                return User.get(expected).then(() => {
                    forum.fetchObject.should.have.been.calledWith('user.getUserByUID', expected, User.parse);
                });
            });
            it('should resolve to result of forum.fetchObject()', () => {
                const expected = Math.random();
                forum.fetchObject.resolves(expected);
                return User.get(5).should.become(expected);
            });
            it('should reject when websocket rejects', () => {
                forum.fetchObject.rejects('bad');
                return User.get(5).should.be.rejected;
            });
        });
        describe('static getByName()', () => {
            it('should load via function `user.getUserByUID`', () => {
                const expected = Math.random();
                return User.getByName(expected).then(() => {
                    forum.fetchObject.should.have.been.calledWith('user.getUserByUsername', expected, User.parse);
                });
            });
            it('should resolve to result of forum.fetchObject()', () => {
                const expected = Math.random();
                forum.fetchObject.resolves(expected);
                return User.getByName(5).should.become(expected);
            });
            it('should reject when websocket rejects', () => {
                forum.fetchObject.rejects('bad');
                return User.getByName(5).should.be.rejected;
            });
        });
        describe('parse()', () => {
            it('should throw error on falsy payload', () => {
                chai.expect(() => User.parse()).to.throw('E_USER_NOT_FOUND');
            });
            it('should store instance data in utils.storage', () => {
                const user = User.parse({});
                utils.mapGet(user).should.be.ok;
            });
            it('should accept serialized input', () => {
                const user = User.parse('{}');
                utils.mapGet(user).should.be.ok;
            });
            [
                ['username', 'username'],
                ['name', 'fullname'],
                ['email', 'email'],
                ['avatar', 'picture'],
                ['id', 'uid'],
                ['postCount', 'postcount'],
                ['topicCount', 'topiccount'],
                ['reputation', 'reputation']
            ].forEach((keys) => {
                const outKey = keys[0],
                    inKey = keys[1];
                it(`should store ${outKey} in utils.storage`, () => {
                    const expected = `a${Math.random()}b`;
                    const values = {};
                    values[inKey] = expected;
                    const user = User.parse(JSON.stringify(values));
                    utils.mapGet(user, outKey).should.equal(expected);
                });
            });
            it('should parse timestamp for lastPosted', () => {
                const expected = Math.round(Math.random() * (2 << 29));
                const user = User.parse(`{"lastposttime": ${expected}}`);
                utils.mapGet(user, 'lastPosted').getTime().should.equal(expected);
            });
            it('should parse timestamp for lastSeen', () => {
                const expected = Math.round(Math.random() * (2 << 29));
                const user = User.parse(`{"lastonline": ${expected}}`);
                utils.mapGet(user, 'lastSeen').getTime().should.equal(expected);
            });
        });
    });
});
