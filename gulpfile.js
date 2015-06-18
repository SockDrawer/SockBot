'use strict';
const gulp = require('gulp'),
    gulpJsdoc2md = require('gulp-jsdoc-to-markdown'),
    rename = require('gulp-rename'),
    istanbul = require('gulp-istanbul'),
    istanbulHarmony = require('istanbul-harmony'),
    mocha = require('gulp-mocha'),
    eslint = require('gulp-eslint'),
    git = require('gulp-git');

const sockFiles = ['*.js', 'plugins/**/*.js'],
    sockDocs = ['README.md', 'docs/**/*.md'],
    sockTests = ['test/**/*.js'];
gulp.task('docs', function (done) {
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

gulp.task('pushdocs', (done) => {
    const username = process.env.GITHUB_USERNAME,
        token = process.env.GITHUB_TOKEN;
    gulp.src(sockDocs)
        .pipe(git.add())
        .pipe(git.commit('Automatically push updated documentation'))
        .on('error', () => done())
        .pipe(git.addRemote('github', 'https://' + username + ':' + token +
            '@github.com/SockDrawer/SockBot.git', (e) => {
                if (e) {
                    console.log(e); //eslint-disable-line no-console
                }
                git.push('github', 'es6-dev');
            }))
        .on('error', done);
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
