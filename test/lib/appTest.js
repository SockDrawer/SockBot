'use strict';

const chai = require('chai');

chai.use(require('chai-as-promised'));
chai.use(require('chai-string'));
chai.should();

const sinon = require('sinon');
require('sinon-as-promised');

const testModule = require('../../lib/app'),
    packageInfo = require('../../package.json'),
    config = require('../../lib/config'),
    commands = require('../../lib/commands'),
    utils = require('../../lib/utils');
const path = require('path');
const dirname = path.posix.resolve(__dirname, '../../lib');

describe('lib/app', () => {
    describe('relativeRequire()', () => {
        it('should require relative to package.json file', () => {
            const spy = sinon.spy();
            const expected = `${dirname}/../foo/bar`;
            testModule.relativeRequire('foo', 'bar', spy);
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
            sandbox.stub(testModule, 'log');
            sandbox.stub(testModule, 'error');
            forum = {
                addPlugin: sinon.stub().resolves()
            };
        });
        afterEach(() => sandbox.restore());
        it('should allow zero plugins', () => {
            return testModule.loadPlugins(forum, {
                plugins: {}
            }).then(() => {
                testModule.relativeRequire.called.should.be.false;
            });
        });
        it('should load listed plugins', () => {
            const name = `name${Math.random()}`;
            const cfg = {
                core: {},
                plugins: {}
            };
            cfg.plugins[name] = true;
            return testModule.loadPlugins(forum, cfg).then(() => {
                testModule.relativeRequire.calledWith('plugins', name, testModule.require).should.be.true;
            });
        });
        it('should log message on plugin load', () => {
            const name = `name${Math.random()}`;
            const username = `user${Math.random()}`;
            const cfg = {
                core: {
                    username: username
                },
                plugins: {}
            };
            cfg.plugins[name] = true;
            return testModule.loadPlugins(forum, cfg).then(() => {
                testModule.log.calledWith(`Loading plugin ${name} for ${username}`).should.equal.true;
            });
        });
        it('should add loaded plugin to forum', () => {
            const cfg = Math.random();
            const plugin = Math.random();
            testModule.relativeRequire.returns(plugin);
            return testModule.loadPlugins(forum, {
                core: {},
                plugins: {
                    alpha: cfg
                }
            }).then(() => {
                forum.addPlugin.calledWith(plugin, cfg).should.be.true;
            });
        });
        it('should reject when forum.addPlugin rejects', () => {
            const cfg = Math.random();
            const plugin = Math.random();
            testModule.relativeRequire.returns(plugin);
            forum.addPlugin.rejects('bad');
            return testModule.loadPlugins(forum, {
                core: {},
                plugins: {
                    alpha: cfg
                }
            }).should.be.rejected;
        });
        it('should log error when forum.addPlugin rejects', () => {
            const cfg = Math.random();
            const plugin = Math.random();
            testModule.relativeRequire.returns(plugin);
            forum.addPlugin.rejects('bad');
            return testModule.loadPlugins(forum, {
                core: {},
                plugins: {
                    alpha: cfg
                }
            }).catch(() => {
                testModule.error.calledWith('Plugin alpha failed to load with error: Error: bad').should.be.true;
            });
        });

        it('should reject with error from forum.addPlugin when rejecting', () => {
            const cfg = Math.random();
            const plugin = Math.random();
            testModule.relativeRequire.returns(plugin);
            const error = new Error('boogy boo!');
            forum.addPlugin.rejects(error);
            return testModule.loadPlugins(forum, {
                core: {},
                plugins: {
                    alpha: cfg
                }
            }).should.be.rejectedWith(error);
        });
    });
    describe('activateConfig()', () => {
        let sandbox = null,
            instance = null,
            basicConfig = null;
        class DummyForum {
            constructor(cfg, ua) {
                this.login = DummyForum.login;
                this.activate = DummyForum.activate;
                this.on = sinon.stub();
                this.config = cfg;
                this.ua = ua;
                instance = this; //eslint-disable-line consistent-this
            }
        }
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(testModule, 'relativeRequire');
            sandbox.stub(testModule, 'getUserAgent');
            testModule.relativeRequire.returns(DummyForum);
            sandbox.stub(testModule, 'loadPlugins').resolves();
            sandbox.stub(testModule, 'log');
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
                testModule.relativeRequire.calledWith('providers', name).should.be.true;
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
        it('should get useragent information via testModule.getUserAgent', () => {
            const expected = `a${Math.random()}b`;
            testModule.getUserAgent.returns(expected);
            return testModule.activateConfig(basicConfig).then(() => {
                testModule.getUserAgent.called.should.be.true;
            });
        });
        it('should call testModule.getUserAgent with configuration information', () => {
            const cfg = JSON.parse(JSON.stringify(basicConfig));
            cfg.estTag = Math.random();
            return testModule.activateConfig(cfg).then(() => {
                testModule.getUserAgent.calledWith(cfg).should.be.true;
            });
        });
        it('should construct provider instance with useragent information', () => {
            const expected = `a${Math.random()}b`;
            testModule.getUserAgent.returns(expected);
            return testModule.activateConfig(basicConfig).then(() => {
                instance.ua.should.equal(expected);
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
        it('should reject when exports.loadPlugins rejects', () => {
            testModule.loadPlugins.rejects('bad');
            return testModule.activateConfig(basicConfig).should.be.rejected;
        });
        it('should reject when insatnce.login rejects', () => {
            DummyForum.login.rejects('bad');
            return testModule.activateConfig(basicConfig).should.be.rejected;
        });
        it('should reject when instance.activate rejects', () => {
            DummyForum.activate.rejects('bad');
            return testModule.activateConfig(basicConfig).should.be.rejected;
        });
        it('should register for forum event `log`', () => {
            return testModule.activateConfig(basicConfig).then(() => {
                instance.on.calledWith('log', testModule.log).should.be.true;
            });
        });
        it('should register for forum event `log`', () => {
            return testModule.activateConfig(basicConfig).then(() => {
                instance.on.calledWith('error', testModule.error).should.be.true;
            });
        });
        it('should register for forum event `logExtended`', () => {
            return testModule.activateConfig(basicConfig).then(() => {
                instance.on.calledWith('logExtended', utils.logExtended).should.be.true;
            });
        });
        describe('logging', () => {
            it('should log provider name', () => {
                const name = `provider${Math.random()}`;
                const username = `user${Math.random()}`;
                basicConfig.core.provider = name;
                basicConfig.core.username = username;
                return testModule.activateConfig(basicConfig).then(() => {
                    testModule.log.calledWith(`Using provider ${name} for ${username}`).should.be.true;
                });
            });
            it('should log ready for login', () => {
                const username = `user${Math.random()}`;
                basicConfig.core.username = username;
                return testModule.activateConfig(basicConfig).then(() => {
                    testModule.log.calledWith(`${username} ready for login`).should.be.true;
                });
            });
            it('should log logged in', () => {
                const username = `user${Math.random()}`;
                basicConfig.core.username = username;
                return testModule.activateConfig(basicConfig).then(() => {
                    testModule.log.calledWith(`${username} login successful`).should.be.true;
                });
            });
            it('should not log logged in on login failure', () => {
                const username = `user${Math.random()}`;
                basicConfig.core.username = username;
                DummyForum.login.rejects('bad');
                return testModule.activateConfig(basicConfig)
                    .catch(() => 0)
                    .then(() => {
                        testModule.log.calledWith(`${username} login successful`).should.be.false;
                    });
            });
            it('should log activated', () => {
                const username = `user${Math.random()}`;
                basicConfig.core.username = username;
                return testModule.activateConfig(basicConfig).then(() => {
                    testModule.log.calledWith(`${username} activated`).should.be.true;
                });
            });
            it('should log activated', () => {
                const username = `user${Math.random()}`;
                basicConfig.core.username = username;
                DummyForum.activate.rejects('bad');
                return testModule.activateConfig(basicConfig)
                    .catch(() => 0)
                    .then(() => {
                        testModule.log.calledWith(`${username} activated`).should.be.false;
                    });
            });
        });
    });
    describe('_buildMessage()', () => {
        let clock = null,
            theTime = null;
        beforeEach(() => {
            theTime = Math.random() * 2e12;
            clock = sinon.useFakeTimers(theTime);
        });
        afterEach(() => clock.restore());
        it('should return a string', () => {
            testModule._buildMessage().should.be.a('string');
        });
        it('should prefix timestamp to message', () => {
            const prefix = `[${new Date(theTime).toISOString()}]`;
            testModule._buildMessage(['foo']).should.startWith(prefix);
        });
        it('should join multiple arguments together', () => {
            const contents = 'foo bar baz quux';
            testModule._buildMessage(['foo', 'bar', 'baz', 'quux']).should.endWith(contents);
        });

        it('should accept `arguments` object as input', () => {
            let args = null;
            (function argExtractor() {
                args = arguments;
            })('foo', 'bar', 'baz', 'xyzzy');
            const contents = 'foo bar baz xyzzy';
            testModule._buildMessage(args).should.endWith(contents);
        });
        it('should serialize objects to JSON', () => {
            const contents = '{\n\t"alpha": "one"\n}';
            testModule._buildMessage([{
                alpha: 'one'
            }]).should.endWith(contents);
        });
    });
    describe('log()', () => {
        let sandbox = null;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(console, 'log');
            sandbox.stub(testModule, '_buildMessage');
        });
        afterEach(() => sandbox.restore());
        it('should pass arguments to _buildMessage', () => {
            const one = 1,
                two = 2,
                three = 4,
                four = 3,
                five = 5;
            testModule.log(one, two, three, four, five);
            const args = Array.prototype.slice.apply(testModule._buildMessage.firstCall.args[0]);
            args.should.eql([one, two, three, four, five]);
        });
        it('should log message to console.log', () => {
            const message = `a${Math.random()}b`;
            testModule._buildMessage.returns(message);
            testModule.log();
            console.log.calledWith(message).should.be.true; //eslint-disable-line no-console
        });
    });
    describe('error()', () => {
        let sandbox = null;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(console, 'error');
            sandbox.stub(testModule, '_buildMessage');
        });
        afterEach(() => sandbox.restore());
        it('should pass arguments to _buildMessage', () => {
            const one = 1,
                two = 2,
                three = 4,
                four = 3,
                five = 5;
            testModule.error(one, two, three, four, five);
            const args = Array.prototype.slice.apply(testModule._buildMessage.firstCall.args[0]);
            args.should.eql([one, two, three, four, five]);
        });
        it('should log message to console.log', () => {
            const message = `a${Math.random()}b`;
            testModule._buildMessage.returns(message);
            testModule.error();
            console.error.calledWith(message).should.be.true; //eslint-disable-line no-console
        });
    });
    describe('getUserAgent()', () => {
        const originalName = packageInfo.name,
            originalVersion = packageInfo.version;
        let name = null,
            version = null;
        beforeEach(() => {
            name = `name${Math.random()}`;
            packageInfo.name = name;
            version = `1.0.0-TEST${Math.random()}`;
            packageInfo.version = version;
        });
        afterEach(() => {
            packageInfo.name = originalName;
            packageInfo.version = originalVersion;
        });
        it('should retrun a string', () => {
            testModule.getUserAgent({
                core: {}
            }).should.be.a('string');
        });
    });
});
