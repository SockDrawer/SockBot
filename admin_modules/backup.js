'use strict';

var async = require('async'),
    mkdirp = require('mkdirp'),
    fs = require('fs'),
    spawn = require('child_process').spawn;
var discourse, config, log = [],
    oncomplete = [],
    executing = false;
exports.name = 'Backups';
exports.version = '0.0.1';
exports.description = 'Backup Manager';
exports.configuration = {
    'enabled': false,
    'auto_download': true,
    'download_dir': 'backups',
    'remove_old_backups': true,
    'auto_restore': true,
    'auto_backup': true,
    'auto_backup_time': '05:00',
    'auto_size_limit': 20971520,
    'notify_users': 'accalia'
};

exports.begin = function begin(browser, configuration) {
    discourse = browser;
    config = configuration;
    if (!config.enabled) {
        return;
    }
    if (config.auto_backup) {
        async.forever(function (next) {
            autoBackup(next);
        });
    }
};


function autoBackup(callback) {
    var hour = parseInt(/(\d+)/.exec(config.auto_backup_time)[1], 10),
        minute = parseInt(/:(\d+)/.exec(config.auto_backup_time)[1], 10),
        now = new Date(),
        utc = new Date();
    utc.setUTCHours(hour);
    utc.setUTCMinutes(minute);
    utc.setUTCSeconds(0);
    utc.setMilliseconds(0);
    now = now.getTime();
    utc = utc.getTime();
    if (now > utc) {
        // add a day if scheduling after 23:40 UTC
        utc += 24 * 60 * 60 * 1000;
    }
    setTimeout(function () {
        discourse.log('Starting Scheduled Backup.');
        startBackup(function (err) {
            if (err) {
                discourse.warn('Backup Failed');
            } else {
                discourse.log('Backup Succeeded');
            }
            callback();
        });
    }, utc - now);
}

exports.backup = function backup(args, callback) {
    if (!config.enabled) {
        return callback(true, 'Disabled');
    }
    executing = true;
    var arg = (args || []).shift() || '';
    arg = arg.toLowerCase();
    switch (arg) {
    case '':
    case 'all':
    case 'start':
    case 'download':
    case 'load':
        async.series([
            function (flow) {
                if (arg === 'all' || arg === 'start') {
                    return startBackup(flow);
                }
                flow(null, []);
            },
            function (flow) {
                if (arg === 'all' || arg === 'download') {
                    return downloadLatestBackup(false, flow);
                }
                flow(null, []);
            },
            function (flow) {
                if (arg === 'all' || arg === 'load') {
                    return restoreBackup(flow);
                }
                flow(null, []);
            }
        ], function (err, results) {
            var logs = err ? 'ERROR:\n' : 'SUCCESS:\n';
            results.forEach(function (i) {
                logs += i.join('\n') + '\n';
            });
            executing = false;
            callback(null, logs);
        });
        break;
    default:
        executing = false;
        callback(null, 'Usage: !admin download [all|start|download|load]');
        break;
    }
};
exports.backup.command = 'backup';
exports.backup.description = 'Do backup things';
exports.backup.trustLevel = 8;
exports.backup.muteable = false;
exports.backup.prefix = false;

function startBackup(callback) {
    var abort = false;
    oncomplete.push(function (err, log2, after) {
        if (abort) {
            return;
        }
        callback(err, log2);
        after();
    });
    discourse.postForm('admin/backups', {
        'with_uploads': false
    }, function (err) {
        if (err) {
            abort = true;
            callback(err, 'Backup failed to start');
        }
    });
}

function exec(command, args, callback) {
    var stdout = [],
        stderr = [],
        process;
    process = spawn(command, args);
    process.on('close', function (code) {
        callback(code, stdout, stderr);
    });
    return process;
}

function afterBackup(success) {
    var running = executing;
    var messages = log.slice();
    var m = oncomplete;
    oncomplete = [];
    async.each(m, function (func, flow) {
        func(!success, messages, flow);
    });
    if (running) {
        return;
    }
    async.series([
        function (flow) {
            if (!config.auto_download) {
                return flow(true);
            }
            downloadLatestBackup(true, function (err, output) {
                messages = messages.concat(output);
                flow(err);
            });
        },
        function (flow) {
            if (!config.auto_restore) {
                flow(true);
            }
            restoreBackup(function (err, output) {
                messages = messages.concat(output);
                flow(err);
            });
        }
    ], function () {
        mailLog(messages, function () {});
    });
}

function downloadLatestBackup(isauto, callback) {
    var messages = [];
    async.series([
        function (flow) {
            mkdirp(config.download_dir, function (err) {
                var prefix = 'DOWNLOAD: Ensuring Downloads Directory Exists: ';
                if (err) {
                    messages.push(prefix + 'Failed');
                } else {
                    messages.push(prefix + 'Success');
                }
                flow(err);
            });
        },
        function (flow) {
            if (!config.remove_old_backups) {
                return flow();
            }
            messages.push('DOWNLOAD: Removing Old Backups');
            fs.readdir(config.download_dir, function (err, files) {
                if (err) {
                    messages.push('DOWNLOAD: List Directory Failed');
                    return flow(err);
                }
                async.each(files.filter(function (i) {
                    return /tar[.]gz([.]log)?$/.test(i);
                }).map(function (i) {
                    return config.download_dir + '/' + i;
                }), fs.unlink, function (err2) {
                    if (err2) {
                        messages.push('DOWNLOAD: Removing Old Backups Failed');
                    }
                    flow(err2);
                });
            });
        },
        function (flow) {
            discourse.getForm('admin/backups.json', function (err, _, data) {
                if (err) {
                    messages.push('DOWNLOAD: Error Loading Backups');
                    return flow(err);
                }
                if (isauto && data[0].size > config.auto_size_limit) {
                    messages.push('DOWNLOAD: Aborting Download As Over Limit');
                    flow(true);
                }
                var src = 'http:' + data[0].link;
                var dest = config.download_dir + '/' + data[0].filename;
                discourse.saveFile(src, dest, function (err2) {
                    if (err2) {
                        messages.push('DOWNLOAD: Error Downloading Backup');
                    } else {
                        messages.push('DOWNLOAD: Downloaded Backup');
                    }
                    flow(err2);
                });
            });
        }
    ], function (err) {
        callback(err, messages);
    });
}

function restoreBackup(callback) {
    var src, messages = [];
    async.series([
        function (flow) {
            fs.readdir(config.download_dir, function (err, files) {
                if (err) {
                    messages.push('RESTORE: No Backup Found');
                    return flow(err);
                }
                var file = files.filter(function (i) {
                    return /tar[.]gz$/.test(i);
                });
                file.sort();
                file = file.pop();
                if (!file) {
                    return flow(true);
                }
                messages.push('RESTORE: Restoring ' + file);
                src = config.download_dir + '/' + file;
                flow();
            });
        },
        function (flow) {
            exec('bash', [
                'admin_modules/backup.sh',
                src,
                src + '.log'
            ], function (err) {
                if (err) {
                    messages.push('RESTORE: Restoring failed. Check log file');
                }
                messages.push('RESTORE: Log file: ' + src + '.log');
                flow();
            });
        }
    ], function (err) {
        callback(err, messages);
    });
}

function mailLog(lines, callback) {
    var msg = 'Backup completed: \n\n```text\n' + lines.join('\n') + '\n```\n';
    discourse.createPrivateMessage(config.notify_users, 'Backup Completed', msg,
        callback);
}

exports.registerListeners = function registerListeners(callback) {
    if (!config.enabled) {
        return callback(null, []);
    }
    callback(null, ['/admin/backups/logs']);
};

exports.onMessage = function onMessage(message, post, callback) {
    if (!config.enabled) {
        return callback();
    }
    if (message.data && message.data.operation === 'backup') {
        if (message.data.message === '[STARTED]') {
            log = [];
        }
        if (!/^pg_dump/.test(message.data.message)) {
            log.push(message.data.message);
        }
        if (message.data.message === '[SUCCESS]' ||
            message.data.message === '[FAILED]') {
            afterBackup(message.data.message === '[SUCCESS]');
        }
    }
    callback();
};
