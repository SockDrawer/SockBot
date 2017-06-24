'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.should();
const expect = chai.expect;

const sinon = require('sinon');
chai.use(require('sinon-chai'));

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
                it(`${fn}()`, () => expect(config[fn]).to.be.a('function'));
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
                fs.readFile.should.have.been.calledWith('foo');
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
                    yaml.safeLoad.should.have.been.calledWith(expected);
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
        let testConfig = null;
        beforeEach(() => {
            testConfig = {
                core: {
                    username: 'username',
                    password: 'password',
                    owner: 'owner'
                },
                plugins: {
                    foo: true
                }
            };
        });
        it('should throw error for missing core configuration', () => {
            delete testConfig.core;
            expect(() => config.validateConfig(testConfig))
                .to.throw('Missing configuration section: core');
        });
        it('should throw error for empty core configuration', () => {
            testConfig.core = {};
            expect(() => config.validateConfig(testConfig))
                .to.throw('Configuration section core has no configuration items');
        });
        it('should throw error for missing plugins configuration', () => {
            delete testConfig.plugins;
            expect(() => config.validateConfig(testConfig))
                .to.throw('Missing configuration section: plugins');
        });
        it('should throw error for empty plugins configuration', () => {
            testConfig.plugins = {};
            expect(() => config.validateConfig(testConfig))
                .to.throw('Configuration section plugins has no configuration items');
        });
        it('should throw error for missing username', () => {
            delete testConfig.core.username;
            expect(() => config.validateConfig(testConfig))
                .to.throw('A valid username must be specified');
        });
        it('should throw error for empty username', () => {
            testConfig.core.username = '';
            expect(() => config.validateConfig(testConfig))
                .to.throw('A valid username must be specified');
        });
        it('should throw error for wrong username type', () => {
            testConfig.core.username = Math.random();
            expect(() => config.validateConfig(testConfig))
                .to.throw('A valid username must be specified');
        });
        it('should throw error for missing password', () => {
            delete testConfig.core.password;
            expect(() => config.validateConfig(testConfig))
                .to.throw('A valid password must be specified');
        });
        it('should throw error for empty password', () => {
            testConfig.core.password = '';
            expect(() => config.validateConfig(testConfig))
                .to.throw('A valid password must be specified');
        });
        it('should throw error for wrong password type', () => {
            testConfig.core.password = Math.random();
            expect(() => config.validateConfig(testConfig))
                .to.throw('A valid password must be specified');
        });
        it('should throw error for missing owner', () => {
            delete testConfig.core.owner;
            expect(() => config.validateConfig(testConfig))
                .to.throw('A valid owner must be specified');
        });
        it('should throw error for empty owner', () => {
            testConfig.core.owner = '';
            expect(() => config.validateConfig(testConfig))
                .to.throw('A valid owner must be specified');
        });
        it('should throw error for wrong owner type', () => {
            testConfig.core.owner = Math.random();
            expect(() => config.validateConfig(testConfig))
                .to.throw('A valid owner must be specified');
        });
        it('should throw multiple messages for multiple errors', () => {
            testConfig.core.username = Math.random();
            testConfig.core.password = Math.random();
            testConfig.core.owner = Math.random();
            expect(() => config.validateConfig(testConfig))
                .to.throw('A valid username must be specified\n' +
                    'A valid password must be specified\nA valid owner must be specified');
        });
        it('should throw multiple messages for multiple missing sections', () => {
            delete testConfig.core;
            testConfig.plugins = {};
            expect(() => config.validateConfig(testConfig))
                .to.throw('Missing configuration section: core\n' +
                    'Configuration section plugins has no configuration items');
        });
        it('should not validate core settings with invalid config section', () => {
            delete testConfig.core.username;
            testConfig.plugins = {};
            expect(() => config.validateConfig(testConfig))
                .to.throw('Configuration section plugins has no configuration items');
        });
        it('should accept valid config', () => {
            expect(() => config.validateConfig(testConfig)).to.not.throw();
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
