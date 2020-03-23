var gulp = require('gulp');
var uglify = require('gulp-uglify');

gulp.task('default', function(){
  return gulp.src('node_modules/besom/src/index.js','src/index.js')
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
