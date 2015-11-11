var gulp = require('gulp');
var watch = require('gulp-watch');
var mustache = require("gulp-mustache-plus");
var webserver = require('gulp-webserver');
var sass = require('gulp-sass');

gulp.task('semantic', function() {
    gulp.src('semantic/dist/*.js').pipe(gulp.dest('public/javascripts'));
    gulp.src('semantic/dist/*.css').pipe(gulp.dest('public/stylesheets'));
    gulp.src('semantic/dist/themes/**').pipe(gulp.dest('public/stylesheets/themes'));
    gulp.src('semantic/dist/*.js').pipe(gulp.dest('public/javascripts'));
});

gulp.task('templates', function() {
    w("_templates/**/index.tmpl", {base: './_templates'})
        .pipe(mustache({},{},{
            head:   "_templates/partial/head.tmpl",
            nav: "_templates/partial/nav.tmpl",
        })).pipe(gulp.dest("public"));
});

gulp.task('stylesheets', function() {
    w('_stylesheets/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('public/stylesheets'));
});

gulp.task('javascripts', function() {
    w('_javascripts/*.js').pipe(gulp.dest('public/javascripts'));
});

gulp.task('images', function() {
    w('_images/**/*', {base: './_images'}).pipe(gulp.dest('public/images'));
});

gulp.task('serve', function() {
    setTimeout(function() {
        gulp.src('public')
            .pipe(webserver({
                livereload: true,
                directoryListing: false,
                open: true,
            }));
    }, 1000);
});

gulp.task('build', ['semantic', 'templates', 'stylesheets', 'javascripts', 'images']);
gulp.task('dev', ['build', 'serve']);
gulp.task('release', ['build']);

function w(path, options) {
    return gulp.src(path, options).pipe(watch(path, options));
}
