var gulp = require('gulp');
var watch = require('gulp-watch');
var mustache = require("gulp-mustache-plus");
var webserver = require('gulp-webserver');
var sass = require('gulp-sass');
var fs = require('fs');
var imageResize = require('gulp-image-resize');
var rename = require('gulp-rename');
var path = require('path');
var autoprefixer = require('gulp-autoprefixer');

var browserify = require('browserify');
var watchify = require('watchify');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');

var source = require('vinyl-source-stream');

var watching = false;
gulp.task('enable-watchify', function() { watching = true; });

gulp.task('js', function() {
    var bundler = browserify({
        entries: ['./js/app.js'],
    });
    if (watching) {
        bundler.plugin(watchify);
    }
    bundler.transform('debowerify');
    bundler.on('update', rebundle);

    function rebundle() {
        return bundler
            .bundle()
            .pipe(source('app.js'))
            .pipe(streamify(uglify()))
            .pipe(gulp.dest('public/js/'));
    }

    return rebundle();
});

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
    js: "html/partial/js.tmpl",
    css: "html/partial/css.tmpl",
};

function basenameSuffix(filepath, suffix) {
    ext = path.extname(filepath);
    base = path.basename(filepath, ext);
    dir = path.dirname(filepath);
    return dir + "/" + base + suffix + ext;
}

var templateVars = {};
reloadTemplateData();

['s', 'w'].forEach(function(prefix) {
    gulp.task(prefix + 'semantic', function() {
        gulp.src('vendor/semantic/dist/*.js').pipe(gulp.dest('public/js'));
        gulp.src('vendor/semantic/dist/*.css')
            .pipe(autoprefixer({
                browsers: ['last 2 versions', 'Android 2.2', 'ie 8', 'ie 9'],
            }))
            .pipe(gulp.dest('public/css'));
        gulp.src('vendor/semantic/dist/themes/**').pipe(gulp.dest('public/css/themes'));
        gulp.src('vendor/semantic/dist/*.js').pipe(gulp.dest('public/js'));
    });

    gulp.task(prefix + 'html', function() {
        sources[prefix]("html/*.tmpl", {base: './html'})
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
            .pipe(autoprefixer({
                browsers: ['last 2 versions', 'Android 2.2', 'ie 8', 'ie 9'],
            }))
            .pipe(gulp.dest('public/css'));
    });

    gulp.task(prefix + 'img', function() {
        sources[prefix]('img/**/*', {base: './img'}).pipe(gulp.dest('public/img'));
    });


    gulp.task(prefix + 'thumbnail', function () {
        var size = {
            large: 1024,
            medium: 512,
            small: 128
        };
        var quality = {
            high: 1,
            middle: 0.7,
            low: 0.3
        };

        Object.keys(size).forEach(function(s) {
            var sv = size[s];
            Object.keys(quality).forEach(function(q) {
                var qv = quality[q];
                sources[prefix]('img/*.jpg')
                    .pipe(imageResize({
                        height : sv,
                        upscale : false,
                        quality: qv,
                        imageMagick: true
                    }))
                    .pipe(rename(function (path) { path.basename += "-" + [s, q].join("-"); }))
                    .pipe(gulp.dest('public/img'));
            });
        });
    });
});

gulp.task('serve', function() {
    setTimeout(function() {
        gulp.src('public')
            .pipe(webserver({
                livereload: true,
                directoryListing: false,
                open: true,
                middleware: function(req, res, next) {
                    var basename = path.basename(req.url);
                    var extname = path.extname(req.url);

                    if (basename && basename !== "/" && !extname) {
                        // like the github page
                        req.url += ".html";
                    }
                    next();
                },
            }));
    }, 1000);
});

gulp.task('build', ['ssemantic', 'sjsondata', 'shtml', 'shtml_partial', 'scss', 'js', 'simg', 'sthumbnail']);
gulp.task('watch-build', ['wsemantic', 'wjsondata', 'whtml', 'whtml_partial', 'wcss', 'enable-watchify', 'js', 'wimg', 'wthumbnail']);

gulp.task('release', ['build']);
gulp.task('dev', ['watch-build', 'serve']);

function recompilehtml() {
    gulp.src("html/*.tmpl", {base: './html'})
    .pipe(mustache(templateVars, {}, templatePartials))
    .pipe(gulp.dest("public"));
}

function reloadTemplateData() {
    templateVars.menu = loadJSON("./data/menu.json");
    templateVars.menu.images.forEach(function(image) {
        var src = image.src;
        image.src_thumbnail = basenameSuffix(src, "-small-middle");
    });

    templateVars.photos = loadJSON("./data/photos.json");
    templateVars.photos.forEach(function(image) {
        var src = image.src;
        image.src_thumbnail = basenameSuffix(src, "-small-middle");
    });

    templateVars.breadcrumb = loadJSON("./data/breadcrumb.json");
}

function loadJSON(path) {
    return JSON.parse(fs.readFileSync(path));
}
