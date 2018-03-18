'use strict';

var gulp = require('gulp'),
  runSequence = require('run-sequence'),
  nunjucksRender = require('gulp-nunjucks-render'),
  htmlmin = require('gulp-htmlmin'),
  clean = require('gulp-clean'),
  pump = require('pump'),
  connect = require('gulp-connect'),
  watch = require('gulp-watch'),
  gulpAmpValidator = require('gulp-amphtml-validator'),
  open = require('gulp-open');

var config = {
  port: 8000,
  sourceFolder: 'src',
  distFolder: 'dist'
};

gulp.task('development', ['webserver', 'watch', 'build', 'openBrowser'], function () {
});

gulp.task('webserver', function () {
  return connect.server({
    root: ['./' + config.distFolder],
    livereload: true,
    port: config.port,
    host: '0.0.0.0'
  });
});

gulp.task('watch', function () {
  gulp.watch(config.sourceFolder + '/**/*', ['build']);
  watch('./' + config.distFolder).pipe(connect.reload());
});

gulp.task('openBrowser', function(){
  return gulp.src(__filename)
    .pipe(open({uri: 'http://localhost:' + config.port}));
});

gulp.task('build', function () {
  runSequence('clean', 'renderTemplates', 'copyImages', 'minifyFiles', function () {
  });
});

gulp.task('clean', function () {
  return gulp.src(config.distFolder, {read: false, force: true})
    .pipe(clean());
});

gulp.task('renderTemplates', function () {
  return gulp.src([config.sourceFolder + '/*.+(html|nunjucks)'])
    .pipe(nunjucksRender({path: [config.sourceFolder]}))
    .pipe(gulp.dest(config.distFolder));
});

gulp.task('copyImages', function () {
  return gulp.src([config.sourceFolder + '/assets/img/**/*'])
    .pipe(gulp.dest(config.distFolder + '/assets/img'));
});

gulp.task('minifyFiles', function (cb) {
  setTimeout(function (cb) {
    pump([
      gulp.src(config.distFolder + '/*.html'),
      htmlmin(
        {
          collapseWhitespace: true,
          processScripts: ['application/ld+json'],
          removeComments: true,
          minifyCSS: true,
          minifyJS: false
        }
      ),
      gulp.dest(config.distFolder)
    ], cb);
  }, 100)
});

gulp.task('validateHTML', function() {
  return gulp.src('dist/**/*.html')
    .pipe(gulpAmpValidator.validate())
    .pipe(gulpAmpValidator.format())
    .pipe(gulpAmpValidator.failAfterError());
});
