'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.should();

const sinon = require('sinon');
require('sinon-as-promised');

const testModule = require('../../lib/app');
const config = require('../../lib/config');
const commands = require('../../lib/commands');
const path = require('path');
const dirname = path.posix.resolve(__dirname, '../../lib');

describe('lib/app', () => {
    describe('relativeRequire()', () => {
        it('should require relative to current file', () => {
            const spy = sinon.spy();
            const expected = `${dirname}/../foo/bar`;
            testModule.relativeRequire('../foo', 'bar', spy);
            spy.calledWith(expected).should.be.true;
        });
        it('should require relative to config for relative path', () => {
            const spy = sinon.spy();
            config.basePath = '/bar/baz/';
            const expected = '/bar/baz/foo';
            testModule.relativeRequire('../ardvark', './foo', spy);
            spy.calledWith(expected).should.be.true;
        });
        it('should require relative to config for walking relative path', () => {
            const spy = sinon.spy();
            config.basePath = '/bar/baz/';
            const expected = '/bar/foo';
            testModule.relativeRequire('../ardvark', '../foo', spy);
            spy.calledWith(expected).should.be.true;
        });
        it('should require absolute for absolute path', () => {
            const spy = sinon.spy();
            const expected = '/foo/to/the/bar';
            testModule.relativeRequire('../ardvark', '/foo/to/the/bar', spy);
            spy.calledWith(expected).should.be.true;
        });
        it('should require module direct on ENOENT', () => {
            const spy = sinon.stub();
            spy.onFirstCall().throws(new Error('Cannot find module icky bad'));
            testModule.relativeRequire('../ardvark', 'bar', spy);
            spy.calledWith('bar').should.be.true;
        });
        it('should rethrow non ENOENT error', () => {
            const spy = sinon.stub();
            spy.throws(new Error('Pterodons!'));
            chai.expect(() => testModule.relativeRequire('../ardvark', 'bar', spy)).to.throw('Pterodons!');
        });
    });
    describe('loadPlugins()', () => {
        let forum = null,
            sandbox = null;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(testModule, 'relativeRequire');
            forum = {
                addPlugin: sinon.stub()
            };
        });
        afterEach(() => sandbox.restore());
        it('should allow zero plugins', () => {
            testModule.loadPlugins(forum, {
                plugins: {}
            });
            testModule.relativeRequire.called.should.be.false;
        });
        it('should load listed plugins', () => {
            const name = `name${Math.random()}`;
            const cfg = {
                plugins: {}
            };
            cfg.plugins[name] = true;
            testModule.loadPlugins(forum, cfg);
            testModule.relativeRequire.calledWith('../plugins', name, require).should.be.false;
        });
        it('should add loaded plugin to forum', () => {
            const cfg = Math.random();
            const plugin = Math.random();
            testModule.relativeRequire.returns(plugin);
            testModule.loadPlugins(forum, {
                plugins: {
                    alpha: cfg
                }
            });
            forum.addPlugin.calledWith(plugin, cfg).should.be.true;
        });
    });
    describe('activateConfig()', () => {
        let sandbox = null,
            instance = null,
            basicConfig = null;
        class DummyForum {
            constructor(cfg) {
                this.login = DummyForum.login;
                this.activate = DummyForum.activate;
                this.config = cfg;
                instance = this; //eslint-disable-line consistent-this
            }
        }
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(testModule, 'relativeRequire');
            testModule.relativeRequire.returns(DummyForum);
            sandbox.stub(testModule, 'loadPlugins');
            sandbox.stub(commands, 'bindCommands');
            basicConfig = {
                core: {
                    provider: 'hi'
                }
            };
            DummyForum.login = sinon.stub().resolves();
            DummyForum.activate = sinon.stub().resolves();

        });
        afterEach(() => sandbox.restore());
        it('should retrieve provider via relativeRequire', () => {
            const name = `provider${Math.random()}`;
            basicConfig.core.provider = name;
            return testModule.activateConfig(basicConfig).then(() => {
                testModule.relativeRequire.calledWith('../providers', name).should.be.true;
            });
        });
        it('should construct provider instance', () => {
            return testModule.activateConfig(basicConfig).then(() => {
                instance.should.be.instanceof(DummyForum);
            });
        });
        it('should construct provider instance with configuration information', () => {
            return testModule.activateConfig(basicConfig).then(() => {
                instance.config.should.equal(basicConfig);
            });
        });
        it('should bind commands to instance', () => {
            return testModule.activateConfig(basicConfig).then(() => {
                commands.bindCommands.calledWith(instance).should.be.true;
            });
        });
        it('should store bound commands on instance', () => {
            const expected = Math.random();
            commands.bindCommands.returns(expected);
            return testModule.activateConfig(basicConfig).then(() => {
                instance.Commands.should.equal(expected);
            });
        });
        it('should login to instance', () => {
            return testModule.activateConfig(basicConfig).then(() => {
                instance.login.called.should.be.true;
            });
        });
        it('should activate instance', () => {
            return testModule.activateConfig(basicConfig).then(() => {
                instance.activate.called.should.be.true;
            });
        });
        it('should reject when insatnce.login rejects', () => {
            DummyForum.login.rejects('bad');
            return testModule.activateConfig(basicConfig).should.be.rejected;
        });
        it('should reject when instance.activate rejects', () => {
            DummyForum.activate.rejects('bad');
            return testModule.activateConfig(basicConfig).should.be.rejected;
        });
    });
});
