'use strict';

const request = require('request');
const spawn = require('child_process').spawn;

/*eslint-disable require-jsdoc */
function getBuild(buildId) {
    return new Promise((resolve, reject) => {
        request.get(`https://api.travis-ci.org/builds/${buildId}`, (err, _, data) => err ? reject(err) : resolve(data));
    }).then((data) => JSON.parse(data));
}

function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function launchNPMTask(task) {
    return new Promise((resolve, reject) => {
        const npm = spawn('npm', ['run', task]);
        npm.stdout.pipe(process.stdout);
        npm.stderr.pipe(process.stderr);
        npm.on('close', (code) => {
            if (code) {
                reject(`NPM task exited with status code of ${code}`);
            } else {
                resolve();
            }
        });
    });
}

function waitUntilDone(buildId, ms) {
    let cycle = -1,
        waitingFor = 0;
    return getBuild(buildId).then((build) => {
        const jobs = build.matrix.filter((job) => !/[.]1$/.test(job.number));
        const finished = jobs.every((job) => job.finished_at);
        const failed = jobs.some((job) => (job.result || 0) !== 0);
        const runningJobs = jobs.filter((job) => !job.finished_at);
        if (failed) {
            return Promise.reject('E_BUILD_FAILED');
        } else if (finished) {
            return Promise.resolve();
        }
        if (cycle % 6 === 0 || waitingFor !== runningJobs) {
            console.log(`Leader waits for ${runningJobs.length} minions...`); //eslint-disable-line no-console
        }
        cycle += 1;
        waitingFor = runningJobs;
        return delay(ms).then(() => waitUntilDone(buildId, ms));

    });
}

const travisBuildId = process.env.TRAVIS_BUILD_ID, //eslint-disable-line no-process-env
    travisJobNumber = process.env.TRAVIS_JOB_NUMBER, //eslint-disable-line no-process-env
    npmTask = process.argv[2];
if (!travisJobNumber) {
    console.log('This is not a CI build.'); //eslint-disable-line no-console
    launchNPMTask(npmTask);
} else if (!/[.]1/.test(travisJobNumber)) {
    console.log('This is a minion.'); //eslint-disable-line no-console
} else {
    console.log('This is a leader.'); //eslint-disable-line no-console
    waitUntilDone(travisBuildId, 5 * 1000).then(() => launchNPMTask(npmTask));
}
