'use strict';

const fs = require('fs'),
    yaml = require('js-yaml');

function readFile(path, callback) {
    if (!path || typeof path !== 'string'){
        return callback(new Error('Path must be a string'));
    }
    fs.readFile(path, (err, data) => {
        if (err) {
            return callback(err);
        }
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


/* istanbul ignore else */
if (typeof GLOBAL.describe === 'function') {
    exports.internals = {
        readFile: readFile
    };
}
