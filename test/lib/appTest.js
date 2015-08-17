'use strict';
/*globals describe, it, before, beforeEach, after, afterEach*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon');
chai.should();
const spawner = require('child_process');

// The thing we're testing
const app = require('../../lib/app');

describe('app.js', () => {
    let hostProcess, cwd;
    beforeEach(() => {
        sinon.stub(spawner, 'spawn');
        cwd = '/foo/bar/baz';
        hostProcess = {
            execPath: '/foo/bar/node',
            execArgv: [],
            argv: ['node', './lib/app.js'],
            cwd: () => cwd
        };
    });
    afterEach(() => spawner.spawn.restore());
    describe('respawn', () => {
        it('should call child_process.spawn', () => {
            app.respawn('./foo', [], hostProcess);
            spawner.spawn.called.should.equal(true);
        });
        it('should respect process.execPath', () => {
            const path = '/quuux/' + Math.random();
            hostProcess.execPath = path;
            app.respawn('./foo', [], hostProcess);
            spawner.spawn.calledWith(path).should.equal(true);
        });
        it('should set spawned process cwd', () => {
            cwd += '/' + Math.random();
            app.respawn('./foo', [], hostProcess);
            const opts = spawner.spawn.firstCall.args[2];
            opts.cwd.should.equal(cwd);
        });
        it('should set stdio inherit', () => {
            app.respawn('./foo', [], hostProcess);
            const opts = spawner.spawn.firstCall.args[2];
            opts.stdio.should.equal('inherit');
        });
        describe('arguments', () => {
            it('should pass arguments as expected', () => {
                const scriptArg = Math.random(),
                    expected = ['--harmony', app.getFullPath('./foo/bar'), scriptArg];
                hostProcess.argv.push(scriptArg);
                app.respawn('./foo/bar', [], hostProcess);
                const args = spawner.spawn.firstCall.args[1];
                args.should.deep.equal(expected);
            });
            it('should add `--harmony` argument when no flags requested', () => {
                app.respawn('./foo/bar', [], hostProcess);
                const args = spawner.spawn.firstCall.args[1];
                args.should.contain('--harmony');
            });
            it('should add `--harmony` argument when flags ius falsey', () => {
                app.respawn('./foo/bar', undefined, hostProcess);
                const args = spawner.spawn.firstCall.args[1];
                args.should.contain('--harmony');
            });
            it('should pass script parameter argument in args', () => {
                const script = '/bar/foo' + Math.random();
                app.respawn(script, [], hostProcess);
                const args = spawner.spawn.firstCall.args[1];
                args.should.contain(app.getFullPath(script));
            });
            it('should pass argv arguments', () => {
                const arg1 = '' + Math.random(),
                    arg2 = '' + Math.random();
                hostProcess.argv.push(arg1);
                hostProcess.argv.push(arg2);
                app.respawn('./lib/cli', [], hostProcess);
                const args = spawner.spawn.firstCall.args[1];
                args.should.contain(arg1);
                args.should.contain(arg2);
            });
            it('should not add `--harmony` argument when flags do not include `--harmony`', () => {
                app.respawn('./foo/bar', ['--foo'], hostProcess);
                const args = spawner.spawn.firstCall.args[1];
                args.should.not.contain('--harmony');
            });
            it('should add `--foo` argument when flags include `--foo`', () => {
                app.respawn('./foo/bar', ['--foo'], hostProcess);
                const args = spawner.spawn.firstCall.args[1];
                args.should.contain('--foo');
            });
            it('should not add `--foo` when requested and already present', () => {
                const expected = ['--foo', app.getFullPath('./foo/bar')];
                hostProcess.execArgv.push('--foo');
                app.respawn('./foo/bar', ['--foo'], hostProcess);
                const args = spawner.spawn.firstCall.args[1];
                args.should.deep.equal(expected);
            });
        });
    });
});
