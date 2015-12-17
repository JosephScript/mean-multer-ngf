var gulp = require('gulp');

var paths = {
  vendor: ['node_modules/angular/angular.min.js',
    'node_modules/ng-file-upload/dist/ng-file-upload-all.min.js'],
  dest: 'public/vendor/'
};

gulp.task('copy-vendor', [], function () {
  // move vendor scripts
  return gulp.src(paths.vendor)
    .pipe(gulp.dest(paths.dest));
});

gulp.task('default', ['copy-vendor'], function () {
});