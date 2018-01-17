var config = require('./gulpconfig.json');
var	gulp = require('gulp');
var	shell = require('gulp-shell');
var minifyHTML = require('gulp-minify-html');
// var cloudflare = require('gulp-cloudflare');
var runSequence = require('run-sequence');
var autoprefixer = require('gulp-autoprefixer');
var uncss = require('gulp-uncss');
var minifyCss = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var jpegtran = require('imagemin-jpegtran');
var gifsicle = require('imagemin-gifsicle');
var replace = require('gulp-replace');
var fs = require('fs');
var download = require('gulp-download');

gulp.task('jekyll', function() {
	return gulp.src('index.html', { read: false })
		.pipe(shell([
			'jekyll build'
		]));
});

gulp.task('optimize-images', function () {
	return gulp.src(['assets/**/*', 'assets/*'])
		.pipe(imagemin({
			progressive: false,
			optimizationLevel: 3,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant(), jpegtran(), gifsicle()]
		}))
		.pipe(gulp.dest('assets/img/optimized/'));
});

gulp.task('optimize-css', function() {
   return gulp.src(['_site/assets/css/main.css', '_site/assets/css/*.css'])
	   .pipe(autoprefixer())
	  // .pipe(uncss({
	//	   html: ['_site/**/*.html'],
	//	   ignore: []
	 //  }))
	   .pipe(minifyCss({keepBreaks: false}))
	   .pipe(gulp.dest('_site/assets/css/'));
});

gulp.task('optimize-html', function() {
	return gulp.src('_site/**/*.html')
		.pipe(minifyHTML({
			quotes: true
		}))
		.pipe(replace(/<link href=\"\/assets\/css\/main.css\"[^>]*>/, function(s) {
			var style = fs.readFileSync('_site/assets/css/main.css', 'utf8');
			return '<style>\n' + style + '\n</style>';
		}))
		.pipe(replace(/<link href=\"\/assets\/css\/critical.css\"[^>]*>/, function(s) {
			var style = fs.readFileSync('_site/assets/css/critical.css', 'utf8');
			return '<style>\n' + style + '\n</style>';
		}))
		.pipe(gulp.dest('_site/'));
});

gulp.task('include-css', function() {
  return gulp.src('_site/**/*.html')
    .pipe(replace(/<link href=\"\/assets\/css\/main.css\"[^>]*>/, function(s) {
      var style = fs.readFileSync('_site/assets/css/main.css', 'utf8');
      return '<style>\n' + style + '\n</style>';
    }))
    .pipe(gulp.dest('_site/'));
});

gulp.task('fetch-newest-analytics', function() {
	return download('https://www.google-analytics.com/analytics.js')
    	.pipe(gulp.dest('assets/js/'));
});

gulp.task('netlify', function() {
		return gulp.src('', { read: false })
 		.pipe(shell([
			'netlify deploy _site'
		]));
});

gulp.task('serve-skipbuild', function() {
		return gulp.src('', { read: false })
 		.pipe(shell([
			'jekyll serve --skip-initial-build --port $PORT --host $IP --baseurl ""'
		]));
});

gulp.task('deploy', function(callback) {
	runSequence(
		'fetch-newest-analytics',
		'jekyll',
		//'optimize-images',
		'optimize-css',
		'optimize-html',
		'include-css',
	    //'netlify',
		'serve-skipbuild', 
		callback
	);
});