/**
 * Core Utilities for Sockbot
 * @module utils
 * @license MIT
 */
'use strict';

const sanitizeHtml = require('sanitize-html');

const storage = new WeakMap();


const fs = require('fs');
const config = require('./config');

/**
 * Generate a "good enough" Type 4 UUID.
 *
 * Not cryptographically secure, not pretty, not fast, but since we only need a couple of these it's good enough
 *
 * @returns {string} a "type 4 UUID"
 */
exports.uuid = function () {
    return '88888888-8888-4888-2888-888888888888'.replace(/[82]/g, (c) => (Math.random() * c * 2 ^ 8).toString(16));
};


/**
 * Log a message to the console
 *
 * @param {*} message Message to log
 */
exports.log = function (message) {
    console.log(message); //eslint-disable-line no-console
};

/**
 * Log a warning to the console
 *
 * @param {*} message Warning to log
 */
exports.warn = function (message) {
    console.warn(message); //eslint-disable-line no-console
};

/**
 * Log an error to the console
 *
 * @param {*} message Error to log
 */
exports.error = function (message) {
    console.error(message); //eslint-disable-line no-console
};

/**
 * Write an extended log entry
 *
 * @param {number} level Log Level
 * @param {string} message Log Message
 * @param {*} [data] Optional extended log data
 */
exports.logExtended = function (level, message, data) {
    if (config.core.extendedLogLevel === 0 || level > config.core.extendedLogLevel) {
        return;
    }
    const stamp = new Date().toISOString();
    const extra = data !== undefined ? ' : ' + JSON.stringify(data) : '';
    const toWrite = level + ' : ' + stamp + ' : ' + message + extra;
    let dest = config.core.extendedLog;
    switch (dest) {
    case 'stdout':
    case 'STDOUT':
        dest = 1;
        break;
    case 'stderr':
    case 'STDERR':
        dest = 2;
    }
    const writer = (typeof dest === 'number') ? fs.write : fs.appendFile;
    writer(dest, toWrite, function (err) {
        if (err) {
            exports.error('Extended Log Error: ' + err.message);
        }
    });
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
    if (base == null || typeof base !== 'object' || Array.isArray(base)) {
        throw new Error('base must be object');
    }
    if (mixin == null || typeof mixin !== 'object' || Array.isArray(mixin)) {
        throw new Error('mixin must be object');
    }
    let name;
    for (name in mixin) {
        mergeHelper(base, mixin, name, mergeArrays);
    }
}

/*
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
    let reallyMergeArrays = false;
    if (typeof args[0] === 'boolean') {
        reallyMergeArrays = args.shift();
    }
    let obj;
    while ((obj = args.shift())) {
        mergeInner(res, exports.cloneData(obj), reallyMergeArrays);
    }
    return res;
};




/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    //test is running
    exports.mergeInner = mergeInner;
}



/**
 * description
 *
 */
exports.mapGet = function mapGet(obj, key) {
    const val = (storage.get(obj) || {});
    return key?val[key]:val;
};

/**
 * description
 *
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

/**
 * description
 *
 */
exports.htmlToRaw = function htmlToRaw(markup) {
    markup = sanitizeHtml(markup,{
        allowedTags:['code','blockquote'],
        exclusiveFilter:(frame)=>frame.tag ==='code' || frame.tag==='blockquote'
    });
    return markup;
};
