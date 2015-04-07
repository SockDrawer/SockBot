/*jslint node: true, indent: 4, unparam: true  */
'use strict';

var verspec = '$Format:%d|%h|%ae|%ct$'; // '(tag: v0.16)|deadbee|thecourtjester@twelvebaud.net|872835240'
                                        // '(tag and branch names)|hash|author e-mail|commit timestamp'
var version = 'v0.16';
var offset = -1; //number of commits between this and `version`, 0 for "is this version", -1 for "no idea".
var hash = '';
var committer = '';
var timestamp = Date.now() / 1000 | 0;

var autoversion = true;
var describe = '';

var vernames = {
    'v0.16'   : 'Hazardous Hera',
    'v0.15.1' : 'Zany Zoe',
    'v0.15.0' : 'Zany Zoe',
    'v0.14.0' : 'Elfish Emily',
    'v0.13.0' : 'Devious Daine',
    'v0.12.5' : 'Guileful Ginny',
    'v0.12.0' : 'Beguiling Beatrice',
    'v0.11.1' : 'Artful Alice'
};

if(verspec.charAt(0) === '$' || verspec.charAt(0) === '|') {
    var childProcess = require('child_process');
    try {
        describe = childProcess.execSync('git describe --tags --long --always', { cwd : __dirname });
        verspec = childProcess.execSync('git log -n 1 --pretty=%d|%h|%ae|%ct', { cwd : __dirname });
    }
    catch (e) {
        autoversion = false;
    }
}

