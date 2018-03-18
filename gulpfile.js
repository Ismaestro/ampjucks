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
  open = require('gulp-open'),
  sass = require('gulp-sass'),
  rename = require('gulp-rename');

var config = {
  port: 8000,
  sourceFolder: 'src',
  distFolder: 'dist'
};

gulp.task('development', function (done) {
  runSequence('webserver', 'watch', 'build', 'openBrowser', function () {
    done();
  });
});

gulp.task('webserver', function () {
  connect.server({
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

gulp.task('build', function (done) {
  runSequence('clean', 'sass', 'renderTemplates', 'copyImages', 'removeCss', function () {
    done()
  });
});

gulp.task('clean', function () {
  return gulp.src(config.distFolder, {read: false, force: true})
    .pipe(clean());
});

gulp.task('sass', function () {
  return gulp.src(config.sourceFolder + '/templates/sass/**/*.scss')
    .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(rename(function (path) {
      path.basename = "_" + path.basename;
    }))
    .pipe(gulp.dest(config.sourceFolder + '/templates/css/'));
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

gulp.task('removeCss', function () {
  return gulp.src(config.sourceFolder + '/templates/css', {read: false, force: true})
    .pipe(clean());
});

gulp.task('validateHTML', function() {
  return gulp.src('dist/**/*.html')
    .pipe(gulpAmpValidator.validate())
    .pipe(gulpAmpValidator.format())
    .pipe(gulpAmpValidator.failAfterError());
});
