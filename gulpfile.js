const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');

function browsersync() {
  browserSync.init({
    server: { baseDir: 'app/' },
    notify: false,
    online: true
  })
}

function scripts() {
  return src(['app/js/script.js'])
  .pipe(concat('script.min.js'))
  .pipe(uglify())
  .pipe(dest('app/js/'))
  .pipe(browserSync.stream())
}

function styles() {
  return src('app/sass/**/*.+(scss|sass)')
  .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
  .pipe(concat('style.min.css'))
  .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
  .pipe(cleancss({ level: { 1: { specialComments: 0 }}}))
  .pipe(dest('app/css/'))
  .pipe(browserSync.stream())
}

function img() {
  return src('app/img/src/**/*')
  .pipe(newer('app/img/dest'))
  .pipe(imagemin())
  .pipe(dest('app/img/dest/'))
}

function cleanimg() {
  return del('app/img/dest/**/*', { force: true});
}

function cleandist() {
  return del('dist/**/*', { force: true});
}

function buildCopy() {
  return src([
    'app/css/**/*.min.css',
    'app/js**/*.min.js',
    'app/img/dest/**/*',
    'app/**/*.html'
  ], { base: 'app' })
  .pipe(dest('dist'))
}

function startWatch() {
  watch('app/sass/**/*.+(scss|sass)', styles);
  watch(['app/**/*.js','!app/**/*.min.js'], scripts);
  watch('app/**/*.html').on('change', browserSync.reload);
  watch('app/img/src/**/*', img);
}

exports.browsersync = browsersync;
exports.scripts     = scripts;
exports.styles      = styles;
exports.img         = img;
exports.cleanimg    = cleanimg;
exports.cleandist   = cleandist;
exports.build       = series(cleandist, styles, scripts, img, buildCopy);
exports.default     = parallel(styles, scripts, browsersync, startWatch);
