/**
 * Core Utilities for Sockbot
 * @module utils
 * @license MIT
 */
'use strict';

const sanitizeHtml = require('sanitize-html');
const storage = new WeakMap();

const debug = require('debug')('sockbot:utils');

/**
 * Write an extended log entry
 *
 * @param {number} level Log Level
 * @param {string} message Log Message
 * @param {*} [data] Optional extended log data
 */
exports.logExtended = function logExtended(level, message, data) {
    const stamp = new Date().toISOString();
    const extra = data !== undefined ? ` : ${JSON.stringify(data)}` : '';
    debug(`Log ${level} : ${stamp} : ${message} ${extra}`);
};

/**
 * Clone object
 *
 * @param {*} original Data to clone
 * @returns {*} Cloned `original` data
 */
exports.cloneData = function cloneData(original) {
    if (original === undefined) {
        return undefined;
    }
    return JSON.parse(JSON.stringify(original));
};

/**
 * Recursively merge objects
 *
 * @param {object} base Base object to merge `mixin` into
 * @param {object} mixin Mixin object to merge into `base`
 * @param {boolean} [mergeArrays] Merge arrays instead of concatenating them
 */
function mergeInner(base, mixin, mergeArrays) {
    if (base === null || typeof base !== 'object' || Array.isArray(base)) {
        throw new Error('base must be object');
    }
    if (mixin === null || typeof mixin !== 'object' || Array.isArray(mixin)) {
        throw new Error('mixin must be object');
    }
    let name;
    for (name in mixin) {
        if (mixin.hasOwnProperty(name)) {
            mergeHelper(base, mixin, name, mergeArrays);
        }
    }
}

/**
 * Merge helper - FOR INTERNAL USE ONLY
 *
 * @param {object} base Base object to merge `mixin` into
 * @param {object} mixin Mixin object to merge into `base`
 * @param {string} name Name of property to merge
 * @param {boolean} [mergeArrays] Merge arrays instead of concatenating them
 */
function mergeHelper(base, mixin, name, mergeArrays) {
    if (Array.isArray(mixin[name])) {
        if (!mergeArrays && base[name] && Array.isArray(base[name])) {
            base[name] = base[name].concat(mixin[name]);
        } else {
            base[name] = mixin[name];
        }
    } else if (typeof mixin[name] === 'object' && mixin[name] !== null) {
        let newBase = base[name] || {};
        if (Array.isArray(newBase)) {
            newBase = {};
        }
        mergeInner(newBase, mixin[name], mergeArrays);
        base[name] = newBase;
    } else {
        base[name] = mixin[name];
    }
}

/**
 * Merge multiple objects into one object
 *
 * Later objects override earlier objects
 *
 * @param {boolean} [mergeArrays] Merge arrays instead of concatenating them
 * @param {...object} mixin Objects to merge
 * @returns {object} object constructed by merging `mixin`s from left to right
 */
exports.mergeObjects = function mergeObjects(mergeArrays, mixin) { //eslint-disable-line no-unused-vars
    const args = Array.prototype.slice.apply(arguments),
        res = {};
    let mergeContents = false;
    if (typeof args[0] === 'boolean') {
        mergeContents = args.shift();
    }
    let obj = args.shift();
    while (obj) {
        mergeInner(res, exports.cloneData(obj), mergeContents);
        obj = args.shift();
    }
    return res;
};

/**
 * Get value from WeakMap store
 *
 * @param {*} obj Object key for weakmap store
 * @param {string} [key] Object key to retrieve from stored value
 * @returns {*} Stored value
 */
exports.mapGet = function mapGet(obj, key) {
    const val = storage.get(obj) || {};
    return key ? val[key] : val;
};

/**
 * Store values in weakmap store
 *
 * If `value` is omitted `key` is stored instead
 *
 * @param {*} obj Object key for weakmap store
 * @param {string|*} key Key to store value under or value object to store
 * @param {*} [value] Value to store for `key`
 */
exports.mapSet = function mapSet(obj, key, value) {
    let values = key;
    if (value) {
        values = storage.get(obj) || {};
        values[key] = value;
    }
    storage.set(obj, values);
};

/**
 * Parse JSON data to object
 *
 * @param {string|object} json stringified object to parse
 * @returns {object} Parsed object
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
    if (json === null) {
        throw new Error('[[invalid-argument:expected object but received null]]');
    }
    if (type !== 'object') {
        throw new Error(`[[invalid-argument:expected object but received ${type}]]`);
    }
    return json;
};

exports.iterate = function iterate(arr, each) {
    return new Promise((resolve, reject) => {
        const next = () => {
            if (!arr || !arr.length) {
                return resolve();
            }
            const item = arr.shift();
            return each(item)
                .then(() => next())
                .catch(reject);
        };
        next();
    });
};

exports.htmlToRaw = function htmlToRaw(markup) {
    markup = sanitizeHtml(markup, {
        allowedTags: ['code', 'blockquote'],
        exclusiveFilter: (frame) => frame.tag === 'code' || frame.tag === 'blockquote'
    });
    return markup;
};

/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.mergeInner = mergeInner;
    exports.storage = storage;
}
