'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.should();

const sinon = require('sinon');
require('sinon-as-promised');
chai.use(require('sinon-chai'));

const testModule = require('../../../providers/nodebb/groups');
const utils = require('../../../lib/utils');

describe('providers/nodebb/groups', () => {
    it('should export bindGroup()', () => {
        testModule.bindGroup.should.be.a('function');
    });
    it('should return a class on call to bindGroup()', () => {
        testModule.bindGroup({}).should.be.a('function');
    });
    describe('Group', () => {
        let Group = null,
            forum = null;
        beforeEach(() => {
            forum = {
                _emit: sinon.stub().resolves()
            };
            Group = testModule.bindGroup(forum);
        });
        describe('ctor()', () => {
            it('should store instance data in utils.storage', () => {
                const group = new Group({});
                utils.mapGet(group).should.be.ok;
            });
            it('should accept serialized input', () => {
                const group = new Group('{}');
                utils.mapGet(group).should.be.ok;
            });
            [
                ['id', 'name'],
                ['name', 'name']
            ].forEach((keys) => {
                const outKey = keys[0],
                    inKey = keys[1];
                it(`should store ${outKey} in utils.storage`, () => {
                    const expected = `a${Math.random()}b`;
                    const values = {};
                    values[inKey] = expected;
                    const group = new Group(values);
                    utils.mapGet(group, outKey).should.equal(expected);
                });
            });
        });
        describe('getters', () => {
            let data = null,
                group = null;
            beforeEach(() => {
                group = new Group({});
                data = utils.mapGet(group);
            });
            it('`id`: should retrieve `name` from storage', () => {
                const expected = Math.random();
                data.name = expected;
                group.id.should.equal(expected);
            });
            it('`name`: should retrieve `name` from storage', () => {
                const expected = `name${Math.random()}`;
                data.name = expected;
                group.name.should.equal(expected);
            });
        });
    });
});
