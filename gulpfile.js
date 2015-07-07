'use strict';
const gulp = require('gulp'),
    gutil = require('gulp-util'),
    gulpJsdoc2md = require('gulp-jsdoc-to-markdown'),
    rename = require('gulp-rename'),
    istanbul = require('gulp-istanbul'),
    istanbulHarmony = require('istanbul-harmony'),
    mocha = require('gulp-mocha'),
    eslint = require('gulp-eslint'),
    git = require('gulp-git'),
    concat = require('gulp-concat');

const exec = require('child_process').exec,
    fs = require('fs');

const sockFiles = ['*.js', '!./gulpfile.js', '**/plugins/**/*.js', '!node_modules/**'],
    sockExterns = ['**/external/**/*.js'],
    sockDocs = ['README.md', 'docs/**/*.md'],
    sockTests = ['test/**/*.js'],
    sockReadme = ['docs/badges.md.tmpl', 'docs/index.md', 'docs/Special Thanks.md', 'docs/contributors.md'],
    sockContribs = ['docs/contributors.md.tmpl', 'docs/contributors.table.md.tmpl'];

const JobNumber = process.env.TRAVIS_JOB_NUMBER,
    runDocs = !JobNumber || /[.]1$/.test(JobNumber);

/**
 * Read git log to get a up to date list of contributors
 *
 * Output to a template file that's used to generate contributors.md
 */
gulp.task('buildContribs', ['gitBranch'], (done) => {
    exec('git shortlog -ns < /dev/tty', (err, out) => {
        if (err) {
            return done(err);
        }
        let res = out.replace(/^\s+/gm, '').split('\n').filter((i) => !!i).map((i) => {
            let j = i.split('\t');
            return '| ' + j[1] + ' | ' + j[0] + ' |';
        }).join('\n');
        fs.writeFile('docs/contributors.table.md.tmpl',
            '| Contributor | Commits |\n|---|---:|\n' + res, (err) => done(err));
    });
});

/**
 * Generate docs/contributors.md
 */
gulp.task('contribs', ['buildContribs'], () => {
    return gulp.src(sockContribs)
        .pipe(concat('contributors.md'))
        .pipe(gulp.dest('docs/'));
});

/**
 * Generate README.md.
 *
 * Generate document by concatenating badges.md.tmpl, index.md, and Special Thanks.md from docs/
 */
gulp.task('readme', ['contribs'], (done) => {
    return gulp.src(sockReadme)
        .pipe(concat('README.md'))
        .pipe(gulp.dest('.'));
});

/**
 * Generate API documentation for all js files, place markup in the correct folder for readthedocs.org
 */
gulp.task('docs', ['gitBranch', 'lintExterns'], function (done) {
    // Abort(successfully) early if running in CI and not job #1
    if (!runDocs) {
        return done();
    }
    gulp.src(sockFiles.concat(sockExterns))
        .pipe(gulpJsdoc2md({}))
        .on('error', done)
        .pipe(rename((path) => {
            path.extname = '.md';
        }))
        .pipe(gulp.dest('docs/api'))
        .on('finish', done);
});

/**
 * Run all js files through eslint and report status.
 */
gulp.task('lint', (done) => {
    return gulp.src(sockFiles)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});
/**
 * Run all js files through eslint and report status.
 */
gulp.task('lintExterns', (done) => {
    return gulp.src(sockExterns)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

/**
 * Run all tests through eslint and report status.
 */
gulp.task('lintTests', (done) => {
    return gulp.src(sockTests)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

/**
 * Set git username/email to CI user
 */
gulp.task('gitConfig', (done) => {
    // Abort(successfully) early if not running in CI
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

/**
 * Pull git branch locally (solves detached head issue in CI)
 */
gulp.task('gitBranch', (done) => {
    // Abort(successfully) early if not running in CI
    if (!JobNumber) {
        return done();
    }
    let complete = false;
    if (!runDocs) {
        return done();
    }
    const branch = process.env.TRAVIS_BRANCH;
    if (!branch) {
        return done();
    }
    git.checkout(branch, () => {
        // Make sure we have full log history.
        git.pull('origin', branch, {
            args: '--unshallow'
        }, () => {
            if (!complete) {
                done();
            }
            complete = true;
        });
    });
});

/**
 * Commit generated documentation to be picked up by readthedocs.org
 *
 * Add CI tag to commit to prevent CI jobs from being created by checking in docs
 */
gulp.task('commitDocs', ['gitConfig'], (done) => {
    gulp.src(sockDocs)
        .pipe(git.add())
        .pipe(git.commit('Automatically push updated documentation [ci skip]'))
        .on('error', () => 0)
        .on('finish', done);
});

/**
 * Commit and push docs to github to be picked up by readthedocs.org
 */
gulp.task('pushDocs', ['gitConfig', 'commitDocs'], (done) => {
    //Abort(successfully) early if running in CI and not job #1
    if (!runDocs) {
        return done();
    }
    git.addRemote('github', 'https://github.com/SockDrawer/SockBot.git', (e) => {
        if (e) {
            done();
        } else {
            git.push('github', 'HEAD', {
                args: ['-q']
            }, () => {
                done();
            });
        }
    });
});

/**
 * Run code coverage instrumented tests
 */
gulp.task('test', ['lint', 'lintTests'], (done) => {
    gulp.src(sockFiles)
        // Instrument code files with istanbulHarmony
        .pipe(istanbul({
            instrumenter: istanbulHarmony.Instrumenter
        }))
        // hook require function for complete code coverage
        .pipe(istanbul.hookRequire())
        .on('finish', () => {
            // Run all tests
            gulp.src(sockTests)
                .pipe(mocha({
                    reporter: 'dot'
                }))
                .on('error', done)
                // Write code coverage reports
                .pipe(istanbul.writeReports())
                .on('finish', done);
        });
});

// Meta tasks
gulp.task('buildDocs', ['readme', 'docs'], () => 0);
gulp.task('preBuild', ['buildDocs'], () => 0);
gulp.task('postBuild', ['pushDocs'], () => 0);
gulp.task('default', ['lint'], () => 0);
gulp.task('lintAll', ['lint', 'lintExterns'], () => 0);