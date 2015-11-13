var gulp = require('gulp');
var watch = require('gulp-watch');
var mustache = require("gulp-mustache-plus");
var webserver = require('gulp-webserver');
var sass = require('gulp-sass');
var fs = require('fs');

var sources = {
    s: function s(path, options, cb) {
        if (typeof options === 'function') {
            cb = options;
            options = null;
        }

        if (!options && cb) {
            return gulp.src(path, cb);
        } else {
            return gulp.src(path, options);
        }
    },
    w: function w(path, options, cb) {
        if (typeof options === 'function') {
            cb = options;
            options = null;
        }

        if (!options && cb) {
            return watch(path, cb);
        } else {
            return gulp.src(path, options).pipe(watch(path, options));
        }
    }
};

var templatePartials = {
    head:   "_templates/partial/head.tmpl",
    header:   "_templates/partial/header.tmpl",
    nav: "_templates/partial/nav.tmpl",
};

var templateVars = {};
reloadTemplateData();

['s', 'w'].forEach(function(prefix) {
    gulp.task(prefix + 'semantic', function() {
        gulp.src('vendor/semantic/dist/*.js').pipe(gulp.dest('public/javascripts'));
        gulp.src('vendor/semantic/dist/*.css').pipe(gulp.dest('public/stylesheets'));
        gulp.src('vendor/semantic/dist/themes/**').pipe(gulp.dest('public/stylesheets/themes'));
        gulp.src('vendor/semantic/dist/*.js').pipe(gulp.dest('public/javascripts'));
    });

    gulp.task(prefix + 'templates', function() {
        sources[prefix]("_templates/**/index.tmpl", {base: './_templates'})
            .pipe(mustache(templateVars, {}, templatePartials))
            .pipe(gulp.dest("public"));
    });

    gulp.task(prefix + 'templates_partial', function() {
        sources[prefix]("_templates/partial/*.tmpl", function() {
            recompileTemplates();
        });
    });

    gulp.task(prefix + 'jsondata', function() {
        sources[prefix]("_data/*.json", function() {
            reloadTemplateData();
            recompileTemplates();
        });
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

gulp.task('build', ['ssemantic', 'sjsondata', 'stemplates', 'stemplates_partial', 'sstylesheets', 'sjavascripts', 'simages']);
gulp.task('watch-build', ['wsemantic', 'wjsondata', 'wtemplates', 'wtemplates_partial', 'wstylesheets', 'wjavascripts', 'wimages']);

gulp.task('release', ['build']);
gulp.task('dev', ['watch-build', 'serve']);

function recompileTemplates() {
    gulp.src("_templates/**/index.tmpl", {base: './_templates'})
    .pipe(mustache(templateVars, {}, templatePartials))
    .pipe(gulp.dest("public"));
}

function reloadTemplateData() {
    templateVars.menu_names = loadJSON("./_data/menu.json");
}

function loadJSON(path) {
    return JSON.parse(fs.readFileSync(path));
}
