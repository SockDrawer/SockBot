'use strict';
/*globals describe, it, before, after*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon');
chai.should();
const expect = chai.expect;

// The thing we're testing
const config = require('../config'),
    fs = require('fs');

describe('config', () => {
    describe('exports', () => {
        const fns = [],
            objs = ['internals', 'stubs', 'config'],
            vals = [];
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
                it(val, () => config.should.have.key(val));
            });
        });
        it('should export only expected keys', () => {
            config.should.have.all.keys(fns.concat(objs, vals));
        });
    });
    describe('internals', () => {
        const fns = ['readFile'],
            objs = [],
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
    describe('documentation stubs', () => {
        const stubs = config.stubs;
        Object.keys(stubs).forEach((stub) => it('should be a documentation stub: ' + stub, () => {
            stubs[stub](); // just getting code coverage on docstubs
        }));
    });
    describe('readFile()', () => {
        const readFile = config.internals.readFile;
        before(() => sinon.stub(fs, 'readFile'));
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
        after(() => fs.readFile.restore());
    });
});
