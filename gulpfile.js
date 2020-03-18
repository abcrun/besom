var gulp = require('gulp');
var uglify = require('gulp-uglify');

gulp.task('default', function(){
  return gulp.src('src/index.js')
    .pipe(
      uglify({
        mangle: true,
        compress: true,
        output: {
          comments:/@license/
        }
      })
    ).pipe(gulp.dest('dist'));
})
