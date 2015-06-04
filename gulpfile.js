var gulp = require("gulp");
var babel = require("gulp-babel");

gulp.task("compile", function () {
  return gulp.src('server/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest("dist"));
});
