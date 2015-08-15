/*jslint node: true, indent: 4, unparam: true  */
'use strict';

var verspec = '$Format:%d|%h|%ae|%ct$';
// ' (tag: v0.16)|deadbee|thecourtjester@twelvebaud.net|872835240'
// ' (tag and branch names)|hash|author e-mail|commit timestamp'

var codename = 'SockBot';
var version = 'v0.99';

var vernames = {
    'v0.16': 'Hazardous Hera',
    'v0.15.1': 'Zany Zoe',
    'v0.15.0': 'Zany Zoe',
    'v0.14.0': 'Elfish Emily',
    'v0.13.0': 'Devious Daine',
    'v0.12.5': 'Guileful Ginny',
    'v0.12.0': 'Beguiling Beatrice',
    'v0.11.1': 'Artful Alice',
    'v0.99.0': 'Omega Olivia'
};

var offset = -1;
//number of commits between this and `version`,
//0 for 'is this version', -1 for 'no idea'.
var hash = '';
var committer = '';
var timestamp = new Date();

var versource = 'export';
var describe = '';

if (verspec.indexOf('%') !== -1 ) {
    var execSync = require('sync-exec');
    versource = 'auto';
    try {
        var describex = execSync('git describe --tags --long --always',
            {cwd: __dirname});
        if (describex && describex.status === 0) {
            describe = describex.stdout.slice(0, -1);
        }
        var verspecx = execSync(
            'git log -n 1 --pretty="%d|%h|%ae|%ct"', {cwd: __dirname});
        if (verspecx && verspecx.status === 0) {
            verspec = verspecx.stdout.slice(0, -1);
        }
        if (!describex || describex.status !== 0 ||
            !verspecx || verspecx.status !== 0) {
            versource = 'manual';
        }
    } catch (e) {
        versource = 'manual';
    }
}

describe = describe.split('-');
if (describe.length === 1) {
    hash = describe[0];
} else if (describe.length === 3) {
    version = describe[0];
    offset = Number(describe[1]);
    hash = describe[2].slice(1);
}

if (verspec.indexOf('%') === -1) {
    verspec = verspec.slice(1).split('|');
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
    'source': versource
};

exports.signature = ('\n\n<!-- Posted by ' + codename + ' ' + version.slice(1) +
    (vernames[version] ? ' "' + vernames[version] + '"' : '') +
    ((offset !== 0 && hash && versource !== 'export') ?
        ' (' + ((offset === -1) ? '?' : ('+' + offset)) + ':' + hash + ')'
        : '') +
    ' on behalf of &#x40;{{conf.admin.owner}} -->');

exports.userAgent = (codename + '/' + version.slice(1) + ' (' +
    (vernames[version] ? vernames[version] + '; ' : '') +
    (hash ? 'rv:' + hash + '; ' : '') +
    'owner:@{{conf.admin.owner}}) @{{conf.username}}/' +
    timestamp.toISOString().replace(/-/g, '').slice(0, 8));

exports.bootString = ('\n' + codename + ' ' + version.slice(1) +
    ((offset > 0) ? '+' + offset : '') +
    (vernames[version] ? ' "' + vernames[version] + '"' : '') +
    ((hash && committer) ? '\n' + hash + ' <' + committer + '>' : '') +
    ((versource === 'manual') ? '\n(Detailed versioning not available)' : '')) +
    '\n';

