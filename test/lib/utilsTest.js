'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.use(require('chai-string'));
chai.should();
const expect = chai.expect;

const sinon = require('sinon');
require('sinon-as-promised');

const utils = require('../../lib/utils');

describe('lib/utils', () => {
    describe('exports', () => {
        const fns = ['logExtended', 'cloneData', 'mergeInner', 'mergeObjects', 'mapGet', 'mapSet',
                'parseJSON', 'iterate', 'htmlToRaw'
            ],
            objs = [],
            vals = ['storage'];

        describe('should export expected functions:', () => {
            fns.forEach((fn) => {
                it(`${fn}()`, () => expect(utils[fn]).to.be.a('function'));
            });
        });
        describe('should export expected objects', () => {
            objs.forEach((obj) => {
                it(obj, () => expect(utils[obj]).to.be.a('object'));
            });
        });
        describe('should export expected values', () => {
            vals.forEach((val) => {
                it(val, () => utils.should.have.any.key(val));
            });
        });
        it('should export only expected keys', () => {
            utils.should.have.all.keys(fns.concat(objs, vals));
        });
    });
    describe('htmlToRaw()', () => {
        const tests = [
            ['div tag', '<div>content</div>', 'content'],
            ['div tag missing close tag', '<div>content', 'content'],
            ['div tag missing open tag', 'content</div>', 'content'],
            ['blockquote tag', '<blockquote>content</blockquote>', ''],
            ['blockquote tag missing close tag', '<blockquote>content', ''],
            ['blockquote tag missing open tag', 'content</blockquote>', 'content'],
            ['code tag', '<code>content</code>', ''],
            ['code tag missing close tag', '<code>content', ''],
            ['code tag missing open tag', 'content</code>', 'content']
        ];
        tests.forEach((test) => {
            const description = test[0],
                content = test[1],
                expected = test[2];
            it(description, () => {
                const actual = utils.htmlToRaw(content);
                expect(actual).to.equal(expected);
            });
        });
    });
    describe('iterate()', () => {
        it('should resolve on empty input', () => {
            return utils.iterate([]).should.eventually.resolve;
        });
        it('should resolve on null input', () => {
            return utils.iterate(null).should.eventually.resolve;
        });
        it('should pass value to iterator', () => {
            const spy = sinon.stub().resolves();
            const value = Math.random();
            return utils.iterate([value], spy).then(() => {
                expect(spy.calledWith(value)).to.equal(true);
            });
        });
        it('should stop iteration on reject', () => {
            const spy = sinon.stub().resolves();
            spy.onCall(2).rejects('bad');
            return utils.iterate([0, 1, 2, 3, 4, 5], spy)
                .catch(() => true)
                .then(() => {
                    expect(spy.callCount).to.equal(3);
                });
        });
        it('should reject when iteration function rejects', () => {
            const spy = sinon.stub().rejects('bad');
            return utils.iterate([0], spy).should.eventually.reject;
        });
    });
    describe('parseJSON()', () => {
        describe('argument is required', () => {
            it('should throw when no input provided', () => {
                expect(() => utils.parseJSON()).to.throw('[[invalid-argument:required]]');
            });
            it('should throw when undefined input provided', () => {
                expect(() => utils.parseJSON(undefined)).to.throw('[[invalid-argument:required]]');
            });
            it('should throw when null input provided', () => {
                expect(() => utils.parseJSON(null)).to.throw('[[invalid-argument:required]]');
            });
            it('should throw when zero input provided', () => {
                expect(() => utils.parseJSON(0)).to.throw('[[invalid-argument:required]]');
            });
            it('should throw when empty string input provided', () => {
                expect(() => utils.parseJSON('')).to.throw('[[invalid-argument:required]]');
            });
            it('should throw when false input provided', () => {
                expect(() => utils.parseJSON(false)).to.throw('[[invalid-argument:required]]');
            });
            it('should throw when NaN input provided', () => {
                expect(() => utils.parseJSON(NaN)).to.throw('[[invalid-argument:required]]');
            });
        });
        describe('parsed object test', () => {
            it('should reject Number', () => {
                expect(() => utils.parseJSON('5')).to
                    .throw('[[invalid-argument:expected object but received number]]');
            });
            it('should reject String', () => {
                expect(() => utils.parseJSON('"foo"')).to
                    .throw('[[invalid-argument:expected object but received string]]');
            });
            it('should reject Boolean', () => {
                expect(() => utils.parseJSON('true')).to
                    .throw('[[invalid-argument:expected object but received boolean]]');
            });
            it('should reject null', () => {
                expect(() => utils.parseJSON('null')).to
                    .throw('[[invalid-argument:expected object but received null]]');
            });
            it('should accept object', () => {
                expect(() => utils.parseJSON('{}')).to.not.throw();
            });
            it('should accept array', () => {
                expect(() => utils.parseJSON('[]')).to.not.throw();
            });
        });
        it('should reject invalid JSON', () => {
            let error = null;
            try {
                utils.parseJSON('"unclosed string');
            } catch (err) {
                error = err.message;
            }
            error.should.startWith('[[invalid-json:Unexpected end of ');
        });
        it('should parse input correctly', () => {
            const input = '[{"alpha":true,"beta":{"gamma":"false"}},5.9,{}]';
            const expected = [{
                alpha: true,
                beta: {
                    gamma: 'false'
                }
            }, 5.9, {}];
            utils.parseJSON(input).should.deep.equal(expected);
        });
        it('should accept valid object', () => {
            const expected = {
                alpha: true,
                beta: {
                    gamma: 'false'
                }
            };
            utils.parseJSON(expected).should.equal(expected);
        });
    });
    describe('mapGet()', () => {
        it('should default value for unstored object', () => {
            const obj = new Object();
            expect(utils.storage.get(obj)).to.equal(undefined);
            utils.mapGet(obj).should.eql({});
        });
        it('should return stored object', () => {
            const obj = new Object();
            const expected = new Object();
            utils.storage.set(obj, expected);
            expect(utils.storage.get(obj)).to.equal(expected);
        });
        it('should default value for unstored object key', () => {
            const obj = new Object();
            const key = Math.random();
            expect(utils.storage.get(obj)).to.equal(undefined);
            expect(utils.mapGet(obj, key)).to.equal(undefined);
        });
        it('should return stored object key', () => {
            const obj = new Object(),
                key = Math.random(),
                expected = Math.random(),
                value = {};
            value[key] = expected;
            utils.storage.set(obj, value);
            expect(utils.mapGet(obj, key)).to.equal(expected);
        });
    });
    describe('mapSet()', () => {
        it('should generate stored object on set', () => {
            const obj = new Object(),
                key = Math.random(),
                value = Math.random(),
                expected = {};
            expected[key] = value;
            expect(utils.storage.get(obj)).to.equal(undefined);
            utils.mapSet(obj, key, value);
            expect(utils.storage.get(obj)).to.deep.equal(expected);
        });
        it('should set provided object on set', () => {
            const obj = new Object(),
                key = Math.random(),
                value = Math.random(),
                expected = {};
            expected[key] = value;
            expect(utils.storage.get(obj)).to.equal(undefined);
            utils.mapSet(obj, expected);
            expect(utils.storage.get(obj)).to.equal(expected);
        });
        it('should add key to existing object', () => {
            const obj = new Object(),
                key = Math.random(),
                value = Math.random(),
                expected = {
                    foo: 'bar'
                };
            expected[key] = value;
            utils.storage.set(obj, {
                foo: 'bar'
            });
            utils.mapSet(obj, expected);
            expect(utils.storage.get(obj)).to.equal(expected);
        });
    });
    describe('cloneData()', () => {
        const cloneData = utils.cloneData;
        it('should throw on attempt to clone undefined', () => expect(cloneData(undefined)).to.equal(undefined));
        describe('simple data structures tests', () => {
            [null, false, true, 0, 1, -1, 1e100, Math.PI, Math.E, '', 'a', 'a longer string'].forEach((test) => {
                it(`should clone to self: ${JSON.stringify(test)}`, () => expect(cloneData(test)).to.equal(test));
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
                    alpha: 1,
                    beta: 2
                },
                result = cloneData(orig);
            result.should.deep.equal(orig);
            result.gamma = 3;
            result.should.not.deep.equal(orig);
        });
    });
    describe('mergeInner()', () => {
        const mergeInner = utils.mergeInner;
        describe('should reject non object base', () => {
            [undefined, null, false, 0, '', []].forEach((base) => {
                it(`: ${JSON.stringify(base)}`, () => expect(() => mergeInner(base)).to.throw('base must be object'));
            });
        });
        describe('should reject non object mixin', () => {
            [undefined, null, false, 0, '', []].forEach((mixin) => {
                it(`: ${JSON.stringify(mixin)}`, () => {
                    expect(() => mergeInner({}, mixin)).to.throw('mixin must be object');
                });
            });
        });
        it('should accept empty base object', () => {
            const mixin = {
                    alpha: 1
                },
                base = {};
            expect(() => mergeInner(base, mixin)).to.not.throw();
            base.should.deep.equal(mixin);
        });
        it('should accept null mixin key value', () => {
            const mixin = {
                    alpha: null
                },
                base = {};
            expect(() => mergeInner(base, mixin)).to.not.throw();
            base.should.deep.equal(mixin);
        });
        it('should accept empty mixin object', () => {
            const base = {
                    alpha: 1
                },
                mixin = {};
            expect(() => mergeInner(base, mixin)).to.not.throw();
            base.should.deep.equal(base);
        });
        it('should accept merge missing base object', () => {
            const mixin = {
                    alpha: {
                        beta: 1
                    }
                },
                base = {};
            expect(() => mergeInner(base, mixin)).to.not.throw();
            base.should.deep.equal(mixin);
        });
        it('should merge objects with no overlap', () => {
            const base = {
                    alpha: 1
                },
                mixin = {
                    beta: 2
                },
                expected = {
                    alpha: 1,
                    beta: 2
                };
            mergeInner(base, mixin);
            base.should.deep.equal(expected);
        });
        it('should merge objects with overlap', () => {
            const base = {
                    alpha: 1,
                    beta: 3
                },
                mixin = {
                    beta: 2,
                    gamma: 3
                },
                expected = {
                    alpha: 1,
                    beta: 2,
                    gamma: 3
                };
            mergeInner(base, mixin);
            base.should.deep.equal(expected);
        });
        describe('array concatenation/merging tests', () => {
            it('should concatenate arrays', () => {
                const base = {
                        alpha: [1]
                    },
                    mixin = {
                        alpha: [2]
                    },
                    expected = {
                        alpha: [1, 2]
                    };
                mergeInner(base, mixin);
                base.should.deep.equal(expected);
            });
            it('should merge arrays', () => {
                const base = {
                        alpha: [1]
                    },
                    mixin = {
                        alpha: [2]
                    },
                    expected = {
                        alpha: [2]
                    };
                mergeInner(base, mixin, true);
                base.should.deep.equal(expected);
            });
            it('should not overwrite array', () => {
                const base = {
                        alpha: [1]
                    },
                    mixin = {
                        beta: [2]
                    },
                    expected = {
                        alpha: [1],
                        beta: [2]
                    };
                mergeInner(base, mixin);
                base.should.deep.equal(expected);
            });
            it('should not overwrite array', () => {
                const base = {
                        alpha: [1]
                    },
                    mixin = {
                        beta: [2]
                    },
                    expected = {
                        alpha: [1],
                        beta: [2]
                    };
                mergeInner(base, mixin, true);
                base.should.deep.equal(expected);
            });
            it('should concatenate arrays recursively', () => {
                const base = {
                        alpha: [1],
                        beta: {
                            gamma: [1]
                        }
                    },
                    mixin = {
                        alpha: [2],
                        beta: {
                            gamma: [2]
                        }
                    },
                    expected = {
                        alpha: [1, 2],
                        beta: {
                            gamma: [1, 2]
                        }
                    };
                mergeInner(base, mixin);
                base.should.deep.equal(expected);
            });
            it('should merge arrays recursively', () => {
                const base = {
                        alpha: [1],
                        beta: {
                            gamma: [1]
                        }
                    },
                    mixin = {
                        alpha: [2],
                        beta: {
                            gamma: [2]
                        }
                    },
                    expected = {
                        alpha: [2],
                        beta: {
                            gamma: [2]
                        }
                    };
                mergeInner(base, mixin, true);
                base.should.deep.equal(expected);
            });
            it('should overwrite arrays recursively', () => {
                const base = {
                        alpha: [1],
                        beta: {
                            gamma: [1]
                        }
                    },
                    mixin = {
                        delta: [2],
                        beta: {
                            gamma: [2]
                        }
                    },
                    expected = {
                        alpha: [1],
                        beta: {
                            gamma: [1, 2]
                        },
                        delta: [2]
                    };
                mergeInner(base, mixin, false);
                base.should.deep.equal(expected);
            });
        });
        it('should replace non-array with array', () => {
            const base = {
                    alpha: {}
                },
                mixin = {
                    alpha: [2]
                },
                expected = {
                    alpha: [2]
                };
            mergeInner(base, mixin);
            base.should.deep.equal(expected);
        });
        it('should replace array with non-array', () => {
            const base = {
                    alpha: [1]
                },
                mixin = {
                    alpha: {}
                },
                expected = {
                    alpha: {}
                };
            mergeInner(base, mixin);
            base.should.deep.equal(expected);
        });
        it('should merge inner objects', () => {
            const base = {
                    alpha: {
                        beta: [1]
                    }
                },
                mixin = {
                    alpha: {
                        gamma: false
                    }
                },
                expected = {
                    alpha: {
                        beta: [1],
                        gamma: false
                    }
                };
            mergeInner(base, mixin);
            base.should.deep.equal(expected);
        });
        it('should not merge prototype', () => {
            const base = {
                    alpha: null
                },
                expected = {
                    alpha: null
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
        it('should merge two objects and concatenate arrays', () => {
            const base = {
                    foo: [1]
                },
                mixin = {
                    foo: [2]
                },
                expected = {
                    foo: [1, 2]
                };
            mergeObjects(base, mixin).should.deep.equal(expected);
        });
        it('should merge two objects and merge arrays', () => {
            const base = {
                    foo: [1]
                },
                mixin = {
                    foo: [2]
                },
                expected = {
                    foo: [2]
                };
            mergeObjects(true, base, mixin).should.deep.equal(expected);
        });
    });
    describe('logExtended()', () => {
        it('should not throw error with zero params', () => {
            expect(() => utils.logExtended()).to.not.throw();
        });
        it('should not throw error with one param', () => {
            expect(() => utils.logExtended('level')).to.not.throw();
        });
        it('should not throw error with two params', () => {
            expect(() => utils.logExtended('level', 'message')).to.not.throw();
        });
        it('should not throw error with three params', () => {
            expect(() => utils.logExtended('level', 'message', 'data')).to.not.throw();
        });
    });
});
