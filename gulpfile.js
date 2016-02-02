const gulp = require('gulp');
const babel = require('gulp-babel');
const watch = require('gulp-watch');
const del = require('del');
var browserSync = require('browser-sync').create();

gulp.task('default', ['clean', 'build', 'watch']);

gulp.task('build', ['babel']);

gulp.task('babel', () => {
	return gulp.src('src/*.js')
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
    del('static/js/**/*.js');
    del('static/css/**/*.css');

});

gulp.task('watch', ['browser-sync'], () => {
    gulp.watch('src/*.js', ['build']);
});

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
});