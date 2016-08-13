'use strict';

const utils = require('../../lib/utils');

/**
 * Create a ChatRoom class and bind it to a forum instance
 *
 * @param {Provider} forum A forum instance to bind to constructed ChatRoom class
 * @returns {User} A ChatRoomPo class bound to the provided `forum` instance
 */
exports.bindGroup = function bindGroup(forum) {
    /**
     * Message Group
     *
     * Represents a forum group
     *
     * @public
     */
    class Group {
        constructor(payload) {
            payload = utils.parseJSON(payload);
            const values = {
                'name': payload.name
            };
            utils.mapSet(this, values);
        }
        get id() {
            return utils.mapGet(this, 'name');
        }
        get name() {
            return utils.mapGet(this, 'name');
        }

        static _getList(query, data, key, each) {
            return new Promise((resolve, reject) => {
                let idx = 0;
                const iterate = () => {
                    data.after = idx;
                    return forum._emit(query, data).then((results) => {
                        if (!results[key] || !results[key].length) {
                            return resolve();
                        }
                        idx = results.nextStart;
                        each(results[key]);
                        return process.nextTick(iterate);
                    }).catch((err) => reject(err));
                };
                iterate();
            });
        }

        getMembers() {
            const members = [];
            return Group._getList(
                    'groups.loadMoreMembers', {
                        groupName: this.name
                    },
                    'users',
                    (users) => users.forEach((user) => members.push(forum.User.parse(user))))
                .then(() => members);
        }

        static getAll() {
            const results = [];
            return Group._getList(
                    'groups.loadMore', {
                        sort: 'alpha'
                    },
                    'groups',
                    (groups) => groups.forEach((group) => results.push(Group.parse(group))))
                .then(() => results);
        }

        static get(groupName) {
            const lcase = (name) => (name || '').toLowerCase();
            groupName = lcase(groupName);
            const query = {
                query: groupName
            };
            return forum._emit('groups.search', query)
                .then((result) => (result || []).filter((group) => lcase(group.name) === groupName)[0])
                .then(Group.parse);
        }

        static parse(payload) {
            if (!payload) {
                throw new Error('E_GROUP_NOT_FOUND');
            }
            return new Group(payload);
        }
    }

    return Group;
};

