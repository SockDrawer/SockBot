'use strict';

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
chai.should();
const expect = chai.expect;

const sinon = require('sinon');
require('sinon-as-promised');

const user = require('../../../providers/nodebb/user');
const utils = require('../../../lib/utils');

describe('providers/nodebb/user', () => {
    it('should export bindUser()', () => {
        user.bindUser.should.be.a('function');
    });
    it('should return a class on call to bindUser()', () => {
        user.bindUser({}).should.be.a('function');
    });
    describe('User', () => {
        const forum = {};
        const User = user.bindUser(forum);
        beforeEach(() => forum._emit = sinon.stub().resolves());
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
        describe('static get()',()=>{
            let sandbox = null;
            beforeEach(()=>{
                sandbox = sinon.sandbox.create();
                sandbox.stub(User, 'parse');
            });
            afterEach(()=>sandbox.restore());
            it('should retrieve user via \'user.getUserByUID\'',()=>{
                return User.get(8472).then(()=>{
                    forum._emit.calledWith('user.getUserByUID', 8472).should.be.true;
                });
            });
            it('should reject when socket call rejects',()=>{
                forum._emit.rejects('bad');
                return User.get(8472).should.be.rejected;
            });
            it('should parse user data via User.parse',()=>{
                return User.get(8472).then(()=>{
                    User.parse.called.should.be.true;
                });
            });
            it('should pass websocket data to User.parse',()=>{
                const expected = Math.random();
                forum._emit.resolves(expected);
                return User.get(8472).then(()=>{
                    User.parse.calledWith(expected).should.be.true;
                });
            });
            it('should resolve to results of User.parse',()=>{
                const expected = Math.random();
                User.parse.resolves(expected);
                return User.get(8472).should.become(expected);
            });
        });
    
        describe('static getByName()',()=>{
            let sandbox = null;
            beforeEach(()=>{
                sandbox = sinon.sandbox.create();
                sandbox.stub(User, 'parse');
            });
            afterEach(()=>sandbox.restore());
            it('should retrieve user via \'user.getUserByUID\'',()=>{
                return User.getByName('foobar').then(()=>{
                    forum._emit.calledWith('user.getUserByUsername', 'foobar').should.be.true;
                });
            });
            it('should reject when socket call rejects',()=>{
                forum._emit.rejects('bad');
                return User.getByName('foobar').should.be.rejected;
            });
            it('should parse user data via User.parse',()=>{
                return User.getByName('foobar').then(()=>{
                    User.parse.called.should.be.true;
                });
            });
            it('should pass websocket data to User.parse',()=>{
                const expected = Math.random();
                forum._emit.resolves(expected);
                return User.getByName('foobar').then(()=>{
                    User.parse.calledWith(expected).should.be.true;
                });
            });
            it('should resolve to results of User.parse',()=>{
                const expected = Math.random();
                User.parse.resolves(expected);
                return User.getByName('foobar').should.become(expected);
            });
        });
        describe('ctor()', () => {
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