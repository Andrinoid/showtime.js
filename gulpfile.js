var gulp = require('gulp');
var babel = require('gulp-babel');
var watch = require('gulp-watch');
var umd = require('gulp-umd');

var del = require('del');
var browserSync = require('browser-sync').create();

gulp.task('default', ['clean', 'build', 'watch']);

gulp.task('build', ['babel']);

gulp.task('babel', function() {
	return gulp.src('src/*.js')
		.pipe(babel({
			presets: ['es2015']
		}))
        .pipe(umd())
		.pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
    del('static/js/**/*.js');
    del('static/css/**/*.css');

});

gulp.task('watch', ['browser-sync'], function() {
    gulp.watch('src/*.js', ['build']);
});

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
});