'use strict';
/*globals describe, it*/

const chai = require('chai'),
    sinon = require('sinon');
chai.should();
const expect = chai.expect;

const echo = require('../../plugins/echo');
describe('echo', () => {
    it('should export prepare()', () => {
        expect(echo.prepare).to.be.a('function');
    });
    it('should export start()', () => {
        expect(echo.start).to.be.a('function');
    });
    it('should export stop()', () => {
        expect(echo.stop).to.be.a('function');
    });
    it('should export handler()', () => {
        expect(echo.handler).to.be.a('function');
    });
    it('should have start() as a stub function', () => {
        expect(echo.start).to.not.throw();
    });
    it('should have stop() as a stub function', () => {
        expect(echo.stop).to.not.throw();
    });
    describe('prepare()', () => {
        it('should register notification listener for `mentioned`', () => {
            const spy = sinon.spy();
            echo.prepare(undefined, undefined, {
                onNotification: spy,
                registerHelp: sinon.spy()
            }, undefined);
            spy.calledWith('mentioned', echo.handler).should.be.true;
        });
        it('should register notification listener for `replied`', () => {
            const spy = sinon.spy();
            echo.prepare(undefined, undefined, {
                onNotification: spy,
                registerHelp: sinon.spy()
            }, undefined);
            spy.calledWith('replied', echo.handler).should.be.true;
        });
        it('should register notification listener for `private_message`', () => {
            const spy = sinon.spy();
            echo.prepare(undefined, undefined, {
                onNotification: spy,
                registerHelp: sinon.spy()
            }, undefined);
            spy.calledWith('private_message', echo.handler).should.be.true;
        });
        it('should register extended help', () => {
            const evts = {
                onNotification: sinon.spy(),
                registerHelp: sinon.spy()
            };
            echo.prepare({}, {}, evts);
            evts.registerHelp.calledWith('echo', echo.extendedHelp).should.be.true;
            expect(evts.registerHelp.firstCall.args[2]).to.be.a('function');
            expect(evts.registerHelp.firstCall.args[2]()).to.equal(0);
        });
    });
    describe('handler()', () => {
        it('should create post from clean data', () => {
            const spy = sinon.stub();
            spy.yields(null);
            echo.prepare(undefined, undefined, {
                onNotification: () => 0,
                registerHelp: sinon.spy()
            }, {
                createPost: spy
            });
            echo.handler(undefined, {
                id: 3.1415
            }, {
                id: 4324,
                cleaned: 'this is a post!'
            });
            spy.calledWith(3.1415, 4324, 'this is a post!').should.be.true;
        });
    });
});
