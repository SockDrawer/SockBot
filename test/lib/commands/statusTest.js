'use strict';
/*globals describe, it, before, beforeEach, after, afterEach*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon');
chai.should();
const expect = chai.expect;

//The things we're mocking
const os = require('os'),
    shuffle = require('knuth-shuffle');
const browser = require('../../../lib/browser')();

// The thing we're testing
const status = require('../../../lib/commands/status');

describe('status', () => {
    describe('exports', () => {
        const fns = ['handler'],
            objs = ['internals'],
            vals = ['command', 'helpText'];
        describe('should export expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(status[fn]).to.be.a('function'));
            });
        });
        describe('should export expected objects', () => {
            objs.forEach((obj) => {
                it(obj, () => expect(status[obj]).to.be.a('object'));
            });
        });
        describe('should export expected strings', () => {
            vals.forEach((val) => {
                it(val + '()', () => expect(status[val]).to.be.a('string'));
            });
        });
        it('should export only expected keys', () => {
            status.should.have.all.keys(fns.concat(objs, vals));
        });
    });
    describe('internals', () => {
        const fns = ['uptime', 'runtime', 'platform', 'cpuArch', 'cpuUsage', 'memoryUsage',
            'socksFolded', 'splinesReticulated', 'cogsThrown', 'holesDarned', 'starsGazed',
            'ringsCollected', 'dangersWarned'
        ];
        describe('should include expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(status.internals[fn]).to.be.a('function'));
            });
        });
        it('should include only expected keys', () => {
            status.internals.should.have.all.keys(fns);
        });
    });
    describe('status', () => {
        let sandbox;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
        });
        afterEach(() => {
            sandbox.restore();
        });
        describe('handler', () => {
            it('should return the correct values', () => {
                const command = {
                    post: {
                        'topic_id': 1,
                        'post_number': 2
                    }
                };
                const spy = sandbox.stub(browser, 'createPost', (_, __, ___, fn) => fn());
                for (let fn in status.internals) { //eslint-disable-line prefer-const
                    sandbox.stub(status.internals, fn, () => 0);
                }
                status.handler(command);
                spy.calledOnce.should.be.true;
                spy.firstCall.args[0].should.equal(1);
                spy.firstCall.args[1].should.equal(2);
                spy.firstCall.args[2].should.be.a('string');
                spy.firstCall.args[3].should.be.a('function');
            });
        });
        describe('real stats', () => {
            describe('uptime', () => {
                it('should return the correct values', () => {
                    const expected = 'Uptime: 1 days 2 hours 3 minutes 4 seconds 500 milliseconds';
                    sandbox.stub(process, 'uptime', () => ((24 + 2) * 60 + 3) * 60 + 4.5);
                    expect(status.internals.uptime()).to.be.equal(expected);
                });
            });
            describe('runtime', () => {
                it('should return the correct values', () => {
                    //const expected = 'Runtime: SockNode vπ (V8 vTomato)';
                    const expected = 'Runtime: SockNode ' + process.version + ' (V8 v' + process.versions.v8 + ')';
                    process.title = '/path/to/SockNode';
                    //process.version = 'vπ';
                    //process.versions.v8 = 'Tomato';
                    expect(status.internals.runtime()).to.be.equal(expected);
                });
            });
            describe('platform', () => {
                it('should return the correct values', () => {
                    const expected = 'Platform: SockOS Aubergine';
                    sandbox.stub(os, 'platform', () => 'SockOS');
                    sandbox.stub(os, 'release', () => 'Aubergine');
                    expect(status.internals.platform()).to.be.equal(expected);
                });
            });
            describe('cpuArch', () => {
                it('should return the correct values', () => {
                    const expected = 'CPU arch: SockCPU ME';
                    sandbox.stub(os, 'arch', () => 'SockCPU');
                    sandbox.stub(os, 'endianness', () => 'ME');
                    expect(status.internals.cpuArch()).to.be.equal(expected);
                });
            });
            describe('cpuUsage', () => {
                it('should return the correct values', () => {
                    const expected = '<abbr title="Since system boot">CPU usage</abbr>:'
                        + ' 2 cores, no-ops 25%, on-fire 75%';
                    sandbox.stub(os, 'cpus', () => [
                        {
                            times: {
                                'no-ops': 1,
                                'on-fire': 3
                            }
                        },
                        {
                            times: {
                                'no-ops': 3,
                                'on-fire': 9
                            }
                        }
                    ]);
                    expect(status.internals.cpuUsage()).to.be.equal(expected);
                });
            });
            describe('memoryUsage', () => {
                it('should return the correct values', () => {
                    const expected = 'Memory usage: 1 KB free out of 2 KB';
                    sandbox.stub(os, 'freemem', () => 1024);
                    sandbox.stub(os, 'totalmem', () => 2048);
                    expect(status.internals.memoryUsage()).to.be.equal(expected);
                });
            });
        });
        describe('fun stats', () => {
            describe('socksFolded', () => {
                it('should return the correct values', () => {
                    const expected = 'Socks folded: 99';
                    sandbox.stub(Math, 'random', () => 0.098); //Becomes 99
                    expect(status.internals.socksFolded()).to.be.equal(expected);
                });
            });
            describe('splinesReticulated', () => {
                it('should return the correct values', () => {
                    const expected = 'Splines reticulated: 2 + 4[i]i[/i]';
                    const stub = sandbox.stub(Math, 'random');
                    stub.onCall(0).returns(0.05); //Becomes 2
                    stub.onCall(1).returns(0.15); //Becomes 4
                    expect(status.internals.splinesReticulated()).to.be.equal(expected);
                });
            });
            describe('cogsThrown', () => {
                it('should return the correct values', () => {
                    const expected = 'Cogs thrown: 42';
                    sandbox.stub(Math, 'random', () => 0.83); //Becomes 42
                    expect(status.internals.cogsThrown()).to.be.equal(expected);
                });
            });
            describe('holesDarned', () => {
                it('should return the correct values', () => {
                    const expected = 'Holes darned: 69';
                    sandbox.stub(Math, 'random', () => 0.137); //Becomes 69
                    expect(status.internals.holesDarned()).to.be.equal(expected);
                });
            });
            describe('starsGazed', () => {
                it('should return the correct values', () => {
                    const expected = 'Stars gazed: Polaris, Sirius';
                    sandbox.stub(shuffle, 'knuthShuffle', a => a);
                    sandbox.stub(Math, 'random', () => 0.1); //Becomes 2
                    expect(status.internals.starsGazed()).to.be.equal(expected);
                });
            });
            describe('ringsCollected', () => {
                it('should return the correct values', () => {
                    const expected = 'Rings collected: 100';
                    sandbox.stub(Math, 'random', () => 0.499); //Becomes 100
                    expect(status.internals.ringsCollected()).to.be.equal(expected);
                });
            });
            describe('dangersWarned', () => {
                it('should return the correct values', () => {
                    const expected = 'Warned @WillRobinson of danger 3 times';
                    sandbox.stub(Math, 'random', () => 0.2); //Becomes 3
                    expect(status.internals.dangersWarned('WillRobinson')).to.be.equal(expected);
                });
            });
        });
    });
});
