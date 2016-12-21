'use strict';

const chai = require('chai');

chai.use(require('chai-as-promised'));
chai.use(require('chai-string'));
chai.should();

const sinon = require('sinon');
require('sinon-as-promised');
chai.use(require('sinon-chai'));

const testModule = require('../../lib/app'),
    packageInfo = require('../../package.json'),
    config = require('../../lib/config'),
    commands = require('../../lib/commands'),
    utils = require('../../lib/utils');
const path = require('path');
const dirname = path.resolve(__dirname, '../../lib');

describe('lib/app', () => {
    describe('relativeRequire()', () => {
        it('should require relative to package.json file', () => {
            const spy = sinon.spy();
            const expected = `${dirname}/../foo/bar`;
            testModule.relativeRequire('foo', 'bar', spy);
            const actual = spy.firstCall.args[0];
            actual.should.equal(expected);
            spy.should.have.been.calledWith(expected).once;
        });
        it('should require relative to config for relative path', () => {
            const spy = sinon.spy();
            config.basePath = '/bar/baz/';
            const expected = '/bar/baz/foo';
            testModule.relativeRequire('../ardvark', './foo', spy);
            spy.should.have.been.calledWith(expected).once;
        });
        it('should require relative to config for walking relative path', () => {
            const spy = sinon.spy();
            config.basePath = '/bar/baz/';
            const expected = '/bar/foo';
            testModule.relativeRequire('../ardvark', '../foo', spy);
            spy.should.have.been.calledWith(expected).once;
        });
        it('should require absolute for absolute path', () => {
            const spy = sinon.spy();
            const expected = '/foo/to/the/bar';
            testModule.relativeRequire('../ardvark', '/foo/to/the/bar', spy);
            spy.should.have.been.calledWith(expected).once;
        });
        it('should require module direct on ENOENT', () => {
            const spy = sinon.stub(),
                enoent = new Error('Cannot find module icky bad');
            enoent.code = 45;
            spy.onFirstCall().throws(enoent);
            testModule.relativeRequire('../ardvark', 'bar', spy);
            spy.should.have.been.calledWith('bar').once;
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
                testModule.relativeRequire.should.not.have.been.called;
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
                testModule.relativeRequire.should.have.been.calledWith('plugins', name, testModule.require).once;
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
                testModule.log.should.have.been.calledWith(`Loading plugin ${name} for ${username}`).once;
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
                forum.addPlugin.should.have.been.calledWith(plugin, cfg).once;
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
                testModule.error.should.have.been.calledWith('Plugin alpha failed to load with error: Error: bad').once;
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
                testModule.relativeRequire.should.have.been.calledWith('providers', name).once;
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
                testModule.getUserAgent.should.have.been.calledOnce;
            });
        });
        it('should call testModule.getUserAgent with configuration information', () => {
            const cfg = JSON.parse(JSON.stringify(basicConfig));
            cfg.estTag = Math.random();
            return testModule.activateConfig(cfg).then(() => {
                testModule.getUserAgent.should.have.been.calledWith(cfg).once;
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
                commands.bindCommands.should.have.been.calledWith(instance).once;
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
                instance.login.should.have.been.calledOnce;
            });
        });
        it('should activate instance', () => {
            return testModule.activateConfig(basicConfig).then(() => {
                instance.activate.should.have.been.calledOnce;
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
                instance.on.should.have.been.calledWith('log', testModule.log).once;
            });
        });
        it('should register for forum event `log`', () => {
            return testModule.activateConfig(basicConfig).then(() => {
                instance.on.should.have.been.calledWith('error', testModule.error).once;
            });
        });
        it('should register for forum event `logExtended`', () => {
            return testModule.activateConfig(basicConfig).then(() => {
                instance.on.should.have.been.calledWith('logExtended', utils.logExtended).once;
            });
        });
        describe('logging', () => {
            it('should log provider name', () => {
                const name = `provider${Math.random()}`;
                const username = `user${Math.random()}`;
                basicConfig.core.provider = name;
                basicConfig.core.username = username;
                return testModule.activateConfig(basicConfig).then(() => {
                    testModule.log.should.have.been.calledWith(`Using provider ${name} for ${username}`).once;
                });
            });
            it('should log ready for login', () => {
                const username = `user${Math.random()}`;
                basicConfig.core.username = username;
                return testModule.activateConfig(basicConfig).then(() => {
                    testModule.log.should.have.been.calledWith(`${username} ready for login`).once;
                });
            });
            it('should log logged in', () => {
                const username = `user${Math.random()}`;
                basicConfig.core.username = username;
                return testModule.activateConfig(basicConfig).then(() => {
                    testModule.log.should.have.been.calledWith(`${username} login successful`).once;
                });
            });
            it('should not log logged in on login failure', () => {
                const username = `user${Math.random()}`;
                basicConfig.core.username = username;
                DummyForum.login.rejects('bad');
                return testModule.activateConfig(basicConfig)
                    .catch(() => 0)
                    .then(() => {
                        testModule.log.should.not.have.been.calledWith(`${username} login successful`);
                    });
            });
            it('should log activated', () => {
                const username = `user${Math.random()}`;
                basicConfig.core.username = username;
                return testModule.activateConfig(basicConfig).then(() => {
                    testModule.log.should.have.been.calledWith(`${username} activated`).once;
                });
            });
            it('should log activated', () => {
                const username = `user${Math.random()}`;
                basicConfig.core.username = username;
                DummyForum.activate.rejects('bad');
                return testModule.activateConfig(basicConfig)
                    .catch(() => 0)
                    .then(() => {
                        testModule.log.should.not.have.been.calledWith(`${username} activated`);
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
            console.log.should.have.been.calledWith(message).once; //eslint-disable-line no-console
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
            console.error.should.have.been.calledWith(message).once; //eslint-disable-line no-console
        });
    });
    describe('getUserAgent()', () => {
        let username = null,
            owner = null,
            ua = null,
            provider = null,
            sandbox = null,
            version = null;
        beforeEach(() => {
            version = `ver$${Math.random()}$`;
            sandbox = sinon.sandbox.create();
            sandbox.stub(testModule, 'getVersion').returns(version);
            username = `username${Math.random()}`;
            owner = `owner${Math.random()}`;
            provider = {};
            ua = testModule.getUserAgent({
                core: {
                    username: username,
                    owner: owner
                }
            }, provider);
        });
        afterEach(() => sandbox.restore());
        it('should return a string', () => {
            testModule.getUserAgent({
                core: {}
            }, provider).should.be.a('string');
        });
        it('should not end in white space', () => {
            /\s+$/.test(testModule.getUserAgent({
                core: {}
            }, {
                compatibilities: ''
            })).should.be.false;
        });
        it('should not end in white space', () => {
            const expected = `abc${Math.random()}def`;
            testModule.getUserAgent({
                core: {}
            }, {
                compatibilities: expected
            }).should.endWith(expected);
        });
        it('should startWith package name/version', () => {
            ua.indexOf(`${packageInfo.name}/${version}`).should.equal(0);
        });
        it('should contain OS platform/architecture', () => {
            ua.indexOf(`${process.platform} ${process.arch}`).should.be.greaterThan(0);
        });
        it('should contain nodejs version', () => {
            ua.indexOf(`nodejs v${process.versions.node}`).should.be.greaterThan(0);
        });
        it('should contain v8 version', () => {
            ua.indexOf(`v8 v${process.versions.v8}`).should.be.greaterThan(0);
        });
        it('should contain username info', () => {
            ua.indexOf(`user:${username}`).should.be.greaterThan(0);
        });
        it('should contain owner information', () => {
            ua.indexOf(`owner:${owner}`).should.be.greaterThan(0);
        });
    });
    describe('ponyError()', () => {
        let sandbox = null;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(testModule, 'error');
        });
        afterEach(() => sandbox.restore());
        it('should log error via exports.error', () => {
            testModule.ponyError();
            testModule.error.should.have.been.calledOnce;
        });
        it('should log error with prefix', () => {
            const prefix = `a${Math.random()}b`;
            testModule.ponyError(prefix);
            const lines = testModule.error.firstCall.args[0].split('\n');
            lines[lines.length - 1].should.startWith(`A-derp! ${prefix}`);
        });
        it('should log string error as message', () => {
            const message = `a${Math.random()}b`;
            testModule.ponyError(undefined, message);
            const lines = testModule.error.firstCall.args[0].split('\n');
            lines[lines.length - 1].should.endWith(message);
        });
        it('should log exception error as message', () => {
            const message = `a${Math.random()}b`;
            testModule.ponyError(undefined, new Error(message));
            const lines = testModule.error.firstCall.args[0].split('\n');
            lines[lines.length - 1].should.endWith(message);
        });
    });
    describe('getVersion()', () => {
        const sha = '33d24d7c8f7f8cf320abb39425375d74d280f3e3';
        beforeEach(() => {
            packageInfo.version = '0.0.0-semantic-release'; // Restore placeholder version
            packageInfo.latestCommit = `$Id: ${sha}$`;
        });
        it('should provide version when version is not semantic-release placeholder', () => {
            const version = `${Math.random() * 20}.${Math.random() * 20}`;
            packageInfo.version = version;
            testModule.getVersion().should.equal(version);
        });
        it('should provide latestCommit sha when version is placeholder and format is correct', () => {
            testModule.getVersion().should.equal(sha);
        });
        it('should provide latestCommit when version is place holder and format is weird', () => {
            const version = `I LIKE ${Math.ceil(Math.random() * 1000)}FISH`;
            packageInfo.latestCommit = version;
            testModule.getVersion().should.equal(version);
        });
        it('should provide unknown version when version is placeholder and latestCommit is placeholder', () => {
            packageInfo.latestCommit = '$Id$';
            testModule.getVersion().should.equal('[Unknown Version]');
        });
        it('should provide unknown version when version is placeholder and latestCommit is missing', () => {
            packageInfo.latestCommit = undefined;
            testModule.getVersion().should.equal('[Unknown Version]');
        });
    });
});
