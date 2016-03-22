'use strict';

const chai = require("chai");
chai.use(require("chai-as-promised"));
chai.use(require('chai-string'));
chai.should();
const expect = chai.expect;

const sinon = require('sinon');
require('sinon-as-promised');

const commands = require('../../lib/commands');
const utils = require('../../lib/utils');

describe('lib/config', () => {
    describe('exports', () => {
        const fns = ['bindCommands'],
            objs = ['internals'],
            vals = [];

        describe('should export expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(commands[fn]).to.be.a('function'));
            });
        });
        describe('should export expected objects', () => {
            objs.forEach((obj) => {
                it(obj, () => expect(commands[obj]).to.be.a('object'));
            });
        });
        describe('should export expected values', () => {
            vals.forEach((val) => {
                it(val, () => commands.should.have.any.key(val));
            });
        });
        it('should export only expected keys', () => {
            commands.should.have.all.keys(fns.concat(objs, vals));
        });
    });
    describe('internals', () => {
        before(() => commands.bindCommands({}));
        const fns = ['Commands', 'Command', 'parseLine', 'getCommandHelps', 'cmdHelp', 'defaultHandler',
                'onError', 'onComplete'
            ],
            objs = ['handlers', 'helpTopics'],
            vals = [];

        describe('should internalize expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(commands.internals[fn]).to.be.a('function'));
            });
        });
        describe('should internalize expected objects', () => {
            objs.forEach((obj) => {
                it(obj, () => expect(commands.internals[obj]).to.be.a('object'));
            });
        });
        describe('should internalize expected values', () => {
            vals.forEach((val) => {
                it(val, () => commands.internals.should.have.any.key(val));
            });
        });
        it('should internalize only expected keys', () => {
            commands.internals.should.have.all.keys(fns.concat(objs, vals));
        });
    });
    describe('internals.parseLine()', () => {
        let parseLine;
        before(() => {
            commands.bindCommands({
                username: 'fred'
            });
            parseLine = commands.internals.parseLine;
        });
        describe('imperative commands', () => {
            describe('output object format', () => {
                it('should match bare command', () => {
                    parseLine('!help').should.have.all.keys(['line', 'command', 'args', 'mention']);
                });
                it('should copy input into output object', () => {
                    parseLine('!help arg1 arg2').line.should.equal('!help arg1 arg2');
                });
                it('should set command in output object', () => {
                    parseLine('!help arg1 arg2').command.should.equal('help');
                });
                it('should normalize command case in output object', () => {
                    parseLine('!HELP arg1 arg2').command.should.equal('help');
                });
                it('should set args correctly', () => {
                    parseLine('!help arg1 arg2').args.should.deep.equal(['arg1', 'arg2']);
                });
                it('should not set mention value', () => {
                    parseLine('!help arg1 arg2').mention.should.be.false;
                });
            });
            describe('any space character should split args', () => {
                [' ', '\f', '\t', '\v', '\u00a0', '\u1680', '\u180e', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004',
                    '\u2005', '\u2006', '\u2007', '\u2008', '\u2009', '\u200a', '\u2028', '\u2029', '\u202f', '\u205f',
                    '\u3000'
                ].forEach((space) => {
                    let str = ('0000' + space.charCodeAt().toString(16));
                    str = '\\u' + str.substring(str.length - 4);
                    it(': ' + str, () => {
                        const input = '!help' + space + 'arg1' + space + 'arg2';
                        parseLine(input).args.should.deep.equal(['arg1', 'arg2']);
                    });
                });
            });
            it('should not match simple text', () => {
                expect(parseLine('simple text stuff')).to.equal(null);
            });
            it('should not match exclamation at end of text', () => {
                expect(parseLine('simple text stuff!')).to.equal(null);
            });
            it('should not match exclamation in text', () => {
                expect(parseLine('simple! text stuff')).to.equal(null);
            });
            it('should not match exclamation with text before', () => {
                expect(parseLine('si!mple text stuff')).to.equal(null);
            });
            it('should not match short command', () => {
                expect(parseLine('!cm text stuff')).to.equal(null);
            });
            it('should not match really short command', () => {
                expect(parseLine('!c text stuff')).to.equal(null);
            });
            it('should match bare command', () => {
                parseLine('!help').command.should.equal('help');
            });
            it('should match command with args', () => {
                const cmd = parseLine('!help arg1 arg2');
                cmd.command.should.equal('help');
                cmd.args.should.deep.equal(['arg1', 'arg2']);
            });
        });
        describe('mention commands', () => {
            describe('output object format', () => {
                it('should match bare command', () => {
                    parseLine('@fred help').should.have.all.keys(['line', 'command', 'args', 'mention']);
                });
                it('should copy input into output object', () => {
                    parseLine('!help arg1 arg2').line.should.equal('!help arg1 arg2');
                });
                it('should set command in output object', () => {
                    parseLine('!help arg1 arg2').command.should.equal('help');
                });
                it('should normalize command case in output object', () => {
                    parseLine('!HELP arg1 arg2').command.should.equal('help');
                });
                it('should set args correctly', () => {
                    parseLine('!help arg1 arg2').args.should.deep.equal(['arg1', 'arg2']);
                });
                it('should not set mention value', () => {
                    parseLine('!help arg1 arg2').mention.should.be.false;
                });
            });
            describe('any space character should split args', () => {
                [' ', '\f', '\t', '\v', '\u00a0', '\u1680', '\u180e', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004',
                    '\u2005', '\u2006', '\u2007', '\u2008', '\u2009', '\u200a', '\u2028', '\u2029', '\u202f', '\u205f',
                    '\u3000'
                ].forEach((space) => {
                    let str = ('0000' + space.charCodeAt().toString(16));
                    str = '\\u' + str.substring(str.length - 4);
                    it(': ' + str, () => {
                        const input = '!help' + space + 'arg1' + space + 'arg2';
                        parseLine(input).args.should.deep.equal(['arg1', 'arg2']);
                    });
                });
            });
            it('should not match simple text', () => {
                expect(parseLine('simple text stuff')).to.equal(null);
            });
            it('should not match exclamation at end of text', () => {
                expect(parseLine('simple text stuff!')).to.equal(null);
            });
            it('should not match exclamation in text', () => {
                expect(parseLine('simple! text stuff')).to.equal(null);
            });
            it('should not match exclamation with text before', () => {
                expect(parseLine('si!mple text stuff')).to.equal(null);
            });
            it('should not match short command', () => {
                expect(parseLine('!cm text stuff')).to.equal(null);
            });
            it('should not match really short command', () => {
                expect(parseLine('!c text stuff')).to.equal(null);
            });
            it('should match bare command', () => {
                parseLine('!help').command.should.equal('help');
            });
            it('should match command with args', () => {
                const cmd = parseLine('!help arg1 arg2');
                cmd.command.should.equal('help');
                cmd.args.should.deep.equal(['arg1', 'arg2']);
            });
        });
        describe('mention commands', () => {
            describe('output object format', () => {
                it('should match bare command', () => {
                    parseLine('@fred help').should.have.all.keys(['line', 'command', 'args', 'mention']);
                });
                it('should copy input into output object', () => {
                    parseLine('@fred help arg1 arg2').line.should.equal('@fred help arg1 arg2');
                });
                it('should set command in output object', () => {
                    parseLine('@fred help arg1 arg2').command.should.equal('help');
                });
                it('should normalize command case in output object', () => {
                    parseLine('@fred HELP arg1 arg2').command.should.equal('help');
                });
                it('should set args correctly', () => {
                    parseLine('@fred help arg1 arg2').args.should.deep.equal(['arg1', 'arg2']);
                });
                it('should set mention value', () => {
                    parseLine('@fred help arg1 arg2').mention.should.be.true;
                });
            });
            describe('any space character should split args', () => {
                [' ', '\f', '\t', '\v', '\u00a0', '\u1680', '\u180e', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004',
                    '\u2005', '\u2006', '\u2007', '\u2008', '\u2009', '\u200a', '\u2028', '\u2029', '\u202f', '\u205f',
                    '\u3000'
                ].forEach((space) => {
                    let str = ('0000' + space.charCodeAt().toString(16));
                    str = '\\u' + str.substring(str.length - 4);
                    it(': ' + str, () => {
                        const input = '@fred help' + space + 'arg1' + space + 'arg2';
                        parseLine(input).args.should.deep.equal(['arg1', 'arg2']);
                    });
                });
            });
            it('should not match simple text', () => {
                expect(parseLine('simple text stuff')).to.equal(null);
            });
            it('should not match mention at end of text', () => {
                expect(parseLine('simple text stuff @fred')).to.equal(null);
            });
            it('should not match mention in text', () => {
                expect(parseLine('simple @fred  text stuff')).to.equal(null);
            });
            it('should not match short command', () => {
                expect(parseLine('@fred cm text stuff')).to.equal(null);
            });
            it('should not match really short command', () => {
                expect(parseLine('@fred c text stuff')).to.equal(null);
            });
            it('should not match wroing user mention command', () => {
                expect(parseLine('@wilma c text stuff')).to.equal(null);
            });
            it('should match canse insensitive mention command', () => {
                parseLine('@FRED help').command.should.equal('help');
            });
            it('should match bare command', () => {
                parseLine('@fred help').command.should.equal('help');
            });
            it('should match command with args', () => {
                const cmd = parseLine('@fred help arg1 arg2');
                cmd.command.should.equal('help');
                cmd.args.should.deep.equal(['arg1', 'arg2']);
            });
        });
    });
    describe('internals.onComplete()', () => {
        let forum, onComplete;
        beforeEach(() => {
            forum = {
                Post: {
                    reply: sinon.stub()
                }
            };
            forum.Post.reply.resolves();
            commands.bindCommands(forum);
            onComplete = commands.internals.onComplete;
        });
        it('should not attempt to post on no content', () => {
            return onComplete({
                    commands: [{
                        replyText: ''
                    }]
                })
                .then(() => {
                    forum.Post.reply.called.should.be.false;
                });
        });
        it('should not attempt to post on whitespace content', () => {
            return onComplete({
                    commands: [{
                        replyText: ' '
                    }]
                })
                .then(() => {
                    forum.Post.reply.called.should.be.false;
                });
        });
        it('should post with content', () => {
            return onComplete({
                    commands: [{
                        replyText: 'foo'
                    }],
                    notification: {
                        topicId: 45,
                        postId: -7
                    }
                })
                .then(() => {
                    forum.Post.reply.calledWith(45, -7, 'foo').should.be.true;
                });
        });
        it('should merge multiple command replies', () => {
            return onComplete({
                    commands: [{
                        replyText: 'foo'
                    }, {
                        replyText: 'bar'
                    }],
                    notification: {
                        topicId: 45,
                        postId: -7
                    }
                })
                .then(() => {
                    forum.Post.reply.calledWith(45, -7, 'foo\n\n---\n\nbar').should.be.true;
                });
        });
        it('should merge preseve whitespace in command replies', () => {
            return onComplete({
                    commands: [{
                        replyText: '\nfoo '
                    }, {
                        replyText: '\tbar\n'
                    }],
                    notification: {
                        topicId: 45,
                        postId: -7
                    }
                })
                .then(() => {
                    forum.Post.reply.calledWith(45, -7, '\nfoo \n\n---\n\n\tbar\n').should.be.true;
                });
        });
        it('should ignore blank command replies', () => {
            return onComplete({
                    commands: [{
                        replyText: '\n\t'
                    }, {
                        replyText: 'foo'
                    }, {
                        replyText: '\n'
                    }, {
                        replyText: 'bar'
                    }, {
                        replyText: ' '
                    }],
                    notification: {
                        topicId: 45,
                        postId: -7
                    }
                })
                .then(() => {
                    forum.Post.reply.calledWith(45, -7, 'foo\n\n---\n\nbar').should.be.true;
                });
        });
    });
    describe('internals.onError()', () => {
        let forum, onError;
        beforeEach(() => {
            forum = {
                Post: {
                    reply: sinon.stub()
                }
            };
            forum.Post.reply.resolves();
            commands.bindCommands(forum);
            onError = commands.internals.onError;
        });
        it('should post error message', () => {
            return onError('a florgle wozzer was grutzed', {
                notification: {
                    topicId: 3.14,
                    postId: 'hi'
                }
            }).then(() => {
                forum.Post.reply.calledWith(3.14, 'hi', 'An unexpected error `a florgle wozzer was grutzed` ' +
                    'occured and your commands could not be processed!').should.be.true;
            });
        });
    });
    describe('internals.defaultHandler()', () => {
        let forum, defaultHandler;
        beforeEach(() => {
            forum = {};
            commands.bindCommands(forum);
            defaultHandler = commands.internals.defaultHandler;
        });
        it('should reply with message to imperative command', () => {
            const command = {
                command: 'kittens',
                mention: false,
                reply: sinon.spy()
            };
            return defaultHandler(command).then(() => {
                command.reply.calledWith('Command `kittens` is not recognized').should.be.true;
            });
        });
        it('should not reply with message to mention command', () => {
            const command = {
                command: 'kittens',
                mention: true,
                reply: sinon.spy()
            };
            return defaultHandler(command).then(() => {
                command.reply.called.should.be.false;
            });
        });
    });
    describe('internals.cmdHelp', () => {
        let forum, cmdHelp;
        beforeEach(() => {
            forum = {
                Post: {
                    reply: sinon.stub()
                }
            };
            forum.Post.reply.resolves();
            commands.bindCommands(forum);
            cmdHelp = commands.internals.cmdHelp;
        });
        it('should be registered as `command#help` event', () => {
            commands.internals.handlers['help'].handler.should.equal(cmdHelp);
        });
        it('should post expected text', () => {
            const expected = 'Registered commands:\nhelp: print command help listing\n' +
                'shutup: tell me to shutup\n\n* Help topic available.\n\nIssue the `help`' +
                ' command with an available help topic as a parameter to read additonal help';
            commands.internals.handlers.help = {
                help: 'print command help listing'
            };
            commands.internals.handlers.shutup = {
                help: 'tell me to shutup'
            };
            const spy = sinon.spy();
            cmdHelp({
                command: 'foobar',
                reply: spy
            });
            spy.firstCall.args[0].should.equal(expected);
        });
        it('should post expected text with help topics', () => {
            const expected = 'Registered commands:\nhelp: print command help listing\n\n' +
                'Help Topics:\nshutup: Extended help topic\n\n* Help topic available.\n\n' +
                'Issue the `help` command with an available help topic as a parameter to ' +
                'read additonal help';
            commands.internals.handlers.help = {
                help: 'print command help listing'
            };
            commands.internals.helpTopics.shutup = 'tell me to shutup';
            const spy = sinon.spy();
            cmdHelp({
                command: 'foobar',
                reply: spy
            });
            spy.firstCall.args[0].should.equal(expected);
        });

        it('should indicate presence of help topic on command', () => {
            const expected = 'Registered commands:\nhelp: print command help listing *\n\n' +
                '* Help topic available.\n\nIssue the `help` command with an available help ' +
                'topic as a parameter to read additonal help';
            commands.internals.handlers.help = {
                help: 'print command help listing'
            };
            commands.internals.helpTopics.help = 'foobar';
            const spy = sinon.spy();
            cmdHelp({
                command: 'foobar',
                reply: spy
            });
            spy.firstCall.args[0].should.equal(expected);
        });
        describe('with parameters', () => {
            it('should post default text without parameters', () => {
                const expected = 'Registered commands:';
                const spy = sinon.spy();
                cmdHelp({
                    command: 'foobar',
                    reply: spy
                });
                spy.firstCall.args[0].should.startWith(expected);
            });
            it('should post default text when called with empty parameters', () => {
                const expected = 'Registered commands:';
                const spy = sinon.spy();
                cmdHelp({
                    command: 'foobar',
                    args: [],
                    reply: spy
                });
                spy.firstCall.args[0].should.startWith(expected);
            });
            it('should post default text when called with unexpected parameters', () => {
                const expected = 'Registered commands:';

                const spy = sinon.spy();
                cmdHelp({
                    command: 'foobar',

                    args: ['i', 'am', 'not', 'a', 'command'],
                    reply: spy
                });
                spy.firstCall.args[0].should.startWith(expected);
            });
            it('should post extended help message one word command', () => {
                const expected = 'Help topic for `whosit`\n\nwhosit extended help' +
                    '\n\nIssue the `help` command without any parameters to see all available commands';
                commands.internals.helpTopics.whosit = 'whosit extended help';
                const spy = sinon.spy();
                cmdHelp({
                    command: 'foobar',
                    args: ['whosit'],
                    reply: spy
                });
                spy.firstCall.args[0].should.equal(expected);
            });
            it('should post extended help message multi-word command', () => {
                const expected = 'Help topic for `who am i`';
                commands.internals.helpTopics['who am i'] = 'whosit extended help';
                const spy = sinon.spy();
                cmdHelp({
                    command: 'foobar',
                    args: ['who', 'am', 'i'],
                    reply: spy
                });
                spy.firstCall.args[0].should.startWith(expected);
            });
        });
    });
    describe('internals.getCommandHelps()', () => {
        let cmds, forum, getCommandHelps;
        beforeEach(() => {
            forum = {};
            commands.bindCommands(forum);
            cmds = commands.internals.handlers;
            Object.keys(cmds).forEach((key) => delete cmds[key]);
            getCommandHelps = commands.internals.getCommandHelps;
        });
        it('should return default text', () => {
            const expected = 'Registered commands:',
                result = getCommandHelps();
            result.should.equal(expected);
        });
        it('should return help for one command', () => {
            cmds.help = {
                help: 'foobar'
            };
            const expected = 'Registered commands:\nhelp: foobar',
                result = getCommandHelps();
            result.should.equal(expected);
        });
        it('should return sort commands', () => {
            cmds.help = {
                help: 'foobar'
            };
            cmds.aaa = {
                help: 'bbb'
            };
            const expected = 'Registered commands:\naaa: bbb\nhelp: foobar',
                result = getCommandHelps();
            result.should.equal(expected);
        });
    });
    describe('Command', () => {
        let forum, Command, handlers;
        beforeEach(() => {
            forum = {};
            commands.bindCommands(forum);
            Command = commands.internals.Command;
            handlers = commands.internals.handlers;
        });
        describe('ctor()', () => {
            it('should use utils.mapSet for storage', () => {
                const command = new Command({}, {});
                utils.mapGet(command).should.be.ok;
            });
            it('should store definition.line', () => {
                const expected = `${Math.random()}${Math.random()}`;
                const command = new Command({
                    line: expected
                }, {});
                utils.mapGet(command).line.should.equal(expected);
            });
            it('should store definition.command', () => {
                const expected = `${Math.random()}${Math.random()}`;
                const command = new Command({
                    command: expected
                }, {});
                utils.mapGet(command).command.should.equal(expected);
            });
            it('should store definition.args', () => {
                const expected = `${Math.random()}${Math.random()}`;
                const command = new Command({
                    args: expected
                }, {});
                utils.mapGet(command).args.should.equal(expected);
            });
            it('should store definition.mention', () => {
                const expected = `${Math.random()}${Math.random()}`;
                const command = new Command({
                    mention: expected
                }, {});
                utils.mapGet(command).mention.should.equal(expected);
            });
            it('should store default reply text', () => {
                const command = new Command({}, {});
                utils.mapGet(command).replyText.should.equal('');
            });
            it('should select defaultHandler for no command', () => {
                const command = new Command({}, {});
                utils.mapGet(command).handler.should.equal(commands.internals.defaultHandler);
            });
            it('should select defaultHandler for invalid command', () => {
                const command = new Command({
                    command: 'ook!'
                }, {});
                utils.mapGet(command).handler.should.equal(commands.internals.defaultHandler);
            });
            it('should select registered handler for valid command', () => {
                const expected = sinon.spy();
                handlers.ook = {
                    handler: expected
                };
                const command = new Command({
                    command: 'ook'
                }, {});
                utils.mapGet(command).handler.should.equal(expected);
            });
            it('should store a reference to parent Commands', () => {
                const expected = sinon.spy();
                const command = new Command({}, expected);
                utils.mapGet(command).parent.should.equal(expected);
            });
        });
        describe('simple getters', () => {
            let command, data;
            beforeEach(() => {
                command = new Command({}, {});
                data = utils.mapGet(command);
            });
            ['line', 'command', 'mention', 'args', 'parent', 'replyText'].forEach((property) => {
                it(`should allow get of ${property} from storage`, () => {
                    const expected = Math.random();
                    data[property] = expected;
                    command[property].should.equal(expected);
                });
                it(`should disallow setting value to ${property}`, () => {
                    expect(() => {
                        command[property] = 'foo';
                    }).to.throw();
                });
            });
        });
        describe('proxied getters', () => {
            let command, parent;
            beforeEach(() => {
                parent = {
                    getPost: sinon.stub(),
                    getTopic: sinon.stub(),
                    getUser: sinon.stub()
                };
                command = new Command({}, parent);
            });
            it('should proxy getPost() to parent.getPost()', () => {
                const expected = Math.random();
                parent.getPost.returns(expected);
                command.getPost().should.equal(expected);
                parent.getPost.called.should.be.true;
            });
            it('should proxy getTopic() to parent.getTopic()', () => {
                const expected = Math.random();
                parent.getTopic.returns(expected);
                command.getTopic().should.equal(expected);
                parent.getTopic.called.should.be.true;
            });
            it('should proxy getUser() to parent.getUser()', () => {
                const expected = Math.random();
                parent.getUser.returns(expected);
                command.getUser().should.equal(expected);
                parent.getUser.called.should.be.true;
            });
        });
        describe('reply()', () => {
            let command, data;
            beforeEach(() => {
                command = new Command({}, {});
                data = utils.mapGet(command);
            });
            it('should set replyText property', () => {
                const expected = `a${Math.random()}b`;
                command.reply(expected);
                data.replyText.should.equal(expected);
            });
        });
        describe('execute()', () => {
            let command, data;
            beforeEach(() => {
                command = new Command({}, {});
                data = utils.mapGet(command);
            });
            it('should set replyText property', () => {
                const expected = Math.random();
                const spy = sinon.stub().resolves(expected);
                data.handler = spy;
                return command.execute().should.become(expected);
            });
        });
    });
    describe('Commands', () => {
        let forum, Commands;
        beforeEach(() => {
            forum = {};
            commands.bindCommands(forum);
            Commands = commands.internals.Commands;
        });
        describe('ctor()', () => {
            it('should use utils.mapSet for storage', () => {
                const command = new Commands({}, '');
                utils.mapGet(command).should.be.ok;
            });
            it('should store notification parameter', () => {
                const expected = `${Math.random()}${Math.random()}`;
                const command = new Commands(expected, '');
                utils.mapGet(command).notification.should.equal(expected);
            });
            it('should store postbody parameter', () => {
                const expected = `${Math.random()}${Math.random()}`;
                const command = new Commands({}, expected);
                utils.mapGet(command).postBody.should.equal(expected);
            });
            it('should store commands array', () => {
                const expected = '';
                const command = new Commands({}, expected);
                utils.mapGet(command).commands.should.be.an('Array');
            });
            it('should store parsed commands', () => {
                const expected = '!123\n!456';
                const command = new Commands({}, expected);
                utils.mapGet(command).commands.should.have.length(2);
            });
        });
        describe('simple getters', () => {
            let command, data;
            beforeEach(() => {
                command = new Commands({}, '');
                data = utils.mapGet(command);
            });
            ['notification', 'commands'].forEach((property) => {
                it(`should allow get of ${property} from storage`, () => {
                    const expected = Math.random();
                    data[property] = expected;
                    command[property].should.equal(expected);
                });
                it(`should disallow setting value to ${property}`, () => {
                    expect(() => {
                        command[property] = 'foo';
                    }).to.throw();
                });
            });
        });
        describe('cached getters', () => {
            [
                ['getPost', 'Post', 'post', 'postId'],
                ['getTopic', 'Topic', 'topic', 'topicId'],
                ['getUser', 'User', 'user', 'userId']
            ].forEach((config) => {
                const method = config[0],
                    object = config[1],
                    store = config[2],
                    param = config[3];
                let command, spy, data, notification;
                beforeEach(() => {
                    notification = {};
                    command = new Commands(notification, '');
                    spy = sinon.stub().resolves();
                    forum[object] = {
                        get: spy
                    };
                    data = utils.mapGet(command);
                });
                it(`should resolve to cached ${object} when set`, () => {
                    const expected = Math.random();
                    data[store] = expected;
                    return command[method]().then((item) => {
                        item.should.equal(expected);
                        spy.called.should.be.false;
                    });
                });
                it(`should request ${store} by notification ${param}`, () => {
                    const id = Math.random();
                    notification[param] = id;
                    expect(data[store]).to.be.not.ok;
                    return command[method]().then(() => {
                        spy.calledWith(id).should.be.true;
                    });
                });
                it(`should resolve to fetched ${object}`, () => {
                    const expected = Math.random();
                    spy.resolves(expected);
                    return command[method]().should.become(expected);
                });
                it(`should cache fetched ${object}`, () => {
                    const expected = Math.random();
                    spy.resolves(expected);
                    return command[method]().then(() => {
                        data[store].should.equal(expected);
                    });
                });
            });
        });
        describe('execute()', () => {
            let command, data;
            beforeEach(() => {
                command = new Commands({}, '');
                data = utils.mapGet(command);
            });
            it('should resolve to executing instance', () => {
                return command.execute().should.become(command);
            });
            it('should execute contained commands', () => {
                const spy = sinon.stub().resolves();
                const cmd = {
                    execute: spy
                };
                data.commands = [cmd, cmd, cmd, cmd];
                return command.execute().then(() => {
                    spy.callCount.should.equal(4);
                });
            });
            it('should post command results', () => {
                forum.Post = {
                    reply: sinon.stub().resolves()
                };
                const expected = 'foo';
                data.notification.postId = 1;
                data.notification.topicId = 50;
                data.commands = [{
                    execute: sinon.stub().resolves(),
                    replyText: expected
                }];
                return command.execute().then(() => {
                    forum.Post.reply.calledWith(50, 1, expected).should.be.true;
                });
            });
            it('should execute onError when any command rejects', () => {
                forum.Post = {
                    reply: sinon.stub().resolves()
                };
                const spy = sinon.stub().resolves();
                const rejector = sinon.stub().rejects('bad');
                data.notification.postId = 1;
                data.notification.topicId = 50;
                data.commands = [{
                    execute: spy
                }, {
                    execute: rejector
                }, {
                    execute: spy
                }];
                return command.execute().then(() => {
                    forum.Post.reply.calledWith(50,
                        1,
                        'An unexpected error `Error: bad` occured and your commands could not be processed!').should.be.true;
                });
            });
            it('should emit error when onError rejects', () => {
                forum.Post = {
                    reply: sinon.stub().rejects('badbad')
                };
                forum.emit = sinon.spy();
                data.notification.postId = 1;
                data.notification.topicId = 50;
                data.commands = [{
                    execute: sinon.stub().rejects('bad')
                }];
                return command.execute().then(() => {
                    forum.emit.calledWith('logError').should.be.true;
                });
            });
        });
        describe('static get()', () => {
            it('should use notification.getText()', () => {
                const notification = {
                    getText: sinon.stub().resolves('<div>content</div>')
                };
                return Commands.get(notification).then((command) => {
                    notification.getText.called.should.be.true;
                });
            });
            it('should store notification in result', () => {
                const notification = {
                    getText: sinon.stub().resolves('<div>content</div>')
                };
                return Commands.get(notification).then((command) => {
                    command.notification.should.equal(notification);
                });
            });
            it('should store parsed text in result', () => {
                const notification = {
                    getText: sinon.stub().resolves('<div>content</div>')
                };
                return Commands.get(notification).then((command) => {
                    utils.mapGet(command, 'postBody').should.equal('content');
                });
            });
        });
        describe('static add()', () => {
            beforeEach(() => commands.bindCommands({}));
            it('should add command to helpers', () => {
                const cmd = `a${Math.random()}a`,
                    text = `b${Math.random()}b`,
                    handler = sinon.spy();
                expect(commands.internals.handlers[cmd]).to.be.not.ok;
                commands.internals.Commands.add(cmd, text, handler);
                commands.internals.handlers[cmd].should.eql({
                    handler: handler,
                    help: text
                });
            });
        });
    });
});
