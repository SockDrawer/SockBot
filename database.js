'use strict';
var fs = require('fs');
var user,
    tingo, Database;

exports.begin = function begin(discourse, config) {
    try {
        tingo = require('tingodb');
        Database = tingo().Db;
    } catch (e) {
        discourse.warn('Error loading tingo database driver: ' + e);
    }
    user = config.username;
};

exports.getDatabase = function getDatabase(collection, callback) {
    if (!Database) {
        callback('No Database Driver', null);
    }
    var path = 'databases/' + user + '/',
        db;
    fs.mkdir(path, function (err) {
        if (err && err.code !== 'EEXIST') {
            return callback(err, null);
        }
        db = new Database(path, {}).collection(collection);
        return callback(null, db);
    });
};
