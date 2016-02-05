'use strict';
/*globals describe, it, beforeEach, afterEach*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon');
chai.should();
const expect = chai.expect;

// The thing we're testing
const config = require('../../lib/config'),
    utils = require('../../lib/utils'),
    fs = require('fs'),
    path = require('path');

describe('config', () => {
    describe('exports', () => {
        const fns = ['loadConfiguration', 'mergeObjects'],
            objs = ['internals', 'core', 'plugins', 'user'],
            vals = ['basePath'];
        describe('should export expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(config[fn]).to.be.a('function'));
            });
        });
        describe('should export expected objects', () => {
            objs.forEach((obj) => {
                it(obj, () => expect(config[obj]).to.be.a('object'));
            });
        });
        describe('should export expected values', () => {
            vals.forEach((val) => {
                it(val, () => config.should.have.any.key(val));
            });
        });
        it('should export only expected keys', () => {
            config.should.have.all.keys(fns.concat(objs, vals));
        });
    });
    describe('internals', () => {
        const fns = ['readFile'],
            objs = ['defaultConfig'],
            vals = [];
        describe('should include expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(config.internals[fn]).to.be.a('function'));
            });
        });
        describe('should include expected objects', () => {
            objs.forEach((obj) => {
                it(obj, () => (typeof config.internals[obj]).should.equal('object'));
            });
        });
        describe('should include expected values', () => {
            vals.forEach((val) => {
                it(val, () => config.internals.should.have.key(val));
            });
        });
        it('should include only expected keys', () => {
            config.internals.should.have.all.keys(fns.concat(objs, vals));
        });
    });
    describe('mergeObjects()', () => {
        it('should proxy utils.mergeObjects', () => {
            //Reference equality is what is required
            config.mergeObjects.should.equal(utils.mergeObjects);
        });
    });
    describe('readFile()', () => {
        const readFile = config.internals.readFile;
        let sandbox;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(console, 'log');
            sandbox.stub(fs, 'readFile');
        });
        afterEach(() => {
            sandbox.restore();
        });
        describe('Should error on non string input:', () => {
            [undefined, null, 1, 2.4, false, '', [], {}].forEach((test) => {
                it(JSON.stringify(test), () => {
                    fs.readFile.reset();
                    const spy = sinon.spy();
                    readFile(test, spy);
                    fs.readFile.called.should.be.false;
                    spy.called.should.be.true;
                    spy.lastCall.args.should.have.length(1);
                    spy.lastCall.args[0].should.be.an.instanceOf(Error);
                });
            });
        });
        it('should pass fs error on to callback', () => {
            fs.readFile.reset();
            fs.readFile.yields(new Error('some fs error'));
            const spy = sinon.spy();
            readFile('config.js', spy);
            spy.called.should.be.true;
            spy.lastCall.args.should.have.length(1);
            spy.lastCall.args[0].should.be.instanceOf(Error);
        });
        it('should pass yaml error on to callback', () => {
            fs.readFile.reset();
            fs.readFile.yields(null, '---\nfoo: {foo');
            const spy = sinon.spy();
            readFile('config.js', spy);
            spy.called.should.be.true;
            spy.lastCall.args.should.have.length(1);
            spy.lastCall.args[0].name.should.equal('YAMLException');
        });
        it('should accept valid YAML', () => {
            fs.readFile.reset();
            fs.readFile.yields(null, '---\nfoo: {foo}');
            const spy = sinon.spy();
            readFile('config.js', spy);
            spy.called.should.be.true;
            spy.lastCall.args.should.have.length(2);
            expect(spy.lastCall.args[0]).to.equal(null);
            spy.lastCall.args[1].should.deep.equal({
                foo: {
                    foo: null
                }
            });
        });
        it('should accept valid JSON', () => {
            const result = {
                foo: 42,
                bar: {
                    baz: false,
                    quux: 'xyzzy'
                }
            };
            fs.readFile.reset();
            fs.readFile.yields(null, JSON.stringify(result, null, '\t'));
            const spy = sinon.spy();
            readFile('config.js', spy);
            spy.called.should.be.true;
            spy.lastCall.args.should.have.length(2);
            expect(spy.lastCall.args[0]).to.equal(null);
            spy.lastCall.args[1].should.deep.equal(result);
        });
        it('should accept valid YAML with BOM', () => {
            fs.readFile.reset();
            fs.readFile.yields(null, new Buffer('\uFEFF---\nfoo: {foo}'));
            const spy = sinon.spy();
            readFile('config.js', spy);
            spy.called.should.be.true;
            spy.lastCall.args.should.have.length(2);
            expect(spy.lastCall.args[0]).to.equal(null);
            spy.lastCall.args[1].should.deep.equal({
                foo: {
                    foo: null
                }
            });
        });
        it('should accept valid JSON with BOM', () => {
            const result = {
                foo: 42,
                bar: {
                    baz: false,
                    quux: 'xyzzy'
                }
            };
            fs.readFile.reset();
            fs.readFile.yields(null, new Buffer('\uFEFF' + JSON.stringify(result, null, '\t')));
            const spy = sinon.spy();
            readFile('config.js', spy);
            spy.called.should.be.true;
            spy.lastCall.args.should.have.length(2);
            expect(spy.lastCall.args[0]).to.equal(null);
            spy.lastCall.args[1].should.deep.equal(result);
        });
    });
    describe('loadConfiguration()', () => {
        const loadConfiguration = config.loadConfiguration;
        let sandbox;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(console, 'log');
            sandbox.stub(fs, 'readFile');
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('should load valid config', () => {
            const input = {
                    core: {
                        username: 'harold',
                        password: 'crayon',
                        owner: 'johnson'
                    }
                },
                expected = utils.mergeObjects(true, config.internals.defaultConfig, input);
            fs.readFile.yields(null, JSON.stringify(input));
            const spy = sinon.spy();
            loadConfiguration('config.js', spy);
            spy.called.should.be.true;
            spy.lastCall.args.should.have.length(2);
            expect(spy.lastCall.args[0]).to.equal(null);
            spy.lastCall.args[1].should.deep.equal(expected);
        });
        it('should remove ignored users', () => {
            const input = {
                    core: {
                        username: 'harold',
                        password: 'crayon',
                        owner: 'johnson',
                        ignoreUsers: []
                    }
                },
                expected = utils.mergeObjects(true, config.internals.defaultConfig, input);
            fs.readFile.yields(null, JSON.stringify(input));
            const spy = sinon.spy();
            loadConfiguration('config.js', spy);
            spy.called.should.be.true;
            spy.lastCall.args.should.have.length(2);
            expect(spy.lastCall.args[0]).to.equal(null);
            spy.lastCall.args[1].should.deep.equal(expected);
        });
        it('should pass on read error', () => {
            fs.readFile.yields(new Error('E_NO_ENT'));
            const spy = sinon.spy();
            loadConfiguration('config.js', spy);
            spy.called.should.be.true;
            spy.lastCall.args.should.have.length(1);
            expect(spy.lastCall.args[0]).to.be.instanceOf(Error);
        });
        it('should pass on YAML error', () => {
            fs.readFile.yields(null, '1');
            const spy = sinon.spy();
            loadConfiguration('config.js', spy);
            spy.called.should.be.true;
            spy.lastCall.args.should.have.length(1);
            expect(spy.lastCall.args[0]).to.be.instanceOf(Error);
        });
        it('should validate username', () => {
            const input = {
                core: {
                    password: 'crayon',
                    owner: 'johnson'
                }
            };
            fs.readFile.yields(null, JSON.stringify(input));
            const spy = sinon.spy();
            loadConfiguration('config.js', spy);
            spy.called.should.be.true;
            spy.lastCall.args.should.have.length(1);
            expect(spy.lastCall.args[0]).to.be.Error;
        });
        it('should validate password', () => {
            const input = {
                core: {
                    username: 'harold',
                    owner: 'johnson'
                }
            };
            fs.readFile.yields(null, JSON.stringify(input));
            const spy = sinon.spy();
            loadConfiguration('config.js', spy);
            spy.called.should.be.true;
            spy.lastCall.args.should.have.length(1);
            expect(spy.lastCall.args[0]).to.be.Error;
        });
        it('should validate owner', () => {
            const input = {
                core: {
                    username: 'harold',
                    password: 'crayon'
                }
            };
            fs.readFile.yields(null, JSON.stringify(input));
            const spy = sinon.spy();
            loadConfiguration('config.js', spy);
            spy.called.should.be.true;
            spy.lastCall.args.should.have.length(1);
            expect(spy.lastCall.args[0]).to.be.Error;
        });
        it('should strip file name from config path', () => {
            fs.readFile.yields(null, '{}');
            sandbox.stub(path, 'resolve');
            loadConfiguration('./config.js', () => 0);
            path.resolve.firstCall.args.length.should.equal(2);
            path.resolve.firstCall.args[0].should.equal('./config.js');
            path.resolve.firstCall.args[1].should.equal('..');
        });
        describe('path resolution', () => {
            const cwd = process.cwd();
            [
                ['./config', cwd],
                ['../foo/config.js', path.posix.resolve(cwd, '../foo')],
                ['./foo/config.js', path.posix.resolve(cwd, 'foo')],
                ['/foo/bar/baz/config.js', '/foo/bar/baz'],
                ['/config.js', '/']
            ].forEach((cfg) => {
                it('should resolve `' + cfg[0] + '`corectly', () => {
                    fs.readFile.yields(null, '{}');
                    loadConfiguration(cfg[0], () => 0);
                    config.basePath.should.equal(cfg[1]);
                });
            });
        });
    });
});
