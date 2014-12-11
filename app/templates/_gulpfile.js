'use strict';

var gulp = require('gulp'),
<% if (reload == 'browsersync') { %>browserSync = require('browser-sync'),<% } %><% if (reload == 'livereload') { %>livereload = require('gulp-livereload'),<% } %>
gutil = require('gulp-util'),
sass = require('gulp-sass'),
prefix = require('gulp-autoprefixer'),
rename = require('gulp-rename'),
del = require('del'),
scsslint = require('gulp-scss-lint'),
runSequence = require('run-sequence'),
handlebars = require('gulp-compile-handlebars'),
extend = require('gulp-extend'),
beautify = require('gulp-js-beaut'),
notify = require('gulp-notify'),
json = require('jsonfile'),
imagemin = require('gulp-imagemin'),
pngquant = require('imagemin-pngquant');

var random = "";

<% if (reload == 'browsersync') { %>
// BrowserSync Loading Task
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: "./public/",
    },
    open: false,
    logConnections: true,
    logSnippet: false
  });
});
<% } %>
<% if (reload == 'livereload') { %>
// LiveReload Loading Task
gulp.task('livereload', function(){
  livereload.listen({auto: true});
});
<% } %>

// Reload Task
gulp.task('reload', function () {
  gulp.src('./dist/**/*.html')
  <% if (reload == "browsersync") { %>.pipe(browserSync.reload({stream:true}));<% } %><% if (reload == "livereload") { %>.pipe(livereload({auto: false}));<% } %>
});

// Lint SCSS Files
gulp.task('scss-lint', function() {
  return gulp.src(['./build/scss/**/*.scss'])
  .pipe(scsslint({
    'config': '.scss-lint.yml'
  }))
  .pipe(notify(function(file) {
    if (!file.scsslint.success) {
      return file.scsslint.issues.length + ' issues found in '+ file.path;
    } else {
      return false;
    }
  }))
  .pipe(scsslint.failReporter());
});

// Compile SCSS Files
gulp.task('compile-scss', function () {
  return gulp.src(['./build/scss/**/*.scss'])
  .pipe(sass({
    outputStyle: "compressed"
  }))
  .pipe(prefix("last 1 version", "> 1%", "ie 8", { cascade: true }))
  .pipe(gulp.dest('./public/stylesheets'))
  .pipe(browserSync.reload({stream:true}))
  .pipe(notify("Browser reloaded with goodness..."));
});

// Build JSON
gulp.task('build-json',function(){
  random = Math.random().toString(36).slice(2)+".json";

  return gulp.src([
    './bower_components/wvu-patterns-**/src/handlebars/data/*.json',
    './build/handlebars/data/*.json'
  ])
  .pipe(extend('index.json',true,2))
  .pipe(rename('complete.json'))
  .pipe(gulp.dest("./build/handlebars/data/tmp"));
});

// Compile all JSON from patterns
gulp.task('compile', function () {

  var templateData = json.readFileSync('./build/handlebars/data/tmp/complete.json');

  var options = {
    batch : [
    './bower_components/wvu-patterns-masthead/src/handlebars',
    './bower_components/wvu-patterns-masthead-logo/src/handlebars',
    './bower_components/wvu-patterns-masthead-links/src/handlebars',
    './bower_components/wvu-patterns-footer/src/handlebars',
    './bower_components/wvu-patterns-footer-credits/src/handlebars',
    './bower_components/wvu-patterns-footer-links/src/handlebars',
    './build/handlebars/partials',
    './build/handlebars'
    ]
  }
  return gulp.src('./build/handlebars/**/*.hbs')
  .pipe(handlebars(templateData, options))
  .pipe(rename({
    extname: '.html'
  }))
  .pipe(gulp.dest('./public'))
});

gulp.task('clean', function(cb){
  return del([
    './build/handlebars/data/tmp/*.json',
    './public/javascripts/',
    './public/stylesheets/',
    './public/*.html',
    './public/fonts/'
    ], {'force':'true'}, cb);
});

gulp.task('compress-images', function () {
  return gulp.src('./build/images/**/*')
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [{removeViewBox: false}],
    use: [pngquant()]
  }))
  .pipe(gulp.dest('./public/images'));
});

gulp.task('move-fonts',function(){
  return gulp.src(['./bower_components/**/fonts/**/*','./build/fonts/**/*'])
  .pipe(gulp.dest('./public/fonts'));
});

// For more information: https://github.com/zeroedin/gulp-js-beaut
gulp.task('tidy-html', function(){

  var config = {
    html: {
      indent_inner_html: true,
      indent_size: 2,
      indent_char: " ",
      brace_style: "collapse",
      indent_scripts: "normal",
      wrap_line_length: 500,
      preserve_newlines: true,
      max_preserve_newlines: 1,
      end_with_newline: true
    }
  };

  return gulp.src([
  './public/index.html'
  ])
  .pipe(beautify(config))
  .pipe(gulp.dest('./public'))
  .pipe(browserSync.reload({stream:true}));
});

// Build Squence Task
gulp.task('build',function(){
  runSequence('clean','build-json','compile-scss','compile','compress-images','move-fonts','tidy-html');
});

// Watch Task
gulp.task('watch', function () {
  gulp.watch(['./build/**/*.hbs','./build/**/*.json'],['build']);
  gulp.watch(['./build/scss/**/*.scss'],['compile-scss']);
  gulp.watch(['./build/javascript/**/*.js'],['javascript']);
});

// Default Task
gulp.task('default', [
<% if (reload == 'livereload') { %>'livereload',<% } %>
'build',
'watch'
<% if (reload == 'browsersync') { %>,'browser-sync'<% } %>
]);
