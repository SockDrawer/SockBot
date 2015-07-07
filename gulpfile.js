'use strict';
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    gulpJsdoc2md = require('gulp-jsdoc-to-markdown'),
    rename = require('gulp-rename'),
    istanbul = require('gulp-istanbul'),
    mocha = require('gulp-mocha'),
    eslint = require('gulp-eslint'),
    git = require('gulp-git');

var sockFiles = ['*.js', '!./gulpfile.js', 'sock_modules/**/*.js'],
    sockDocs = ['README.md', 'docs/**/*.md'],
    sockTests = ['tests/**/*.js'];
    
var JobNumber = process.env.TRAVIS_JOB_NUMBER,
    runDocs = !JobNumber || /[.]1$/.test(JobNumber);

/**
 * Generate API documentation for all js files, place markup in the correct folder for readthedocs.org
 */
gulp.task('docs', function (done) {
    // Abort(successfully) early if running in CI and not job #1
    if (!runDocs) {
        return done();
    }
    gulp.src(sockFiles)
        .pipe(gulpJsdoc2md({}))
        .on('error', done)
        .pipe(rename(function (path) {
            path.extname = '.md';
        }))
        .pipe(gulp.dest('docs/api'))
        .on('finish', done);
});

/**
 * Run all js files through eslint and report status.
 */
gulp.task('lint', function () {
    return gulp.src(sockFiles)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

/**
 * Run all tests through eslint and report status.
 */
gulp.task('lintTests', function () {
    return gulp.src(sockTests)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

/**
 * Set git username/email to CI user
 */
gulp.task('gitConfig', function (done) {
    // Abort(successfully) early if not running in CI
    if (!JobNumber) {
        return done();
    }
    git.exec({
        args: 'config user.name "Travis-CI"'
    }, function () {
        git.exec({
            args: 'config user.email "Travis-CI@servercooties.com"'
        }, function () {
            done();
        });
    });
});

/**
 * Commit generated documentation to be picked up by readthedocs.org
 *
 * Add CI tag to commit to prevent CI jobs from being created by checking in docs
 */
gulp.task('commitDocs', ['gitConfig'], function () {
    return gulp.src(sockDocs)
        .pipe(git.add())
        .pipe(git.commit('Automatically push updated documentation [ci skip]'));
});

/**
 * Commit and push docs to github to be picked up by readthedocs.org
 */
gulp.task('pushDocs', ['gitConfig', 'commitDocs'], function (done) {
    //Abort(successfully) early if running in CI and not job #1
    if (!runDocs) {
        return done();
    }
    git.addRemote('github', 'https://github.com/SockDrawer/SockBot.git',
        function (e) {
            if (e) {
                return done();
            } else {
                git.push('github', 'HEAD', {
                    args: ['-q']
                }, function () {
                    done();
                });
            }
        });
});

/**
 * Run code coverage instrumented tests
 */
gulp.task('test', function(done) {
    gulp.src(sockFiles)
        // Instrument code files with istanbulHarmony
        .pipe(istanbul())
        // hook require function for complete code coverage
        .pipe(istanbul.hookRequire())
        .on('finish', function() {
            // Run all tests
            gulp.src(sockTests)
                .pipe(mocha())
                // Write code coverage reports
                .pipe(istanbul.writeReports())
                .on('end', done);
        });
});

// Meta tasks
gulp.task('buildDocs', ['docs'], function () {});
gulp.task('preBuild', ['buildDocs'], function () {});
gulp.task('postBuild', ['pushDocs'], function () {});
gulp.task('default', ['lint', 'lintTests'], function () {});
