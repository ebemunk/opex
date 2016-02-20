var gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	minifycss = require('gulp-minify-css');

var paths = {
	js: [
		'js/op.js',
		'js/*.js',
	],
	css: [
		'css/*.css',
		'css/style.css'
	]
};

gulp.task('js', function() {
	return gulp.src(paths.js)
		.pipe(concat('op.js'))
		.pipe(uglify())
		.pipe(gulp.dest('build'));
});

gulp.task('css', function() {
	return gulp.src(paths.css)
		.pipe(concat('op.css'))
		.pipe(minifycss())
		.pipe(gulp.dest('build'));
});

gulp.task('default', function() {
	gulp.start('js', 'css');
});

gulp.task('watch', function() {
	gulp.watch(paths.js, ['js']);
	gulp.watch(paths.css, ['css']);
});