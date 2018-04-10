'use strict';

var gulp = require('gulp'),
  runSequence = require('run-sequence'),
  nunjucksRender = require('gulp-nunjucks-render'),
  htmlmin = require('gulp-htmlmin'),
  del = require('del'),
  browserSync = require('browser-sync').create(),
  watch = require('gulp-watch'),
  gulpAmpValidator = require('gulp-amphtml-validator'),
  open = require('gulp-open'),
  rename = require('gulp-rename'),
  sass = require('gulp-sass');

var config = {
  port: 8000,
  sourceFolder: 'src',
  distFolder: 'dist',
  defaultLanguage: 'es',
  indexFileName: 'home.html'
};

gulp.task('development', function (done) {
  runSequence('browser-sync', 'watch', 'build', 'openBrowser', function () {
    done();
  });
});

gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: config.distFolder
    },
    port: config.port,
    ui: false,
    open: false
  });
});

gulp.task('watch', function () {
  gulp.watch(config.sourceFolder + '/**/*', ['build']);
});

gulp.task('openBrowser', function () {
  return gulp.src(__filename)
    .pipe(open({uri: 'http://localhost:' + config.port + '/' + config.defaultLanguage + '/' + config.indexFileName}));
});

gulp.task('build', function (done) {
  runSequence('clean', 'sass', 'renderTemplates', 'minifyFiles', 'copyAssets', function () {
    console.log(new Date().toLocaleTimeString() + " - Build finished");
    browserSync.reload();
    done();
  });
});

gulp.task('clean', function () {
  return del([config.distFolder]);
});

gulp.task('sass', function () {
  return gulp.src(config.sourceFolder + '/**/*.scss')
    .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(rename({dirname: ''}))
    .pipe(gulp.dest(config.sourceFolder + '/sass/css/'));
});

gulp.task('renderTemplates', function () {
  return gulp.src([config.sourceFolder + '/templates/pages/**/!(*.content)*.+(html|nunjucks)'],
    {base: "./src/templates"})
    .pipe(nunjucksRender({
      path: [config.sourceFolder],
      envOptions: {
        tags: {
          variableStart: '{$',
          variableEnd: '$}',
          commentStart: '<&',
          commentEnd: '&>'
        }
      }
    }))
    .pipe(rename(function (file) {
      file.dirname = file.dirname.substring(file.dirname.lastIndexOf("/") + 1);
      return file;
    }))
    .pipe(gulp.dest(config.distFolder));
});

gulp.task('copyAssets', function () {
  return gulp.src([config.sourceFolder + '/assets/**/*'])
    .pipe(gulp.dest(config.distFolder + '/assets/'));
});

gulp.task('minifyFiles', function () {
  return gulp.src(config.distFolder + '/**/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(config.distFolder));
});

gulp.task('removeCss', function () {
  return del([config.sourceFolder + '/css']);
});

gulp.task('validateHTML', function () {
  return gulp.src(config.distFolder + '/**/*.html')
    .pipe(gulpAmpValidator.validate())
    .pipe(gulpAmpValidator.format())
    .pipe(gulpAmpValidator.failAfterError());
});
