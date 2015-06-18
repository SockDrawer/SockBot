'use strict';
const gulp = require('gulp'),
    gulpJsdoc2md = require('gulp-jsdoc-to-markdown'),
    rename = require('gulp-rename'),
    istanbul = require('gulp-istanbul'),
    istanbulHarmony = require('istanbul-harmony'),
    mocha = require('gulp-mocha'),
    eslint = require('gulp-eslint'),
    git = require('gulp-git'),
    concat = require('gulp-concat');

const sockFiles = ['*.js', '!./gulpfile.js', 'plugins/**/*.js'],
    sockDocs = ['README.md', 'docs/**/*.md'],
    sockTests = ['test/**/*.js'],
    sockReadme = ['docs/badges.md.tmpl', 'docs/index.md', 'docs/Special Thanks.md'];

const JobNumber = process.env.TRAVIS_JOB_NUMBER,
    runDocs = !!JobNumber || /[.]1$/.test(JobNumber);

gulp.task('readme', () => {
    gulp.src(sockReadme)
        .pipe(concat('README.md'))
        .pipe(gulp.dest('.'));
});

gulp.task('docs', ['gitBranch'], function (done) {
    if (!runDocs) {
        return done();
    }
    gulp.src(sockFiles)
        .pipe(gulpJsdoc2md({}))
        .on('error', done)
        .pipe(rename((path) => {
            path.extname = '.md';
        }))
        .pipe(gulp.dest('docs/api'))
        .on('finish', done);
});

gulp.task('lint', (done) => {
    gulp.src(sockFiles)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .on('error', done);
});

gulp.task('gitConfig', (done) => {
    if (!JobNumber) {
        return done();
    }
    git.exec({
        args: 'config user.name "Travis-CI"'
    }, () => {
        git.exec({
            args: 'config user.email "Travis-CI@servercooties.com"'
        }, () => {
            done();
        });
    });
});

gulp.task('gitBranch', (done) => {
    let complete = false;
    if (!runDocs) {
        return done();
    }
    const branch = process.env.TRAVIS_BRANCH;
    if (!branch) {
        return done();
    }
    git.checkout(branch, () => {
        git.pull('origin', branch, () => {
            complete || done();
            complete = true;
        });
    });
});

gulp.task('commitDocs', (done) => {
    gulp.src(sockDocs)
        .pipe(git.add())
        .pipe(git.commit('Automatically push updated documentation'))
        .on('error', (err) => {
            if (err) {
                console.log(err); //eslint-disable-line no-console
            }
        })
        .on('finish', done);
});
gulp.task('pushDocs', ['gitConfig', 'commitDocs'], (done) => {
    if (!runDocs) {
        return done();
    }
    const username = process.env.GITHUB_USERNAME,
        token = process.env.GITHUB_TOKEN;
    git.addRemote('github', 'https://' + username + ':' + token +
        '@github.com/SockDrawer/SockBot.git', (e) => {
            if (e) {
                console.log(e); //eslint-disable-line no-console
            }
            git.push('github', 'es6-dev', {
                args: ['-q']
            }, (err) => {
                if (err) {
                    console.log(err); //eslint-disable-line no-console
                }
                done();
            });
        });
});

gulp.task('test', (done) => {
    gulp.src(sockFiles).pipe(istanbul({
            instrumenter: istanbulHarmony.Instrumenter
        }))
        .pipe(istanbul.hookRequire())
        .on('finish', () => {
            gulp.src(sockTests)
                .pipe(mocha())
                .pipe(istanbul.writeReports())
                .on('finish', done);
        });
});

gulp.task('buildDocs', ['readme', 'docs'], () => 0);
gulp.task('preBuild', ['buildDocs', 'lint'], () => 0);
gulp.task('postBuild', ['pushDocs'], () => 0);
gulp.task('default', ['lint'], () => 0);