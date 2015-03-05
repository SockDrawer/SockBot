'use strict';
var sqlite = require('sqlite3'),
    async = require('async');

var db,
    sTables = 'CREATE TABLE IF NOT EXISTS documents (module VARCHAR(30), ' +
    'key VARCHAR(100), document TEXT, CONSTRAINT unq_key UNIQUE(module, key))',
    sInsert = 'INSERT OR IGNORE INTO documents (module, key, document) ' +
    'VALUES ($module, $key, $document);',
    sUpdate = 'UPDATE OR IGNORE documents SET document = $document ' +
    'WHERE module = $module AND key = $key;',
    sDelete = 'DELETE FROM documents ' +
    'WHERE module = $module AND key = $key',
    sSelect = 'SELECT document FROM documents ' +
    'WHERE module = $module AND key = $key',
    sSelectMany = 'SELECT key, document FROM documents ' +
    'WHERE module = $module';

/**
 * Generate a type 4 UUID.
 * I don't understand how this does what it does, but it works.
 * It's a lot slower than using node-uuid but i only need one
 * of these so its good enough
 * Source: http://jsperf.com/node-uuid-performance/19
 */
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
        function (c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
}

exports.start = function start(config, callback) {
    db = new sqlite.Database(config.username + '.sql');
    db.run(sTables, callback);
};

exports.addDocument = function addDocument(module, key, document, callback) {
    if (!callback) {
        callback = document;
        document = key;
        key = uuid();
    }
    if (typeof callback !== 'function') {
        throw 'No Callback!';
    }
    var args = {
        $module: module,
        $key: key,
        $document: JSON.stringify(document)
    };
    async.series([
            function (next) {
                db.run(sUpdate, args, next);
            },
            function (next) {
                db.run(sInsert, args, next);
            }
        ],
        function (err) {
            callback(err, key);
        });
};

exports.deleteDocument = function deleteDocument(module, key, callback) {
    db.run(sDelete, {
        $module: module,
        $key: key
    }, function (err) {
        callback(err);
    });
};

exports.getDocument = function getDocument(module, key, callback) {
    db.get(sSelect, {
        $module: module,
        $key: key
    }, function (err, row) {
        if (err) {
            return callback(err, null);
        }
        var doc = row.document;
        try {
            doc = JSON.parse(doc);
        } catch (e) {
            return callback(e);
        }
        callback(null, doc);
    });
};

exports.getDocuments = function getDocuments(module, each, finished) {
    var stmt = db.prepare(sSelectMany, {
            $module: module
        }),
        go = true;
    async.whilst(function () {
        return !!go;
    }, function (next) {
        stmt.get(function (err, row) {
            go = row;
            if (err || !row) {
                return next(err);
            }
            var doc = row.document;
            try {
                doc = JSON.parse(doc);
            } catch (e) {
                return each(e, row.key, next);
            }
            each(null, row.key, doc, next);
        });
    }, finished);
};
