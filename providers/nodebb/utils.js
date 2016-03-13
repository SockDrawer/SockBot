'use strict';
const storage = new WeakMap();

/**
 * description
 *
 */
exports.mapGet = function mapGet(obj, key) {
    return (storage.get(obj) || {})[key];
};

/**
 * description
 *
 */
exports.mapSet = function mapSet(obj, value) {
    storage.set(obj, value);
};

/**
 * description
 *
 */
exports.parseJSON = function parseJSON(json) {
    if (!json) {
        throw new Error('[[invalid-argument:required]]');
    }
    if (typeof json === 'string') {
        try {
            json = JSON.parse(json);
        } catch (err) {
            throw new Error(`[[invalid-json:${err.message}]]`);
        }
    }
    const type = typeof json;
    if (type !== 'object') {
        throw new Error(`[[invalid-argument: expected object but received ${type}]]`);
    }
    return json;
};

/**
 * description
 *
 */
exports.iterate = function iterate(arr, each) {
    return new Promise((resolve, reject) => {
        const next = () => {
            if (!arr || !arr.length) {
                return resolve();
            }
            const post = arr.shift();
            return each(post)
                .then(() => next())
                .catch(reject);
        };
        next();
    });
};
