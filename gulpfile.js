var gulp = require("gulp");
var babel = require("gulp-babel");

gulp.task("compile", function () {
  return gulp.src('server/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest("dist"));
});

gulp.task("compile-tests", function () {
  return gulp.src('tests/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest("dist-tests"));
});
