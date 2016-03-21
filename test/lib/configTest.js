'use strict';

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
chai.should();
const expect = chai.expect;

const sinon = require('sinon');
require('sinon-as-promised');

const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const config = require('../../lib/config');
const utils = require('../../lib/utils');

describe('lib/config', () => {
    describe('exports', () => {
        const fns = ['mergeObjects', 'load', 'validateConfig'],
            objs = ['internals'],
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
        describe('readYaml()', () => {
            let sandbox;
            beforeEach(() => {
                sandbox = sinon.sandbox.create();
                sandbox.stub(fs, 'readFile');
                sandbox.stub(yaml, 'safeLoad');
            });
            afterEach(() => sandbox.restore());
            it('should reject on null input', () => {
                return config.internals.readYaml(null)
                    .should.be.rejectedWith('Path must be a string');
            });
            it('should reject on empty input', () => {
                return config.internals.readYaml('')
                    .should.be.rejectedWith('Path must be a string');
            });
            it('should reject on non-string input', () => {
                return config.internals.readYaml(Math.random())
                    .should.be.rejectedWith('Path must be a string');
            });
            it('should call fs.readFile to read from disk', () => {
                fs.readFile.yields(null, '');
                yaml.safeLoad.returns();
                config.internals.readYaml('foo');
                fs.readFile.calledWith('foo').should.be.true;
            });
            it('should reject on fs error', () => {
                const error = new Error('bugaboo');
                fs.readFile.yields(error);
                yaml.safeLoad.returns();
                return config.internals.readYaml('foo')
                    .should.be.rejectedWith(error);
            });
            it('should pass fs read results to yaml.safeLoad', () => {
                const expected = Math.random();
                fs.readFile.yields(null, expected);
                return config.internals.readYaml('foo').then(() => {
                    yaml.safeLoad.calledWith(expected).should.be.true;
                });
            });
            it('should strip UTF8 BOM from file', () => {
                fs.readFile.yields(null, new Buffer('\uFEFFfoobar'));
                yaml.safeLoad.returns();
                return config.internals.readYaml('foo').then(() => {
                    yaml.safeLoad.firstCall.args[0].toString().should.equal('foobar');
                });
            });
            it('should resolve to results of yaml.safeload', () => {
                fs.readFile.yields(null, '');
                const expected = Math.random();
                yaml.safeLoad.returns(expected);
                return config.internals.readYaml('foo').should.become(expected);
            });
            it('should reject when yaml.safeload throws', () => {
                fs.readFile.yields(null, '');
                const expected = Math.random();
                yaml.safeLoad.throws(expected);
                return config.internals.readYaml('foo').should.be.rejectedWith(expected);
            });
        });
    });

    describe('validateConfig()', () => {
        it('should throw error for missing username', () => {
            expect(() => config.validateConfig({
                core: {
                    username: undefined,
                    password: 'password',
                    owner: 'owner'
                }
            })).to.throw('A valid username must be specified');
        });
        it('should throw error for empty username', () => {
            expect(() => config.validateConfig({
                core: {
                    username: '',
                    password: 'password',
                    owner: 'owner'
                }
            })).to.throw('A valid username must be specified');
        });
        it('should throw error for missing password', () => {
            expect(() => config.validateConfig({
                core: {
                    username: 'username',
                    password: undefined,
                    owner: 'owner'
                }
            })).to.throw('A valid password must be specified');
        });
        it('should throw error for empty password', () => {
            expect(() => config.validateConfig({
                core: {
                    username: 'username',
                    password: '',
                    owner: 'owner'
                }
            })).to.throw('A valid password must be specified');
        });
        it('should throw error for missing owner', () => {
            expect(() => config.validateConfig({
                core: {
                    username: 'username',
                    password: 'password',
                    owner: undefined
                }
            })).to.throw('A valid owner must be specified');
        });
        it('should throw error for empty owner', () => {
            expect(() => config.validateConfig({
                core: {
                    username: 'username',
                    password: 'password',
                    owner: ''
                }
            })).to.throw('A valid owner must be specified');
        });
        it('should throw error for missing username', () => {
            expect(() => config.validateConfig({
                core: {
                    username: undefined,
                    password: 'password',
                    owner: 'owner'
                }
            })).to.throw('A valid username must be specified');
        });
        it('should accept valid config', () => {
            expect(() => config.validateConfig({
                core: {
                    username: 'username',
                    password: 'password',
                    owner: 'owner'
                }
            })).to.not.throw();
        });
    });
    describe('load()', () => {
        let sandbox;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(fs, 'readFile');
            fs.readFile.yields(null, '');
            sandbox.stub(yaml, 'safeLoad');
            sandbox.stub(config, 'validateConfig');
        });
        afterEach(() => sandbox.restore());
        describe('config normalization', () => {
            [3.14, 'foobar', true, null, undefined].forEach((data) => {
                it(`should reject invalid config: ${data}`, () => {
                    yaml.safeLoad.returns(data);
                    return config.load('foo').should.be.rejectedWith('Invalid Configuration File.');
                });
            });
            it('should normalize object to one element array', () => {
                yaml.safeLoad.returns({});
                return config.load('foo').then((data) => {
                    data.length.should.equal(1);
                });
            });
            it('should normalize empty array to empty array', () => {
                yaml.safeLoad.returns([]);
                return config.load('foo').then((data) => {
                    data.length.should.equal(0);
                });
            });
            it('should normalize multi array to empty array', () => {
                yaml.safeLoad.returns([{}, {}, {}]);
                return config.load('foo').then((data) => {
                    data.length.should.equal(3);
                });
            });
        });
        it('should merge default config into config', () => {
            yaml.safeLoad.returns({});
            return config.load('foo').should.become([config.internals.defaultConfig]);
        });
        it('should preserve explicit settings', () => {
            yaml.safeLoad.returns({
                core: {
                    username: 'foobar'
                }
            });
            const expected = utils.cloneData(config.internals.defaultConfig);
            expected.core.username = 'foobar';
            return config.load('foo').should.become([expected]);
        });
        describe('basepath settings', () => {
            beforeEach(() => yaml.safeLoad.returns({}));
            it('should set absolute path from relative descending path', () => {
                const expected = path.posix.resolve('./config');
                return config.load('./config/file.yml')
                    .then(() => config.basePath.should.equal(expected));
            });
            it('should set absolute path from relative ascending path', () => {
                const expected = path.posix.resolve('../config');
                return config.load('../config/file.yml')
                    .then(() => config.basePath.should.equal(expected));
            });
            it('should set absolute path from absolute path', () => {
                const expected = '/config/foo/bar';
                return config.load('/config/foo/bar/file.yml')
                    .then(() => config.basePath.should.equal(expected));
            });
        });
    });
    describe('mergeObjects()', () => {
        it('should be an alias for utils.mergeObjects()', () => {
            config.mergeObjects.should.equal(utils.mergeObjects);
        });
    });
});