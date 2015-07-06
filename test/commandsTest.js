'use strict';
/*globals describe, it, before*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon');
chai.should();
const expect = chai.expect;

// The thing we're testing
const commands = require('../commands'),
    config = require('../config');
describe('browser', () => {
    describe('exports', () => {
        const fns = ['prepareParser'],
            objs = ['internals', 'stubs'],
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
        const fns = ['parseMentionCommand', 'parseShortCommand'],
            objs = ['mention'],
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
    describe('documentation stubs', () => {
        const stubs = commands.stubs;
        Object.keys(stubs).forEach((stub) => {
            it(stub + '() should be a stub function', () => stubs[stub]());
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
            commands.prepareParser(done);
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
            it('should set args correctly', () => {
                parseMentionCommand('@foobar help arg1 arg2').args.should.deep.equal(['arg1', 'arg2']);
            });
            it('should set mention value', () => {
                parseMentionCommand('@foobar help arg1 arg2').mention.should.equal('@foobar');
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
        it('should match bare command', () => {
            parseMentionCommand('@foobar help').command.should.equal('help');
        });
        it('should match command with args', () => {
            const cmd = parseMentionCommand('@foobar help arg1 arg2');
            cmd.command.should.equal('help');
            cmd.args.should.deep.equal(['arg1', 'arg2']);
        });
    });
    describe('prepareParser()', () => {
        const prepareParser = commands.prepareParser;
        before(() => {
            config.core.username = 'foo';
        });
        it('should call callback on completion', () => {
            const spy = sinon.spy();
            prepareParser(spy);
            spy.called.should.be.true;
            spy.lastCall.args.should.deep.equal([null]);
        });
        it('should produce expected mentionCommand regexp', () => {
            prepareParser(() => 0);
            commands.internals.mention.toString().should.equal('/^@foo\\s\\S{3,}(\\s|$)/i');
        });
    });
});
