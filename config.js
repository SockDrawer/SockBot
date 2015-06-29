'use strict';

const fs = require('fs'),
    yaml = require('js-yaml');

/**
 * Read and parse configuration File from disc
 * 
 * @param {string} path File Path of file to read
 * @param {readComplete} callback Completion callback
 */
function readFile(path, callback) {
    if (!path || typeof path !== 'string'){
        return callback(new Error('Path must be a string'));
    }
    fs.readFile(path, (err, data) => {
        if (err) {
            return callback(err);
        }
        // Remove UTF-8 BOM iof present
        if (data.length >= 3 && data[0] === 0xef &&
            data[1] === 0xbb && data[2] === 0xbf) {
            data = data.slice(3);
        }
        try {
            callback(null, yaml.safeLoad(data));
        } catch (e) {
            callback(e);
        }
    });
}

/**
 * Read File Callback
 *
 * @param {Exception} [err=null] Error encountered processing request
 * @param {Object} body YAML parsed response body. If invalid YAML will be `undefined`
 */
function readComplete(err, config) {} //eslint-disable-line handle-callback-err, no-unused-vars


/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    exports.internals = {
        readFile: readFile
    };
    exports.stubs = {
        
    }
}
