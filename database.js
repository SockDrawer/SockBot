'use strict';
var fs = require('fs'),
    tingo = require('tingodb');
var user,
    Database = tingo().Db;

exports.begin = function begin(unused, config) {
    user = config.username;
};

exports.getDatabase = function getDatabase(collection, callback) {
    var path = 'databases/' + user + '/', db;
    fs.mkdir(path, function(err){
        if (err && err.code !== 'EEXIST'){
            return callback(err, null);
        }
        db = new Database(path, {}).collection(collection);
        return callback(null, db);
    });
};
