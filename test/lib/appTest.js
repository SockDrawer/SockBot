'use strict';
/*globals describe, it, before, beforeEach, after, afterEach*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon');
chai.should();
const child_process = require('child_process');
const expect = chai.expect;

// The thing we're testing
const app = require('../../lib/app');

describe('app.js', () => {
    let hostProcess;
    beforeEach(() => {
        sinon.stub(child_process, 'spawn');
        hostProcess = {
            execPath: '/foo/bar/node',
            execArgv: [],
            argv: ['node', './lib/app.js']
        };
    });
    afterEach(() => child_process.spawn.restore());
    describe('respawn', () => {
        it('should call child_process.spawn', () => {
            app.respawn('./foo', [], hostProcess);
            child_process.spawn.called.should.equal(true);
        });
        it('should respect process.execPath', () => {
            const path = '/quuux/' + Math.random();
            hostProcess.execPath = path;
            app.respawn('./foo', [], hostProcess);
            child_process.spawn.calledWith(path).should.equal(true);
        });
    });
});
