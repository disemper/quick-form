const gulp = require('gulp'),
  terser = require('gulp-terser'),
  browserSync = require('browser-sync').create();


const jsFiles = [
  './src/js/jquery-3.4.0.min.js',
  './src/js/**/*.js',
];

function scripts() {
  return gulp.src(jsFiles)
      .pipe(terser())
      .pipe(gulp.dest('./build/js'))
      .pipe(browserSync.stream())
}

function html() {
  return gulp.src('./src/**/*.html')
      .pipe(gulp.dest('./build'));
}

function watch() {
  browserSync.init({
    server: {
      baseDir: "./build/",
      index: "index.html"
    }
  });

  gulp.watch('./src/**/*.js').on('change', gulp.series(scripts, browserSync.reload));
  gulp.watch('./src/**/*.html').on('change', gulp.series(html, browserSync.reload));
}

exports.scripts = scripts;
exports.watch = watch;
exports.build = gulp.series(html, scripts);
exports.dev = gulp.series(exports.build, watch);
