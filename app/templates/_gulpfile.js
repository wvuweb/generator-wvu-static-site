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
pngquant = require('imagemin-pngquant'),
flatten = require('gulp-flatten'),
conflict = require('gulp-conflict');

<% if (reload == 'browsersync') { %>
// BrowserSync Loading Task
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: "./dist/",
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
  .pipe(gulp.dest('./dist/stylesheets'))
  .pipe(browserSync.reload({stream:true}))
  .pipe(notify("Browser reloaded with goodness..."));
});


// Copy Pattern JSON files
gulp.task('copy-data',function(){
  return gulp.src('./bower_components/wvu-patterns-**/src/handlebars/data/*.json')
  .pipe(flatten())
  .pipe(conflict('./build/handlebars/data'))
  .pipe(gulp.dest('./build/handlebars/data'));
});

// Copy Pattern HBS files
gulp.task('copy-hbs',function(){
  return gulp.src('./bower_components/wvu-patterns-**/src/handlebars/**/*.hbs')
  .pipe(flatten())
  .pipe(conflict('./build/handlebars/data'))
  .pipe(gulp.dest('./build/handlebars/partials'));
});

// Build JSON
gulp.task('build-json',function(){
  return gulp.src([
    './build/handlebars/data/*.json'
  ])
  .pipe(extend('app.json',true,2))
  .pipe(rename('complete.json'))
  .pipe(gulp.dest("./build/handlebars/data/tmp"));
});

// Compile all JSON from patterns
gulp.task('compile', function () {
  var templateData = json.readFileSync('./build/handlebars/data/tmp/complete.json');
  var options = {
    batch : [
      './build/handlebars/partials',
      './build/handlebars'
    ]
  }
  return gulp.src('./build/handlebars/*.hbs')
  .pipe(handlebars(templateData, options))
  .pipe(rename({
    extname: '.html'
  }))
  .pipe(gulp.dest('./dist'))
});

gulp.task('clean', function(cb){
  return del([
    './build/handlebars/data/tmp/*.json',
    './dist/javascripts/',
    './dist/stylesheets/',
    './dist/*.html',
    './dist/fonts/'
    ], {'force':'true'}, cb);
});

gulp.task('compress-images', function () {
  return gulp.src('./build/images/**/*')
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [{removeViewBox: false}],
    use: [pngquant()]
  }))
  .pipe(gulp.dest('./dist/images'));
});

gulp.task('move-fonts',function(){
  return gulp.src(['./bower_components/**/fonts/**/*','./build/fonts/**/*'])
  .pipe(gulp.dest('./dist/fonts'));
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
  './dist/index.html'
  ])
  .pipe(beautify(config))
  .pipe(gulp.dest('./dist'))
  .pipe(browserSync.reload({stream:true}));
});

// Build Squence Task
gulp.task('build',function(){
  runSequence('clean','build-json','compile-scss','compile','compress-images','move-fonts','tidy-html');
});

// Install all needed files
gulp.task('install',function(){
  runSequence('copy-data','copy-hbs');
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
