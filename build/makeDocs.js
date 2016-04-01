'use strict';

// this is a build file! no documentation here! ...... please?
/* eslint-disable require-jsdoc */

const async = require('async'),
    dmd = require('dmd'),
    fs = require('fs'),
    glob = require('glob-all'),
    jsdoc = require('jsdoc-parse'),
    mkdirp = require('mkdirp'),
    path = require('path');

const docFiles = ['*.js', '!./gulpfile.js', '**/lib/**/*.js', '**/classes/**/*.js', '**/plugins/**/*.js',
    '!node_modules/**', '**/providers/**/*.js', '!test/**/*.js'
];
const docDest = path.join('docs', 'api');

function log(msg) {
    console.log(msg); //eslint-disable-line no-console
}

function warn(msg) {
    console.warn(msg); //eslint-disable-line no-console
}

function processFile(file, complete) {
    const dir = path.join(docDest, path.dirname(file));
    const name = `${path.basename(file, '.js') }.md`;
    mkdirp(dir, (err) => {
        if (err) {
            complete(err);
            return;
        }
        const inFile = fs.createReadStream(file);
        const outFile = fs.createWriteStream(path.join(dir, name));
        inFile.pipe(jsdoc()).pipe(dmd()).pipe(outFile);
        outFile.on('finish', () => {
            log(`Generate markdown: ${file}`);
            complete();
        });
    });
}

function verifyDocumented(file, complete) {
    fs.stat(file, (err, stats) => {
        if (err) {
            complete(err);
        }
        if (stats.size === 0) {
            const origFile = `.${file.replace(/[.]md$/, '.js').slice(docDest.length)}`;
            warn(`Verify: ${origFile} has no documentation. Consider adding documentation for this file.`);
            fs.unlink(file, complete);
            return;
        }
        complete();
    });
}

function verifyExists(file, complete) {
    const origFile = `.${file.replace(/[.]md$/, '.js').slice(docDest.length)}`;
    fs.stat(origFile, (err) => {
        if (err) {
            warn(`Verify: ${origFile} has been removed. Removing Documentation.`);
            fs.unlink(file, complete);
            return;
        }
        complete();
    });
}

function verifyDocs(complete) {
    glob(`${docDest}/**/*.md`, (_, files) => {
        async.each(files, (file, next) => {
            verifyDocumented(file, () => verifyExists(file, next));
        }, complete);
    });
}

function generateDocs(complete) {
    glob(docFiles, (_, files) => {
        async.each(files, processFile, complete);
    });
}

const JobNumber = process.env.TRAVIS_JOB_NUMBER, //eslint-disable-line no-process-env
    PullRequestFlag = process.env.TRAVIS_PULL_REQUEST, //eslint-disable-line no-process-env
    PullRequest = PullRequestFlag && PullRequestFlag !== 'false';
if (!PullRequest && (!JobNumber || /[.]1$/.test(JobNumber))) {
    generateDocs(() => {
        log('Documentation generated. Verifying docs');
        return verifyDocs(() => log('Verification complete'));
    });
}
/* eslint-enable require-jsdoc */
