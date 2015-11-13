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
    head:   "templates/partial/head.tmpl",
    header:   "templates/partial/header.tmpl",
    nav: "templates/partial/nav.tmpl",
};

var templateVars = {};
reloadTemplateData();

['s', 'w'].forEach(function(prefix) {
    gulp.task(prefix + 'semantic', function() {
        gulp.src('vendor/semantic/dist/*.js').pipe(gulp.dest('public/js'));
        gulp.src('vendor/semantic/dist/*.css').pipe(gulp.dest('public/css'));
        gulp.src('vendor/semantic/dist/themes/**').pipe(gulp.dest('public/css/themes'));
        gulp.src('vendor/semantic/dist/*.js').pipe(gulp.dest('public/js'));
    });

    gulp.task(prefix + 'templates', function() {
        sources[prefix]("templates/**/index.tmpl", {base: './templates'})
            .pipe(mustache(templateVars, {}, templatePartials))
            .pipe(gulp.dest("public"));
    });

    gulp.task(prefix + 'templates_partial', function() {
        sources[prefix]("templates/partial/*.tmpl", function() {
            recompileTemplates();
        });
    });

    gulp.task(prefix + 'jsondata', function() {
        sources[prefix]("data/*.json", function() {
            reloadTemplateData();
            recompileTemplates();
        });
    });

    gulp.task(prefix + 'css', function() {
        sources[prefix]('css/*.scss')
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest('public/css'));
    });

    gulp.task(prefix + 'js', function() {
        sources[prefix]('js/*.js').pipe(gulp.dest('public/js'));
    });

    gulp.task(prefix + 'img', function() {
        sources[prefix]('img/**/*', {base: './img'}).pipe(gulp.dest('public/img'));
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

gulp.task('build', ['ssemantic', 'sjsondata', 'stemplates', 'stemplates_partial', 'scss', 'sjs', 'simg']);
gulp.task('watch-build', ['wsemantic', 'wjsondata', 'wtemplates', 'wtemplates_partial', 'wcss', 'wjs', 'wimg']);

gulp.task('release', ['build']);
gulp.task('dev', ['watch-build', 'serve']);

function recompileTemplates() {
    gulp.src("templates/**/index.tmpl", {base: './templates'})
    .pipe(mustache(templateVars, {}, templatePartials))
    .pipe(gulp.dest("public"));
}

function reloadTemplateData() {
    templateVars.menu_names = loadJSON("./data/menu.json");
}

function loadJSON(path) {
    return JSON.parse(fs.readFileSync(path));
}
