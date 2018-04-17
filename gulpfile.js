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
  sitemap = require('gulp-sitemap'),
  sass = require('gulp-sass');

var config = {
  url: 'http://localhost',
  port: 8000,
  defaultLanguage: 'en'
};

gulp.task('development', function (done) {
  runSequence('browser-sync', 'watch', 'build', 'openBrowser', function () {
    done();
  });
});

gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: 'dist'
    },
    port: config.port,
    ui: false,
    open: false
  });
});

gulp.task('watch', function () {
  gulp.watch('src/**/*', ['build']);
});

gulp.task('openBrowser', function () {
  return gulp.src(__filename)
    .pipe(open({uri: 'http://localhost:' + config.port + '/' + config.defaultLanguage + '/'}));
});

gulp.task('build', function (done) {
  runSequence('clean', 'sass', 'renderTemplates', 'minifyFiles', 'copyAssets', 'sitemap', function () {
    console.log(new Date().toLocaleTimeString() + " - Build finished");
    browserSync.reload();
    done();
  });
});

gulp.task('clean', function () {
  return del(['dist']);
});

gulp.task('sass', function () {
  return gulp.src('src/**/*.scss')
    .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(rename({dirname: ''}))
    .pipe(gulp.dest('src/sass/css/'));
});

gulp.task('renderTemplates', function () {
  return gulp.src(['src/templates/pages/**/!(*.content)*.+(html|nunjucks)'],
    {base: "src/templates"})
    .pipe(nunjucksRender({
      path: ['src'],
      envOptions: { // This is to avoid having conflicts with Mustache used in AMP in amp-list component e.g.
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
    .pipe(gulp.dest('dist'));
});

gulp.task('copyAssets', function () {
  return gulp.src(['src/assets/**/*'])
    .pipe(gulp.dest('dist/assets/'));
});

gulp.task('minifyFiles', function () {
  return gulp.src('dist/**/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'));
});

gulp.task('removeCss', function () {
  return del(['src/css']);
});

gulp.task('sitemap', function () {
  return gulp.src('dist/**/*.html', {
      read: false
    })
    .pipe(sitemap({
      siteUrl: config.url + ':' + config.port
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('validateHTML', function () {
  return gulp.src('dist/**/*.html')
    .pipe(gulpAmpValidator.validate())
    .pipe(gulpAmpValidator.format())
    .pipe(gulpAmpValidator.failAfterError());
});
