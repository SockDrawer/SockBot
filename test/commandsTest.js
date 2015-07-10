'use strict';
/*globals describe, it, before, beforeEach, after*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon');
chai.should();
const expect = chai.expect;

// The thing we're testing
const commands = require('../commands'),
    config = require('../config'),
    utils = require('../utils');
describe('browser', () => {
    describe('exports', () => {
        const fns = ['prepareCommands', 'parseCommands'],
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
                it(val, () => commands.should.have.key(val));
            });
        });
        it('should export only expected keys', () => {
            commands.should.have.all.keys(fns.concat(objs, vals));
        });
    });
    describe('internals', () => {
        const fns = ['parseMentionCommand', 'parseShortCommand', 'registerCommand',
                'commandProtect', 'getCommands', 'cmdError'
            ],
            objs = ['mention', 'events', 'commands'],
            vals = [];
        describe('should include expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(commands.internals[fn]).to.be.a('function'));
            });
        });
        describe('should include expected objects', () => {
            objs.forEach((obj) => {
                it(obj, () => (typeof commands.internals[obj]).should.equal('object'));
            });
        });
        describe('should include expected values', () => {
            vals.forEach((val) => {
                it(val, () => commands.internals.should.have.any.key(val));
            });
        });
        it('should include only expected keys', () => {
            commands.internals.should.have.all.keys(fns.concat(objs, vals));
        });
    });
    describe('internals.parseShortCommand()', () => {
        const parseShortCommand = commands.internals.parseShortCommand;
        describe('output object format', () => {
            it('should match bare command', () => {
                parseShortCommand('!help').should.have.all.keys(['input', 'command', 'args', 'mention']);
            });
            it('should copy input into output object', () => {
                parseShortCommand('!help arg1 arg2').input.should.equal('!help arg1 arg2');
            });
            it('should set command in output object', () => {
                parseShortCommand('!help arg1 arg2').command.should.equal('help');
            });
            it('should normalize command case in output object', () => {
                parseShortCommand('!HELP arg1 arg2').command.should.equal('help');
            });
            it('should set args correctly', () => {
                parseShortCommand('!help arg1 arg2').args.should.deep.equal(['arg1', 'arg2']);
            });
            it('should not set mention value', () => {
                expect(parseShortCommand('!help arg1 arg2').mention).to.equal(null);
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
                    parseShortCommand(input).args.should.deep.equal(['arg1', 'arg2']);
                });
            });
        });
        it('should not match simple text', () => {
            expect(parseShortCommand('simple text stuff')).to.equal(null);
        });
        it('should not match exclamation at end of text', () => {
            expect(parseShortCommand('simple text stuff!')).to.equal(null);
        });
        it('should not match exclamation in text', () => {
            expect(parseShortCommand('simple! text stuff')).to.equal(null);
        });
        it('should not match exclamation with text before', () => {
            expect(parseShortCommand('si!mple text stuff')).to.equal(null);
        });
        it('should not match short command', () => {
            expect(parseShortCommand('!cm text stuff')).to.equal(null);
        });
        it('should not match really short command', () => {
            expect(parseShortCommand('!c text stuff')).to.equal(null);
        });
        it('should match bare command', () => {
            parseShortCommand('!help').command.should.equal('help');
        });
        it('should match command with args', () => {
            const cmd = parseShortCommand('!help arg1 arg2');
            cmd.command.should.equal('help');
            cmd.args.should.deep.equal(['arg1', 'arg2']);
        });
    });
    describe('internals.parseMentionCommand()', () => {
        const parseMentionCommand = commands.internals.parseMentionCommand;
        before((done) => {
            config.core.username = 'foobar';
            commands.prepareCommands({
                on: () => 0
            }, done);
        });
        describe('output object format', () => {
            it('should match bare command', () => {
                parseMentionCommand('@foobar help').should.have.all.keys(['input', 'command', 'args', 'mention']);
            });
            it('should normalize input into output object', () => {
                parseMentionCommand('@foobar help arg1 arg2').input.should.equal('!help arg1 arg2');
            });
            it('should normalize input without arguments', () => {
                parseMentionCommand('@foobar help').input.should.equal('!help');
            });
            it('should set command in output object', () => {
                parseMentionCommand('@foobar help arg1 arg2').command.should.equal('help');
            });
            it('should normalize command case in output object', () => {
                parseMentionCommand('@foobar HELP arg1 arg2').command.should.equal('help');
            });
            it('should set args correctly', () => {
                parseMentionCommand('@foobar help arg1 arg2').args.should.deep.equal(['arg1', 'arg2']);
            });
            it('should set mention value', () => {
                parseMentionCommand('@foobar help arg1 arg2').mention.should.equal('@foobar');
            });
        });
        describe('mention case insensitive', () => {
            it('@foobar', () => {
                expect(parseMentionCommand('@foobar help')).to.not.equal(null);
            });
            it('@FooBar', () => {
                expect(parseMentionCommand('@FooBar help')).to.not.equal(null);
            });
            it('@fOObAR', () => {
                expect(parseMentionCommand('@fOObAR help')).to.not.equal(null);
            });
            it('@FOOBAR', () => {
                expect(parseMentionCommand('@FOOBAR help')).to.not.equal(null);
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
                    const input = '@foobar help' + space + 'arg1' + space + 'arg2';
                    parseMentionCommand(input).args.should.deep.equal(['arg1', 'arg2']);
                });
            });
        });
        it('should not match simple text', () => {
            expect(parseMentionCommand('simple text stuff')).to.equal(null);
        });
        it('should not match embedded mention', () => {
            expect(parseMentionCommand('simple @foobar text stuff!')).to.equal(null);
        });
        it('should not match embedded mention 2', () => {
            expect(parseMentionCommand('simple@foobar text stuff')).to.equal(null);
        });
        it('should not match embedded mention 3', () => {
            expect(parseMentionCommand('si@foobarmple text stuff')).to.equal(null);
        });
        it('should not match short command', () => {
            expect(parseMentionCommand('@foobar cm text stuff')).to.equal(null);
        });
        it('should not match really short command', () => {
            expect(parseMentionCommand('@foobar c text stuff')).to.equal(null);
        });
        it('should not match wrong mention', () => {
            expect(parseMentionCommand('@foobaz simple text stuff')).to.equal(null);
        });
        it('should match bare command', () => {
            parseMentionCommand('@foobar help').command.should.equal('help');
        });
        it('should match command with args', () => {
            const cmd = parseMentionCommand('@foobar help arg1 arg2');
            cmd.command.should.equal('help');
            cmd.args.should.deep.equal(['arg1', 'arg2']);
        });
    });
    describe('internals.registerCommand()', () => {
        const registerCommand = commands.internals.registerCommand,
            events = {},
            spy = sinon.spy();
        before(() => {
            events.on = sinon.spy();
            commands.internals.events = events;
            sinon.stub(utils, 'log');
        });
        beforeEach(() => {
            //reset everything
            commands.internals.commands = {};
            spy.reset();
            events.on.reset();
            utils.log.reset();
        });
        describe('parameter validation', () => {
            it('should require a callback', () => {
                expect(() => registerCommand()).to.throw('callback must be provided');
            });
            it('should require callback to be a function', () => {
                expect(() => {
                    registerCommand(undefined, undefined, undefined, 'not function');
                }).to.throw('callback must be provided');
            });
            it('should require `command`', () => {
                registerCommand(undefined, undefined, undefined, spy);
                spy.called.should.be.true;
                spy.lastCall.args[0].should.be.instanceOf(Error);
                spy.lastCall.args[0].message.should.equal('command must be provided');
            });
            it('should require `command` to be string', () => {
                registerCommand(true, undefined, undefined, spy);
                spy.called.should.be.true;
                spy.lastCall.args[0].should.be.instanceOf(Error);
                spy.lastCall.args[0].message.should.equal('command must be provided');
            });
            it('should require `helpstring`', () => {
                registerCommand('command', undefined, undefined, spy);
                spy.called.should.be.true;
                spy.lastCall.args[0].should.be.instanceOf(Error);
                spy.lastCall.args[0].message.should.equal('helpstring must be provided');
            });
            it('should require `helpstring` to be string', () => {
                registerCommand('command', true, undefined, spy);
                spy.called.should.be.true;
                spy.lastCall.args[0].should.be.instanceOf(Error);
                spy.lastCall.args[0].message.should.equal('helpstring must be provided');
            });
            it('should require `handler`', () => {
                registerCommand('command', 'help', undefined, spy);
                spy.called.should.be.true;
                spy.lastCall.args[0].should.be.instanceOf(Error);
                spy.lastCall.args[0].message.should.equal('handler must be provided');
            });
            it('should require `handler` to be string', () => {
                registerCommand('command', 'help', true, spy);
                spy.called.should.be.true;
                spy.lastCall.args[0].should.be.instanceOf(Error);
                spy.lastCall.args[0].message.should.equal('handler must be provided');
            });
            it('should call callback without error on command registration', () => {
                registerCommand('command', 'help', () => 0, spy);
                spy.called.should.be.true;
                spy.lastCall.args.should.have.length(0);
            });
        });
        it('should add command to command list on command registration', () => {
            registerCommand('command', 'help', () => 0, spy);
            commands.internals.commands.command.should.be.ok;
        });
        it('should add handler to command list on command registration', () => {
            const func = () => 0;
            registerCommand('command', 'help', func, spy);
            commands.internals.commands.command.handler.should.equal(func);
        });
        it('should add handler to command list on command registration', () => {
            const txt = 'help' + Math.random();
            registerCommand('command', txt, () => 0, spy);
            commands.internals.commands.command.help.should.equal(txt);
        });
        it('should add command to event listeners', () => {
            const func = () => 0;
            registerCommand('command', 'help', func, spy);
            events.on.calledWith('command#command', func).should.be.true;
        });
        it('should log registration', () => {
            registerCommand('command', 'help', () => 0, spy);
            utils.log.callCount.should.equal(1);
            utils.log.calledWith('Command Registered: command: help').should.be.true;
        });
        describe('command conflict resolution', () => {
            it('should prefix conflicting command with underscore', () => {
                const func = () => 0,
                    name = '_command';
                commands.internals.commands.command = true;
                registerCommand('command', 'help', func, spy);
                commands.internals.commands[name].handler.should.equal(func);
                events.on.calledWith('command#_command', func).should.be.true;
            });
            it('should resolve multiply conflicting command with underscores', () => {
                const func = () => 0,
                    name = '___command';
                commands.internals.commands[name.slice(3)] = true;
                commands.internals.commands[name.slice(2)] = true;
                commands.internals.commands[name.slice(1)] = true;
                registerCommand('command', 'help', func, spy);
                commands.internals.commands[name].handler.should.equal(func);
                events.on.calledWith('command#___command', func).should.be.true;
            });
        });
        after(() => {
            utils.log.restore();
        });
    });
    describe('internals.commandProtect()', () => {
        const commandProtect = commands.internals.commandProtect,
            events = {};
        let cmds;
        before(() => {
            sinon.stub(utils, 'warn');
            events.removeListener = sinon.spy();
            commands.internals.events = events;
        });
        beforeEach(() => {
            events.removeListener.reset();
            cmds = {};
            commands.internals.commands = cmds;
        });
        it('should not trigger for incorrect prefix', () => {
            commandProtect('postRecieved').should.be.false;
        });
        it('should not trigger for partial prefix', () => {
            commandProtect('command#').should.be.false;
        });
        it('should trigger for proper command registration', () => {
            const func = () => 0;
            cmds.cmd = {
                handler: func
            };
            commandProtect('command#cmd', func).should.be.true;
            events.removeListener.calledWith('cmd', func).should.be.false;
            utils.warn.called.should.be.false;
        });
        it('should reject command that is not already registered', () => {
            const func = () => 0,
                err = 'Invalid command (cmd) registered! must register commands with onCommand()';
            commandProtect('command#cmd', func);
            events.removeListener.calledWith('command#cmd', func).should.be.true;
            utils.warn.lastCall.args[0].should.equal(err);
        });
        it('should reject command that is not properly registered', () => {
            const func = () => 0,
                err = 'Invalid command (cmd1) registered! must register commands with onCommand()';
            cmds.cmd1 = {
                handler: () => 0
            };
            commandProtect('command#cmd1', func);
            events.removeListener.calledWith('command#cmd1', func).should.be.true;
            utils.warn.calledWith(err).should.be.true;
        });
        after(() => {
            utils.warn.restore();
        });
    });
    describe('prepareParser()', () => {
        const prepareCommands = commands.prepareCommands;
        before(() => {
            config.core.username = 'foo';
            sinon.stub(utils, 'log');
        });
        it('should call callback on completion', () => {
            const spy = sinon.spy();
            prepareCommands({
                on: () => 0
            }, spy);
            spy.called.should.be.true;
            spy.lastCall.args.should.deep.equal([]);
        });
        it('should set events object', () => {
            const spy = sinon.spy(),
                events = {
                    on: () => 0
                };
            prepareCommands(events, spy);
            commands.internals.events.should.equal(events);
        });
        it('should produce expected mentionCommand regexp', () => {
            prepareCommands({
                on: () => 0
            }, () => 0);
            commands.internals.mention.toString().should.equal('/^@foo\\s\\S{3,}(\\s|$)/i');
        });
        it('should produce register commandPotect as newListener listener', () => {
            const spy = sinon.spy();
            prepareCommands({
                on: spy
            }, () => 0);
            spy.calledWith('newListener', commands.internals.commandProtect).should.be.true;
        });
        after(() => utils.log.restore());
    });
    describe('parseCommands()', () => {
        let parseShortCommand, parseMentionCommand, events, callbackSpy, clocks;
        before(() => {
            sinon.stub(commands.internals, 'parseShortCommand');
            sinon.stub(commands.internals, 'parseMentionCommand');
            parseShortCommand = commands.internals.parseShortCommand;
            parseMentionCommand = commands.internals.parseMentionCommand;
            clocks = sinon.useFakeTimers();
        });
        beforeEach(() => {
            parseShortCommand.reset();
            parseMentionCommand.reset();
            events = {
                emit: sinon.stub()
            };
            commands.internals.events = events;
            callbackSpy = sinon.spy();
        });
        it('should require callback', () => {
            expect(() => commands.parseCommands({}, null)).to.throw('callback must be supplied');
            parseShortCommand.called.should.be.false;
            parseMentionCommand.called.should.be.false;
        });
        it('should accept empty post', () => {
            commands.parseCommands(null, callbackSpy);
            callbackSpy.called.should.be.true;
            callbackSpy.lastCall.args.should.deep.equal([null, []]);
            parseShortCommand.called.should.be.false;
            parseMentionCommand.called.should.be.false;
        });
        it('should accept blank post', () => {
            commands.parseCommands({
                raw: ''
            }, callbackSpy);
            callbackSpy.called.should.be.true;
            callbackSpy.lastCall.args.should.deep.equal([null, []]);
            parseShortCommand.called.should.be.false;
            parseMentionCommand.called.should.be.false;
        });
        it('should not emit on non command post', () => {
            commands.parseCommands({
                raw: 'i am a little text short and stout'
            }, callbackSpy);
            callbackSpy.called.should.be.true;
            callbackSpy.lastCall.args.should.deep.equal([null, []]);
            parseShortCommand.called.should.be.false;
            parseMentionCommand.called.should.be.true;
            events.emit.called.should.be.false;
        });
        it('should not emit on non command post 2', () => {
            commands.parseCommands({
                raw: '!i am a little text short and stout'
            }, callbackSpy);
            callbackSpy.called.should.be.true;
            callbackSpy.lastCall.args.should.deep.equal([null, []]);
            parseShortCommand.called.should.be.true;
            parseMentionCommand.called.should.be.false;
            events.emit.called.should.be.false;
        });
        it('should emit on post containing command', () => {
            parseShortCommand.returns({
                command: 'foobar'
            });
            events.emit.returns(true);
            commands.parseCommands({
                raw: '!i am a little text short and stout'
            }, callbackSpy);
            clocks.tick(0);
            events.emit.called.should.be.true;
            events.emit.lastCall.args.should.deep.equal(['command#foobar', {
                command: 'foobar',
                post: {
                    raw: '!i am a little text short and stout'
                }
            }]);
        });
        it('should multi emit on post containing multiple commands', () => {
            parseShortCommand.returns({
                command: 'foobar'
            });
            events.emit.returns(true);
            commands.parseCommands({
                raw: '!i am a little\ntext short\n!and stout'
            }, callbackSpy);
            clocks.tick(0);
            events.emit.called.should.be.true;
            events.emit.callCount.should.equal(2);
            events.emit.alwaysCalledWith('command#foobar');
        });
        it('should not emit error on uhandled command from mention', () => {
            parseShortCommand.returns({
                command: 'foobar',
                mention: true
            });
            events.emit.returns(false);
            commands.parseCommands({
                raw: '!i am a little text short and stout'
            }, callbackSpy);
            clocks.tick(0);
            events.emit.calledWith('command#ERROR').should.be.false;
        });
        it('should emit error on uhandled command', () => {
            parseShortCommand.returns({
                command: 'foobar'
            });
            events.emit.onFirstCall().returns(false)
                .onSecondCall().returns(true);
            commands.parseCommands({
                raw: '!i am a little text short and stout'
            }, callbackSpy);
            clocks.tick(0);
            events.emit.callCount.should.equal(2);
            events.emit.calledWith('command#ERROR').should.be.true;
            events.emit.calledWith('error').should.be.false;
        });
        it('should emit global error on uhandled command error', () => {
            parseShortCommand.returns({
                command: 'foobar'
            });
            events.emit.returns(false);
            commands.parseCommands({
                raw: '!i am a little text short and stout'
            }, callbackSpy);
            clocks.tick(0);
            events.emit.callCount.should.equal(3);
            events.emit.calledWith('command#ERROR').should.be.true;
            events.emit.calledWith('error').should.be.true;
        });
        after(() => {
            parseShortCommand.restore();
            parseMentionCommand.restore();
            clocks.restore();
            commands.internals.events = null;
        });
    });
});
