'use strict';

/* eslint-disable require-jsdoc */

const fs = require('fs'),
    jsdoc2md = require('jsdoc-to-markdown'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    glob = require('glob');

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
            jsdoc2md.render({
                files: [toDoc]
            }).then((docs) => {
                fs.writeFile(dest.path, docs, 'utf8', (err2) => {
                    if (err) {
                        return reject(err2);
                    }
                    return resolve(dest.path);
                });
            });
        });
    });
}

function verifyDocument(file) {
    return new Promise((resolve, reject) => {
        fs.stat(file, (err, stats) => {
            if (err) {
                return reject(err);
            }
            return git.add(file, () => {
                const origFile = `.${file.replace(/[.]md$/, '.js').slice(docDest.length)}`;
                if (stats.size === 0) {
                    console.warn(`${origFile} has no jsdocs, please add some?`); //eslint-disable-line no-console
                    return removeStale(origFile).then(resolve, reject);
                }
                return resolve();
            });
        });
    });
}

function removeStale(file) {
    return new Promise((resolve, reject) => {
        const dest = getDestination(file).path;
        git.rm([dest], (err) => {
            if (err) {
                fs.unlink(dest, (err2) => err2 ? reject(err2) : resolve());
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


const args = process.argv.slice();
args.shift();
args.shift();

let targets;
if (!args.length) {
    targets = getChanges(/[.]js$/i);
} else {
    targets = Promise.all(args.map((arg) => new Promise((res, rej) => glob(arg, (err, files) => {
        if (err) {
            return rej(err);
        }
        return res(files);
    }))))
    .then((res) => res.reduce((acc, val) => acc.concat(val), []));
}

targets.then((files) => Promise.all(files.map((file) => processFile(file))))
    .then(commitDocs)
    .then(() => console.log('Documentation Built')) //eslint-disable-line no-console
    .catch((err) => console.log(err)); //eslint-disable-line no-console
