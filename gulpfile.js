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
    head:   "html/partial/head.tmpl",
    header:   "html/partial/header.tmpl",
    nav: "html/partial/nav.tmpl",
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

    gulp.task(prefix + 'html', function() {
        sources[prefix]("html/**/index.tmpl", {base: './html'})
            .pipe(mustache(templateVars, {}, templatePartials))
            .pipe(gulp.dest("public"));
    });

    gulp.task(prefix + 'html_partial', function() {
        sources[prefix]("html/partial/*.tmpl", function() {
            recompilehtml();
        });
    });

    gulp.task(prefix + 'jsondata', function() {
        sources[prefix]("data/*.json", function() {
            reloadTemplateData();
            recompilehtml();
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

gulp.task('build', ['ssemantic', 'sjsondata', 'shtml', 'shtml_partial', 'scss', 'sjs', 'simg']);
gulp.task('watch-build', ['wsemantic', 'wjsondata', 'whtml', 'whtml_partial', 'wcss', 'wjs', 'wimg']);

gulp.task('release', ['build']);
gulp.task('dev', ['watch-build', 'serve']);

function recompilehtml() {
    gulp.src("html/**/index.tmpl", {base: './html'})
    .pipe(mustache(templateVars, {}, templatePartials))
    .pipe(gulp.dest("public"));
}

function reloadTemplateData() {
    templateVars.menu = loadJSON("./data/menu.json");
    templateVars.photos = loadJSON("./data/photos.json");
}

function loadJSON(path) {
    return JSON.parse(fs.readFileSync(path));
}
