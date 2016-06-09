'use strict';

/* eslint-disable require-jsdoc */

const fs = require('fs'),
    dmd = require('dmd'),
    jsdoc = require('jsdoc-parse'),
    mkdirp = require('mkdirp'),
    path = require('path');

const git = require('simple-git')('.');

const docDest = path.join('docs', 'api');

function getChanges(filter) {
    return new Promise((resolve, reject) => {
        git.log({
            from: 'HEAD~1',
            to: 'HEAD'
        }, (logErr, logData) => {
            if (logErr) {
                reject(logErr);
            } else {
                git.show([logData.latest.hash], (err, diff) => {
                    if (err) {
                        reject(err);
                    } else {
                        const files = {};
                        diff.split('\n').map((line) => {
                            const file = /^diff --git a\/(.*) b\/(.*)/.exec(line);
                            if (file && file[1] === file[2]) {
                                files[file[1]] = 1;
                            }
                        });
                        resolve(Object.keys(files).filter((file) => filter.test(file)));
                    }
                });
            }
        });
    });
}

function getDestination(file) {
    const dir = path.join(docDest, path.dirname(file)),
        name = `${path.basename(file, '.js') }.md`,
        dest = path.join(dir, name);
    return {
        target: file,
        dir: dir,
        name: name,
        path: dest
    };
}

function documentPath(toDoc) {
    return new Promise((resolve, reject) => {
        const dest = getDestination(toDoc);
        mkdirp(dest.dir, (err) => {
            if (err) {
                reject();
            }
            try {
                const inFile = fs.createReadStream(toDoc);
                const outFile = fs.createWriteStream(dest.path);
                inFile.pipe(jsdoc()).pipe(dmd()).pipe(outFile);
                inFile.on('error', (ioerr) => reject(ioerr));
                outFile.on('error', (ioerr) => reject(ioerr));
                outFile.on('finish', () => resolve(dest.path));
            } catch (err2) {
                reject(err2);
            }
        });
    });
}

function verifyDocument(file) {
    return new Promise((resolve, reject) => {
        fs.stat(file, (err, stats) => {
            if (err) {
                return reject(err);
            }
            const origFile = `.${file.replace(/[.]md$/, '.js').slice(docDest.length)}`;
            if (stats.size === 0) {
                console.warn(`${origFile} has no jsdocs, please consider adding some`); //eslint-disable-line no-console
                return removeStale(origFile).then(resolve, reject);
            }
            return git.add(file, () => resolve());
        });
    });
}

function removeStale(file) {
    return new Promise((resolve) => {
        const dest = getDestination(file).path;
        git.silent(true).rm(dest, (err) => {
            if (err) {
                fs.unlink(dest, () => resolve());
            } else {
                resolve();
            }
        });
    });
}

function processFile(file) {
    return documentPath(file).then((dest) => {
        return verifyDocument(dest);
    }, (err) => {
        if (err.code === 'ENOENT') {
            return removeStale(file);
        }
        throw err;
    });
}

function commitDocs() {
    return new Promise((resolve, reject) => {
        git.commit(['docs: Update API Documentation'], (err) => err ? reject(err) : resolve());
    });
}

getChanges(/[.]js$/i)
    .then((files) => Promise.all(files.map((file) => processFile(file))))
    .then(commitDocs)
    .then(() => console.log('Documentation Built')) //eslint-disable-line no-console
    .catch((err) => console.log(err)); //eslint-disable-line no-console
