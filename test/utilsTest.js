'use strict';
/*globals describe, it*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon');
chai.should();
const expect = chai.expect;

// The thing we're testing
const utils = require('../utils');

describe('utils', () => {
    describe('exports', () => {
        const fns = ['uuid', 'log', 'warn', 'error', 'addTimestamp', 'mergeObjects', 'mergeInner', 'cloneData'],
            objs = [],
            vals = [];
        describe('should export expected functions:', () => {
            fns.forEach((fn) => {
                it(fn + '()', () => expect(utils[fn]).to.be.a('function'));
            });
        });
        describe('should export expected objects', () => {
            objs.forEach((obj) => {
                it(obj, () => expect(utils[obj]).to.be.a('object'));
            });
        });
        describe('should export expected values', () => {
            vals.forEach((val) => {
                it(val, () => utils.should.have.key(val));
            });
        });
        it('should export only expected keys', () => {
            utils.should.have.all.keys(fns.concat(objs, vals));
        });
    });
    describe('uuid()', () => {
        it('should generate correct format', () => {
            const uuid = utils.uuid();
            uuid.should.match(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[\da-f]{4}-[\da-f]{12}$/);
        });
    });
    describe('addTimestamp()', () => {
        it('should add correct format time format', () => {
            const message = utils.addTimestamp('message');
            message.should.match(/^\[\d{2}:\d{2}:\d{2}\] message$/);
        });
        describe('should accept any object', () => {
            [4, 9.2, false, undefined, null, [1, 2], {
                a: 5
            }, {
                a: [1, {
                    b: 5
                }]
            }].forEach((test) => {
                const result = utils.addTimestamp(test),
                    expected = JSON.stringify(test, null, '    ');
                it('should accept input: ' + test, () => result.should.contain(expected));
            });
        });
    });
    describe('log()', () => {
        it('should call console.log()', () => {
            /* eslint-disable no-console */
            const log = console.log;
            try {
                console.log = sinon.spy();
                utils.log('message');
                console.log.called.should.be.true;
                console.log.lastCall.args.should.have.length(1);
                console.log.lastCall.args[0].should.match(/^\[\d{2}:\d{2}:\d{2}\] message$/);
            } finally {
                console.log = log;
            }
            /* eslint-enable no-console */
        });
    });
    describe('warn()', () => {
        it('should call console.warn()', () => {
            /* eslint-disable no-console */
            const warn = console.warn;
            try {
                console.warn = sinon.spy();
                utils.warn('message');
                console.warn.called.should.be.true;
                console.warn.lastCall.args.should.have.length(1);
                console.warn.lastCall.args[0].should.match(/^\[\d{2}:\d{2}:\d{2}\] message$/);
            } finally {
                console.warn = warn;
            }
            /* eslint-enable no-console */
        });
    });
    describe('error()', () => {
        it('should call console.error()', () => {
            /* eslint-disable no-console */
            const error = console.error;
            try {
                console.error = sinon.spy();
                utils.error('message');
                console.error.called.should.be.true;
                console.error.lastCall.args.should.have.length(1);
                console.error.lastCall.args[0].should.match(/^\[\d{2}:\d{2}:\d{2}\] message$/);
            } finally {
                console.error = error;
            }
            /* eslint-enable no-console */
        });
    });
    describe('cloneData()', () => {
        const cloneData = utils.cloneData;
        it('should throw on attempt to clone undefined', () => expect(cloneData(undefined)).to.equal(undefined));
        describe('simple data structures tests', () => {
            [null, false, true, 0, 1, -1, 1e100, Math.PI, Math.E, '', 'a', 'a longer string'].forEach((test) => {
                it('should clone to self: ' + JSON.stringify(test), () => expect(cloneData(test)).to.equal(test));
            });
        });
        it('should clone array', () => {
            const orig = [null, false, true, 0, 1, -1, 1e100, Math.PI, Math.E, '', 'a', 'a longer string'],
                result = cloneData(orig);
            result.should.deep.equal(orig);
            result.shift();
            result.should.not.deep.equal(orig);
        });
        it('should clone object', () => {
            const orig = {
                    a: 1,
                    b: 2
                },
                result = cloneData(orig);
            result.should.deep.equal(orig);
            result.c = 3;
            result.should.not.deep.equal(orig);
        });
    });
    describe('mergeInner()', () => {
        const mergeInner = utils.mergeInner;
        describe('should reject non object base', () => {
            [undefined, null, false, 0, '', []].forEach((base) => {
                it(': ' + JSON.stringify(base), () => expect(() => mergeInner(base)).to.throw('base must be object'));
            });
        });
        describe('should reject non object mixin', () => {
            [undefined, null, false, 0, '', []].forEach((mixin) => {
                it(': ' + JSON.stringify(mixin), () => {
                    expect(() => mergeInner({}, mixin)).to.throw('mixin must be object');
                });
            });
        });
        it('should accept empty base object', () => {
            const mixin = {
                    a: 1
                },
                base = {};
            expect(() => mergeInner(base, mixin)).to.not.throw();
            base.should.deep.equal(mixin);
        });
        it('should accept empty mixin object', () => {
            const base = {
                    a: 1
                },
                mixin = {};
            expect(() => mergeInner(base, mixin)).to.not.throw();
            base.should.deep.equal(base);
        });
        it('should accept merge missing base object', () => {
            const mixin = {
                    a: {
                        b: 1
                    }
                },
                base = {};
            expect(() => mergeInner(base, mixin)).to.not.throw();
            base.should.deep.equal(mixin);
        });
        it('should merge objects with no overlap', () => {
            const base = {
                    a: 1
                },
                mixin = {
                    b: 2
                },
                expected = {
                    a: 1,
                    b: 2
                };
            mergeInner(base, mixin);
            base.should.deep.equal(expected);
        });
        it('should merge objects with overlap', () => {
            const base = {
                    a: 1,
                    b: 3
                },
                mixin = {
                    b: 2,
                    c: 3
                },
                expected = {
                    a: 1,
                    b: 2,
                    c: 3
                };
            mergeInner(base, mixin);
            base.should.deep.equal(expected);
        });
        it('should replace array with mixin', () => {
            const base = {
                    a: [1]
                },
                mixin = {
                    a: [2]
                },
                expected = {
                    a: [2]
                };
            mergeInner(base, mixin);
            base.should.deep.equal(expected);
        });
        it('should merge inner objects', () => {
            const base = {
                    a: {
                        b: [1]
                    }
                },
                mixin = {
                    a: {
                        c: false
                    }
                },
                expected = {
                    a: {
                        b: [1],
                        c: false
                    }
                };
            mergeInner(base, mixin);
            base.should.deep.equal(expected);
        });
        it('should not merge prototype', () => {
            const base = {
                    a: null
                },
                expected = {
                    a: null
                };
            mergeInner(base, /object/);
            base.should.deep.equal(expected);
        });
    });
    describe('mergeObjects()', () => {
        const mergeObjects = utils.mergeObjects;
        it('should return empty on object when merging undefined', () => {
            mergeObjects(undefined).should.deep.equal({});
        });
        it('should merge two objects', () => {
            const base = {
                    foo: 1
                },
                mixin = {
                    bar: false
                },
                expected = {
                    foo: 1,
                    bar: false
                };
            mergeObjects(base, mixin).should.deep.equal(expected);
        });
        it('should merge three objects', () => {
            const base = {
                    foo: 1
                },
                mixin = {
                    bar: false
                },
                mixin2 = {
                    baz: 'quux'
                },
                expected = {
                    foo: 1,
                    bar: false,
                    baz: 'quux'
                };
            mergeObjects(base, mixin, mixin2).should.deep.equal(expected);
        });
    });
});
