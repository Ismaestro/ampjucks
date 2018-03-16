'use strict';

var gulp = require('gulp'),
  nunjucksRender = require('gulp-nunjucks-render'),
  htmlmin = require('gulp-htmlmin'),
  clean = require('gulp-clean'),
  pump = require('pump'),
  sourceFolder = 'src',
  distFolder = 'dist';

gulp.task('default', function () {
  return gulp.src(distFolder, {read: false, force: true})
    .pipe(clean());
});

gulp.task('nunjucksRender', function () {
  gulp.src([sourceFolder + '/*.+(html|nunjucks)'])
    .pipe(nunjucksRender({path: [sourceFolder]}))
    .pipe(gulp.dest(distFolder));
});

gulp.task('copySourceFolder', function () {
  gulp.src([sourceFolder + '/assets/img/**/*'])
    .pipe(gulp.dest(distFolder + '/assets/img'));
});

gulp.task('minifyFiles', function (cb) {
  setTimeout(function (cb) {
    pump([
      gulp.src(distFolder + '/*.html'),
      htmlmin(
        {
          collapseWhitespace: true,
          processScripts: ['application/ld+json'],
          removeComments: true,
          minifyCSS: true,
          minifyJS: false
        }
      ),
      gulp.dest(distFolder)
    ], cb);
  }, 100)
});

gulp.task('build', ['default', 'nunjucksRender', 'copySourceFolder', 'minifyFiles'], function () {
});