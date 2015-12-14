'use strict';

var through = require('through2');
var gulp = require('gulp');
var diff = require('./');
// var mocha = require('gulp-mocha');
// var istanbul = require('gulp-istanbul');
// var eslint = require('gulp-eslint');

// var lint = ['gulpfile.js', 'index.js', 'lib/*.js', 'test/*.js'];

function append(str) {
  return through.obj(function(file, enc, next) {
    file.contents = new Buffer(file.contents.toString() + str);
    next(null, file);
  });
}

function prepend(str) {
  return through.obj(function(file, enc, next) {
    file.contents = new Buffer(str + file.contents.toString());
    next(null, file);
  });
}

gulp.task('diff', function () {
  return gulp.src('fixtures/**/*')
    .pipe(diff.file('diffChars'))
    .pipe(append(' foo'))
    .pipe(diff.file())
    .pipe(append(' bar'))
    .pipe(diff.file())
    .pipe(append(' baz'))
    .pipe(diff.file())
    .pipe(through.obj(function(file, enc, next) {
      file.diff.compare(0, 3);
      next(null, file);
    }))
    .pipe(gulp.dest('actual/'));
});

// gulp.task('coverage', function () {
//   return gulp.src(lint)
//     .pipe(istanbul())
//     .pipe(istanbul.hookRequire());
// });

// gulp.task('mocha', ['coverage'], function () {
//   return gulp.src('test/*.js')
//     .pipe(mocha({reporter: 'spec'}))
//     .pipe(istanbul.writeReports());
// });

// gulp.task('eslint', function () {
//   return gulp.src(lint)
//     .pipe(eslint())
// });

// gulp.task('default', ['mocha', 'eslint']);
gulp.task('default', ['diff']);
