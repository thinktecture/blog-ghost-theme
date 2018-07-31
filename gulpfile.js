const gulp = require('gulp'),
  plumber = require('gulp-plumber'),
  sass = require('gulp-sass'),
  tildeImporter = require('node-sass-tilde-importer'),
  postCss = require('gulp-postcss'),
  autoprefixer = require('autoprefixer'),
  cleanCss = require('postcss-clean'),
  rename = require('gulp-rename'),
  runSequence = require('run-sequence'),
  del = require('del'),
  watch = require('gulp-watch'),
  batch = require('gulp-batch'),
  browserSync = require('browser-sync');

const createStylesPipe = sources => sources
  .pipe(plumber())
  .pipe(sass({ importer: [tildeImporter] }).on('error', sass.logError))
  .pipe(postCss([
    autoprefixer({ browsers: ['last 2 versions'] }),
    cleanCss(),
  ]))
  .pipe(rename('main.css'))
  .pipe(gulp.dest('./theme/assets/css'))
  .pipe(browserSync.stream({ match: '**/*.css' }));

gulp.task('clean', () => del('./theme'));

gulp.task('styles', () => createStylesPipe(gulp.src('./src/styles/main.scss')));

gulp.task('copy:template', () =>
  gulp.src([
    './src/package.json',
    './src/**/*.hbs',
  ])
    .pipe(gulp.dest('./theme')),
);

gulp.task('copy:assets', () =>
  gulp.src('./src/assets/**/*')
    .pipe(gulp.dest('./theme/assets')),
);

gulp.task('watch:init', done => browserSync.init({
  ghostMode: false,
  open: true,
  proxy: 'http://localhost:2368/',
  reloadDelay: 2000
}, done));

gulp.task('watch:styles', () => watch('./src/styles/**/*', batch((events, done) => runSequence('styles', done))));
gulp.task('watch:copy:template', () => watch('./src/**/*.hbs', batch((events, done) => runSequence('copy:template', done))));
gulp.task('watch:copy:assets', () => watch('./src/assets/**/*', batch((events, done) => runSequence('copy:assets', done))));

gulp.task('default', done => {
  runSequence(
    [
      'copy:template',
      'copy:assets',
      'styles',
    ],
    done,
  );
});

gulp.task('watch', done => {
  runSequence(
    'watch:init',
    [
      'watch:styles',
      'watch:copy:assets',
      'watch:copy:template',
    ],
    done,
  );
});
