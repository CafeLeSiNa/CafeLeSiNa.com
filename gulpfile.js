var gulp = require('gulp');
var watch = require('gulp-watch');
var mustache = require("gulp-mustache-plus");
var webserver = require('gulp-webserver');
var sass = require('gulp-sass');

var sources = {
    s: function s(path, options) {
        return gulp.src(path, options);
    },
    w: function w(path, options) {
        return gulp.src(path, options).pipe(watch(path, options));
    }
};

['s', 'w'].forEach(function(prefix) {
    gulp.task(prefix + 'semantic', function() {
        gulp.src('semantic/dist/*.js').pipe(gulp.dest('public/javascripts'));
        gulp.src('semantic/dist/*.css').pipe(gulp.dest('public/stylesheets'));
        gulp.src('semantic/dist/themes/**').pipe(gulp.dest('public/stylesheets/themes'));
        gulp.src('semantic/dist/*.js').pipe(gulp.dest('public/javascripts'));
    });

    gulp.task(prefix + 'templates', function() {
        sources[prefix]("_templates/**/index.tmpl", {base: './_templates'})
            .pipe(mustache({},{},{
                head:   "_templates/partial/head.tmpl",
                nav: "_templates/partial/nav.tmpl",
            })).pipe(gulp.dest("public"));
    });

    gulp.task(prefix + 'stylesheets', function() {
        sources[prefix]('_stylesheets/*.scss')
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest('public/stylesheets'));
    });

    gulp.task(prefix + 'javascripts', function() {
        sources[prefix]('_javascripts/*.js').pipe(gulp.dest('public/javascripts'));
    });

    gulp.task(prefix + 'images', function() {
        sources[prefix]('_images/**/*', {base: './_images'}).pipe(gulp.dest('public/images'));
    });
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

gulp.task('build', ['ssemantic', 'stemplates', 'sstylesheets', 'sjavascripts', 'simages']);
gulp.task('watch-build', ['wsemantic', 'wtemplates', 'wstylesheets', 'wjavascripts', 'wimages']);

gulp.task('release', ['build']);
gulp.task('dev', ['watch-build', 'serve']);
