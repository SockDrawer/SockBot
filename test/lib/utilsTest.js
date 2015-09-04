'use strict';
/*globals describe, it, before, beforeEach, after, afterEach*/
/*eslint no-unused-expressions:0 */

const chai = require('chai'),
    sinon = require('sinon');
chai.should();
const expect = chai.expect;

// The thing we're testing
const utils = require('../../lib/utils'),
    config = require('../../lib/config');

describe('utils', () => {
    describe('exports', () => {
        const fns = ['uuid', 'log', 'warn', 'error', 'addTimestamp', 'mergeObjects', 'mergeInner', 'cloneData',
                'filterIgnored', 'filterIgnoredOnPost', 'filterIgnoredOnTopic'
            ],
            objs = ['internals'],
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
        describe('array concatenation/merging tests', () => {
            it('should concatenate arrays', () => {
                const base = {
                        a: [1]
                    },
                    mixin = {
                        a: [2]
                    },
                    expected = {
                        a: [1, 2]
                    };
                mergeInner(base, mixin);
                base.should.deep.equal(expected);
            });
            it('should merge arrays', () => {
                const base = {
                        a: [1]
                    },
                    mixin = {
                        a: [2]
                    },
                    expected = {
                        a: [2]
                    };
                mergeInner(base, mixin, true);
                base.should.deep.equal(expected);
            });
            it('should not overwrite array', () => {
                const base = {
                        a: [1]
                    },
                    mixin = {
                        b: [2]
                    },
                    expected = {
                        a: [1],
                        b: [2]
                    };
                mergeInner(base, mixin);
                base.should.deep.equal(expected);
            });
            it('should not overwrite array', () => {
                const base = {
                        a: [1]
                    },
                    mixin = {
                        b: [2]
                    },
                    expected = {
                        a: [1],
                        b: [2]
                    };
                mergeInner(base, mixin, true);
                base.should.deep.equal(expected);
            });
            it('should concatenate arrays recursively', () => {
                const base = {
                        a: [1],
                        b: {
                            c: [1]
                        }
                    },
                    mixin = {
                        a: [2],
                        b: {
                            c: [2]
                        }
                    },
                    expected = {
                        a: [1, 2],
                        b: {
                            c: [1, 2]
                        }
                    };
                mergeInner(base, mixin);
                base.should.deep.equal(expected);
            });
            it('should merge arrays recursively', () => {
                const base = {
                        a: [1],
                        b: {
                            c: [1]
                        }
                    },
                    mixin = {
                        a: [2],
                        b: {
                            c: [2]
                        }
                    },
                    expected = {
                        a: [2],
                        b: {
                            c: [2]
                        }
                    };
                mergeInner(base, mixin, true);
                base.should.deep.equal(expected);
            });
            it('should not overwrite arrays recursively', () => {
                const base = {
                        a: [1],
                        b: {
                            c: [1]
                        }
                    },
                    mixin = {
                        d: [2],
                        b: {
                            e: [2]
                        }
                    },
                    expected = {
                        a: [1],
                        b: {
                            c: [1],
                            e: [2]
                        },
                        d: [2]
                    };
                mergeInner(base, mixin);
                base.should.deep.equal(expected);
            });
            it('should not overwrite arrays recursively', () => {
                const base = {
                        a: [1],
                        b: {
                            c: [1]
                        }
                    },
                    mixin = {
                        d: [2],
                        b: {
                            e: [2]
                        }
                    },
                    expected = {
                        a: [1],
                        b: {
                            c: [1],
                            e: [2]
                        },
                        d: [2]
                    };
                mergeInner(base, mixin, true);
                base.should.deep.equal(expected);
            });
        });
        it('should replace non-array with array', () => {
            const base = {
                    a: {}
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
        it('should replace array with non-array', () => {
            const base = {
                    a: [1]
                },
                mixin = {
                    a: {}
                },
                expected = {
                    a: {}
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
    describe('message filters', () => {
        describe('filterIgnoredOnPost()', () => {
            const filterIgnoredOnPost = utils.filterIgnoredOnPost;
            let timers;
            before(() => timers = sinon.useFakeTimers());
            afterEach(() => utils.internals.cooldownTimers = {});
            after(() => timers.restore());
            describe('Basic trust levels', () => {
                it('should ignore TL0 user', () => {
                    const post = {
                            'trust_level': 0
                        },
                        spy = sinon.spy();
                    filterIgnoredOnPost(post, spy);
                    spy.called.should.be.false;
                    timers.tick(0);
                    spy.calledWith('ignore', 'Poster is TL0').should.be.true;
                });
                [1, 2, 3].forEach((level) =>
                    it('should accept TL' + level + ' user', () => {
                        const user = 'USER' + Math.ceil(1000 + Math.random() * 5000),
                            post = {
                                'trust_level': level,
                                username: user
                            },
                            spy = sinon.spy();
                        filterIgnoredOnPost(post, spy);
                        spy.called.should.be.false;
                        timers.tick(0);
                        spy.calledWith(null, 'POST OK').should.be.true;
                    }));
                [4, 5, 6, 7, 8, 9].forEach((level) => it('should accept TL' + level + ' user', () => {
                    const user = 'USER' + Math.ceil(1000 + Math.random() * 5000),
                        post = {
                            username: user,
                            'trust_level': level
                        },
                        spy = sinon.spy();
                    filterIgnoredOnPost(post, spy);
                    spy.called.should.be.false;
                    timers.tick(0);
                    spy.calledWith(null, 'Poster is TL4+').should.be.true;
                }));
            });
            describe('ignored users', () => {
                [1, 2, 3].forEach((level) => it('should ignore TL' + level + ' user on ignore list', () => {
                    const user = 'USER' + Math.ceil(1000 + Math.random() * 5000),
                        post = {
                            'trust_level': level,
                            username: user
                        },
                        spy = sinon.spy();
                    config.core.ignoreUsers.push(user);
                    filterIgnoredOnPost(post, spy);
                    config.core.ignoreUsers.pop();
                    spy.called.should.be.false;
                    timers.tick(0);
                    spy.calledWith('ignore', 'Post Creator Ignored').should.be.true;
                }));
                [4, 5, 6, 7, 8, 9].forEach((level) => {
                    it('should accept TL' + level + ' user on ignore list', () => {
                        const user = 'USER' + Math.ceil(1000 + Math.random() * 5000),
                            post = {
                                username: user,
                                'trust_level': level
                            },
                            spy = sinon.spy();
                        config.core.ignoreUsers.push(user);
                        filterIgnoredOnPost(post, spy);
                        config.core.ignoreUsers.pop();
                        spy.called.should.be.false;
                        timers.tick(0);
                        spy.calledWith(null, 'Poster is TL4+').should.be.true;
                    });
                });
            });
            describe('trust_level 1 users', () => {
                it('should place TL1 user on cooldown', () => {
                    const user = 'USER' + Math.ceil(1000 + Math.random() * 5000),
                        post = {
                            'trust_level': 1,
                            username: user
                        },
                        target = Date.now() + config.core.cooldownPeriod,
                        spy = sinon.spy();
                    filterIgnoredOnPost(post, spy);
                    utils.internals.cooldownTimers[user].should.equal(target);
                    spy.called.should.be.false;
                    timers.tick(0);
                    spy.calledWith(null, 'POST OK').should.be.true;
                });
                it('should ignore TL1 user on cooldown', () => {
                    const user = 'USER' + Math.ceil(1000 + Math.random() * 5000),
                        post = {
                            'trust_level': 1,
                            username: user
                        },
                        spy = sinon.spy();
                    utils.internals.cooldownTimers[user] = Number.MAX_SAFE_INTEGER;
                    filterIgnoredOnPost(post, spy);
                    spy.called.should.be.false;
                    timers.tick(0);
                    spy.calledWith('ignore', 'Poster is TL1 on Cooldown').should.be.true;
                });
                it('should not extend cooldown for TL1 user on cooldown', () => {
                    const user = 'USER' + Math.ceil(1000 + Math.random() * 5000),
                        post = {
                            'trust_level': 1,
                            username: user
                        },
                        now = Date.now() + 1 * 60 * 1000,
                        spy = sinon.spy();
                    utils.internals.cooldownTimers[user] = now;
                    filterIgnoredOnPost(post, spy);
                    utils.internals.cooldownTimers[user].should.equal(now);
                    spy.called.should.be.false;
                    timers.tick(0);
                    spy.calledWith('ignore', 'Poster is TL1 on Cooldown').should.be.true;
                });
            });
            describe('primary_group_name: bot users', () => {
                [1, 2, 3].forEach((level) => it('should reject TL' + level + ' bot user', () => {
                    const post = {
                            'trust_level': level,
                            'primary_group_name': 'bots'
                        },
                        spy = sinon.spy();
                    filterIgnoredOnPost(post, spy);
                    spy.called.should.be.false;
                    timers.tick(0);
                    spy.calledWith('ignore', 'Poster is a Bot').should.be.true;
                }));
                [4, 5, 6, 7, 8, 9].forEach((level) => it('should accept TL' + level + ' bot user', () => {
                    const post = {
                            'trust_level': level,
                            'primary_group_name': 'bots'
                        },
                        spy = sinon.spy();
                    filterIgnoredOnPost(post, spy);
                    spy.called.should.be.false;
                    timers.tick(0);
                    spy.calledWith(null, 'Poster is TL4+').should.be.true;
                }));
            });
        });
        describe('filterIgnoredOnTopic()', () => {
            const filterIgnoredOnTopic = utils.filterIgnoredOnTopic;
            let timers;
            before(() => timers = sinon.useFakeTimers());
            after(() => timers.restore());
            it('should accept empty topic', () => {
                const topic = {},
                    spy = sinon.spy();
                filterIgnoredOnTopic(topic, spy);
                spy.called.should.be.false;
                timers.tick(0);
                spy.calledWith(null, 'TOPIC OK').should.be.true;
            });
            it('should ignore post in ignoredCategory', () => {
                const category = Math.ceil(5000 + Math.random() * 5000),
                    topic = {
                        'category_id': category
                    },
                    spy = sinon.spy();
                config.core.ignoreCategories.push(category);
                filterIgnoredOnTopic(topic, spy);
                config.core.ignoreCategories.pop();
                spy.called.should.be.false;
                timers.tick(0);
                spy.calledWith('ignore', 'Topic Category Ignored').should.be.true;
            });
            it('should accept post not in ignoredCategory', () => {
                const category = Math.ceil(5000 + Math.random() * 5000),
                    topic = {
                        'category_id': category + 2
                    },
                    spy = sinon.spy();
                config.core.ignoreCategories.push(category);
                filterIgnoredOnTopic(topic, spy);
                config.core.ignoreCategories.pop();
                spy.called.should.be.false;
                timers.tick(0);
                spy.calledWith(null, 'TOPIC OK').should.be.true;
            });
            it('should ignore post in muted topic', () => {
                const topic = {
                        details: {
                            'notification_level': 0,
                            'created_by': {
                                username: 'none'
                            }
                        }
                    },
                    spy = sinon.spy();
                filterIgnoredOnTopic(topic, spy);
                spy.called.should.be.false;
                timers.tick(0);
                spy.calledWith('ignore', 'Topic Was Muted').should.be.true;
            });
            it('should accept post in regular topic', () => {
                const topic = {
                        details: {
                            'notification_level': 1,
                            'created_by': {
                                username: 'none'
                            }
                        }
                    },
                    spy = sinon.spy();
                filterIgnoredOnTopic(topic, spy);
                spy.called.should.be.false;
                timers.tick(0);
                spy.calledWith(null, 'TOPIC OK').should.be.true;
            });
            it('should ignore post in restricted topic', () => {
                const username = 'USER' + Math.random(),
                    topic = {
                        details: {
                            'created_by': {
                                username: username
                            }
                        }
                    },
                    spy = sinon.spy();
                config.core.ignoreUsers.push(username);
                filterIgnoredOnTopic(topic, spy);
                config.core.ignoreUsers.pop();
                spy.called.should.be.false;
                timers.tick(0);
                spy.calledWith('ignore', 'Topic Creator Ignored').should.be.true;
            });
        });
        describe('filterIgnored()', () => {
            const filterIgnored = utils.filterIgnored;
            let sandbox;
            beforeEach(() => {
                sandbox = sinon.sandbox.create();
                sandbox.stub(utils, 'filterIgnoredOnPost');
                sandbox.stub(utils, 'filterIgnoredOnTopic');
                sandbox.stub(utils, 'warn');
            });
            afterEach(() => {
                sandbox.restore();
            });
            it('should filter using filterIgnoredOnPost', () => {
                utils.filterIgnoredOnPost.yields(null);
                utils.filterIgnoredOnTopic.yields(null);
                filterIgnored({}, {}, () => {});
                utils.filterIgnoredOnPost.called.should.be.true;
            });
            it('should filter using filterIgnoredOnTopic', () => {
                utils.filterIgnoredOnPost.yields(null);
                utils.filterIgnoredOnTopic.yields(null);
                filterIgnored({}, {}, () => {});
                utils.filterIgnoredOnTopic.called.should.be.true;
            });
            it('should accept when filters yield no errror', () => {
                utils.filterIgnoredOnPost.yields(null, 'POST OK');
                utils.filterIgnoredOnTopic.yields(null, 'TOPIC OK');
                const spy = sinon.spy();
                filterIgnored({}, {}, spy);
                spy.lastCall.args.should.deep.equal([null]);
            });
            it('should accept when post filter yields error', () => {
                utils.filterIgnoredOnPost.yields('ignore', 'POST NOT OK');
                utils.filterIgnoredOnTopic.yields(null, 'TOPIC OK');
                const spy = sinon.spy();
                filterIgnored({}, {}, spy);
                spy.lastCall.args.should.deep.equal(['ignore']);
                utils.warn.called.should.be.true;
                utils.warn.lastCall.args.should.deep.equal(['Post #undefined Ignored: POST NOT OK']);
            });
            it('should accept when topic filter yields error', () => {
                utils.filterIgnoredOnPost.yields(null, 'POST OK');
                utils.filterIgnoredOnTopic.yields('ignore', 'TOPIC NOT OK');
                const spy = sinon.spy();
                filterIgnored({}, {}, spy);
                spy.lastCall.args.should.deep.equal(['ignore']);
                utils.warn.called.should.be.true;
                utils.warn.lastCall.args.should.deep.equal(['Post #undefined Ignored: POST OK, TOPIC NOT OK']);
            });
        });
    });
});
