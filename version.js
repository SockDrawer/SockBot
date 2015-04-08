/*jslint node: true, indent: 4, unparam: true  */
'use strict';

var verspec = '$Format:%d|%h|%ae|%ct$';
// ' (tag: v0.16)|deadbee|thecourtjester@twelvebaud.net|872835240'
// ' (tag and branch names)|hash|author e-mail|commit timestamp'

var codename = 'SockBot';
var version = 'v0.16';

var vernames = {
    'v0.16': 'Hazardous Hera',
    'v0.15.1': 'Zany Zoe',
    'v0.15.0': 'Zany Zoe',
    'v0.14.0': 'Elfish Emily',
    'v0.13.0': 'Devious Daine',
    'v0.12.5': 'Guileful Ginny',
    'v0.12.0': 'Beguiling Beatrice',
    'v0.11.1': 'Artful Alice'
};

var offset = -1;
//number of commits between this and `version`,
//0 for 'is this version', -1 for 'no idea'.
var hash = '';
var committer = '';
var timestamp = Date.now() / 1000 | 0;

var autoversion = true;
var describe = '';

if (verspec.indexOf('%') !== -1 ) {
    var childProcess = require('child_process');
    try {
        describe = childProcess.execSync('git describe --tags --long --always',
            {cwd: __dirname});
        //If Git is unavailable or unable to describe, this will fail here
        //and Git Log won't get a chance to overwrite the verspec.
        verspec = ' ' + childProcess.execSync(
            'git log -n 1 --pretty=%d|%h|%ae|%ct', {cwd: __dirname}); 
    } catch (e) {
        autoversion = false;
    }
}

describe = describe.split('-');
if (describe.length === 1) {
    hash = describe[0];
} else if (describe.length === 3) {
    version = describe[0];
    offset = Number(describe[1]);
    hash = describe[2].substr(1);
}

if (verspec.indexOf('%') !== -1){
    verspec = verspec.substr(1).split('|');
    var verspecResult = /(?:\(| )tag: ([^,)]+)/.exec(verspec[0]);
    if (verspecResult) {
        version = verspecResult[1];
    }
    hash = verspec[1];
    committer = verspec[2];
    timestamp = new Date(Number(verspec[3]) * 1000);
}

exports.version = {
    'codename': codename,
    'number': version,
    'name': vernames[version] || null,
    'offset': offset === -1 ? null : offset,
    'hash': hash || null,
    'committer': committer || null,
    'timestamp': timestamp,
    'guess': !autoversion
};

exports.signature = '\n\n<!-- Posted by ' + codename + ' ' + version.substr(1) +
    (vernames[version] ? ' "' + vernames[version] + '"' : '') +
    ((offset !== 0 && hash) ? ' (' + ((offset === -1) ? '?' : ('+' + offset)) +
        ':' + hash + ')' : '') +
    ' on behalf of &#x40;{{conf.admin.owner}} -->';

exports.userAgent = codename + '/' + version.substr(1) + ' (' +
    (vernames[version] ? vernames[version] + '; ' : '') +
    (hash ? 'rv:' + hash + '; ' : '') +
    'owner:@{{conf.admin.owner}}) @{{conf.username}}/' +
    timestamp.toISOString().replace(/-/, '').substr(0, 8);

exports.bootString = codename + ' ' + version.substr(1) +
    ((offset > 0) ? '+' + offset : '') +
    (vernames[version] ? ' "' + vernames[version] + '"' : '') +
    ((hash && committer) ? '\n' + hash + ' <' + committer + '>' : '') +
    (!autoversion ? '\n(Detailed versioning not available)' : '');
