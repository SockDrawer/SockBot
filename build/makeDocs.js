'use strict';

const async = require('async'),
    dmd = require('dmd'),
    fs = require('fs'),
    glob = require('glob-all'),
    jsdoc = require('jsdoc-parse'),
    mkdirp = require('mkdirp'),
    path = require('path');

const documentableFiles = ['*.js', '!./gulpfile.js', '**/lib/**/*.js', '**/classes/**/*.js', '**/plugins/**/*.js',
    '!node_modules/**', '!test/**'
];
const documentationDest = path.join('docs', 'api');

function processFile(file, complete) {
    const dir = path.join(documentationDest, path.dirname(file));
    const name = path.basename(file, '.js') + '.md';
    mkdirp(dir, (err) => {
        if (err) {
            return complete(err);
        }
        const inFile = fs.createReadStream(file);
        const outFile = fs.createWriteStream(path.join(dir, name));
        inFile.pipe(jsdoc()).pipe(dmd()).pipe(outFile);
        outFile.on('finish', () => {
            console.log('Generate markdown: ' + file); //eslint-disable-line no-console
            complete();
        });
    });
}

function verifyDocumented(file, complete) {
    fs.stat(file, function (e, stats) {
        if (e) {
            complete(e);
        }
        if (stats.size === 0) {
            const origFile = '.' + file.replace(/[.]md$/, '.js').slice(documentationDest.length);
            console.warn('Verify: ' + origFile + ' has no documentation. ' + //eslint-disable-line no-console
                'Consider adding documentation for this file.');
            return fs.unlink(file, complete);
        }
        complete();
    });
}

function verifySourceExists(file, complete) {
    const origFile = '.' + file.replace(/[.]md$/, '.js').slice(documentationDest.length);
    fs.stat(origFile, (e) => {
        if (e) {
            console.warn('Verify: ' + origFile + ' has been removed. ' + //eslint-disable-line no-console
                'Removing Documentation.');
            return fs.unlink(file, complete);
        }
        complete();
    });
}

function verifyDocumentation(complete) {
    glob(documentationDest + '/**/*.md', (e, files) => {
        async.each(files, (file, next) => {
            verifyDocumented(file, () => verifySourceExists(file, next));
        }, complete);
    });
}


function generateDocs(complete) {
    glob(documentableFiles, (e, files) => {
        async.each(files, processFile, complete);
    });
}

generateDocs(() => verifyDocumentation(() => 0));
