'use strict';
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    gulpJsdoc2md = require('gulp-jsdoc-to-markdown'),
    rename = require('gulp-rename'),
    istanbul = require('gulp-istanbul'),
    mocha = require('gulp-mocha'),
    eslint = require('gulp-eslint'),
    git = require('gulp-git'),
    concat = require('gulp-concat');

var exec = require('child_process').exec,
    fs = require('fs');

var sockFiles = ['*.js', '!./gulpfile.js', 'sock_modules/**/*.js'],
    sockDocs = ['README.md', 'docs/**/*.md'],
    sockTests = ['tests/**/*.js'],
    sockReadme = ['docs/badges.md.tmpl', 'docs/index.md', 'docs/Special Thanks.md', 'docs/contributors.md'],
    sockContribs = ['docs/contributors.md.tmpl', 'docs/contributors.table.md.tmpl'];

var JobNumber = process.env.TRAVIS_JOB_NUMBER,
    runDocs = !JobNumber || /[.]1$/.test(JobNumber),
    logger = gutil.log;

/**
 * Read git log to get a up to date list of contributors
 *
 * Output to a template file that's used to generate contributors.md
 */
gulp.task('buildContribs', ['gitBranch'], function (done) {
    exec('git shortlog -ns < /dev/tty', function (err, out) {
        if (err) {
            return done(err);
        }
        var res = out.replace(/^\s+/gm, '').split('\n').filter(function (i) {
            return !!i;
        }).map(function (i) {
            var j = i.split('\t');
            return '| ' + j[1] + ' | ' + j[0] + ' |';
        }).join('\n');
        fs.writeFile('docs/contributors.table.md.tmpl',
            '| Contributor | Commits |\n|---|---:|\n' + res,
            function (err) {
                done(err);
            });
    });
});

/**
 * Generate docs/contributors.md
 */
gulp.task('contribs', ['buildContribs'], function () {
    return gulp.src(sockContribs)
        .pipe(concat('contributors.md'))
        .pipe(gulp.dest('docs/'));
});

/**
 * Generate README.md.
 *
 * Generate document by concatenating badges.md.tmpl, index.md, and Special Thanks.md from docs/
 */
gulp.task('readme', ['contribs'], function () {
    return gulp.src(sockReadme)
        .pipe(concat('README.md'))
        .pipe(gulp.dest('.'));
});

/**
 * Generate API documentation for all js files, place markup in the correct folder for readthedocs.org
 */
gulp.task('docs', ['gitBranch'], function (done) {
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
 * Pull git branch locally (solves detached head issue in CI)
 */
gulp.task('gitBranch', function (done) {
    // Abort(successfully) early if not running in CI
    if (!JobNumber) {
        return done();
    }
    if (!runDocs) {
        return done();
    }
    var branch = process.env.TRAVIS_BRANCH;
    if (!branch) {
        return done();
    }
    git.checkout(branch, function () {
        // Make sure we have full log history.
        git.pull('origin', branch, {
            args: '--unshallow'
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
    var username = process.env.GITHUB_USERNAME,
        token = process.env.GITHUB_TOKEN;
    // suppress output because sensitive things could get leaked
    // this could suppress other logging from parallel tasks.
    // that risk is deemed acceptable to prevent sensitive information leaking
    //gutil.log = function () {};
    git.addRemote('github', 'https://github.com/SockDrawer/SockBot.git',
        function (e) {
            if (e) {
                gutil.log = logger;
                return done();
            } else {
                git.push('github', 'HEAD', {
                    args: ['-q']
                }, function () {
                    //restore logging for the rest of the build
                    gutil.log = logger;
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
gulp.task('buildDocs', ['readme', 'docs'], function () {});
gulp.task('preBuild', ['buildDocs'], function () {});
gulp.task('postBuild', ['pushDocs'], function () {});
gulp.task('default', ['lint', 'lintTests'], function () {});
