/*jslint node: true */
'use strict';

var tinylr;
var gulp = require('gulp');

gulp.task('livereload', function () {
  tinylr = require('tiny-lr')();
  tinylr.listen(4002);
});

function notifyLiveReload(event) {
  var fileName = require('path').relative(__dirname, event.path);

  tinylr.changed({
    body: {
      files: [fileName]
    }
  });
}

gulp.task('watch', function () {
  gulp.watch('public/angular/*', notifyLiveReload);
  gulp.watch('public/angular-admin/*', notifyLiveReload);
  gulp.watch('views/**/*', notifyLiveReload);
  gulp.watch('views/*', notifyLiveReload);
});

gulp.task('default', ['livereload', 'watch'], function () {
});