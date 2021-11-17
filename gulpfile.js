const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const del = require('del');
const svgSprite = require('gulp-svg-sprite');
const gcmq = require('gulp-group-css-media-queries');
const babel = require('gulp-babel');
const fileinclude = require('gulp-file-include');

function includeFile() {
	return src('app/templates/*.html')
		.pipe(fileinclude({
			prefix: '@@',
		}))
		.pipe(dest('./app/'));
}

function svgSprites() {
	return src('app/assets/img/spriteSvg/unification/*.svg')
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: '../sprite.svg'
				}
			}
		}))
		.pipe(dest('app/assets/img/spriteSvg'))
}

function images() {
	return src('app/assets/img/**/*')
		.pipe(imagemin([
			imagemin.gifsicle({ interlaced: true }),
			imagemin.mozjpeg({ quality: 75, progressive: true }),
			imagemin.optipng({ optimizationLevel: 5 }),
			imagemin.svgo({
				plugins: [
					{ removeViewBox: true },
					{ cleanupIDs: false }
				]
			})
		]))
		.pipe(dest('dist/assets/img'))
}

function scripts() {
	return src([
		'app/assets/js/index.js'
	])
		.pipe(sourcemaps.init())
		.pipe(concat('main.js'))
		//.pipe(uglify())
		.pipe(babel())
		.pipe(sourcemaps.write())
		.pipe(dest('app/assets/js'))
		.pipe(browserSync.stream())
}

function scriptsBuild() {
	return src([
		'app/assets/js/index.js'
	])
		.pipe(concat('main.js'))
		.pipe(babel())
		.pipe(uglify())
		.pipe(dest('dist/assets/js'));
}

function styles() {
	return src('app/assets/style/scss/main.scss')
		.pipe(sourcemaps.init())
		.pipe(scss())
		.pipe(concat('style.css'))
		.pipe(sourcemaps.write())
		.pipe(dest('app/assets/style/css'))
		.pipe(browserSync.stream());
}

function stylesBuild() {
	return src('app/assets/style/scss/main.scss')
		.pipe(scss({ outputStyle: 'compressed' }))
		.pipe(concat('style.css'))
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 5 version'],
			grid: true
		}))
		.pipe(dest('dist/assets/style/css'));
}

function build() {
	return src([
		'app/assets/style/css/libraries/**/*',
		'app/assets/fonts/**/*',
		'app/assets/js/libraries/**/*',
		'app/*.html'
	], { base: 'app' })
		.pipe(dest('dist'))
}

function browsersync() {
	browserSync.init({
		server: {
			baseDir: "./app/"
		}
	});
}

function cleanDist() {
	return del('dist')
}

function watching() {
	watch(['app/assets/style/scss/**/*.scss'], styles);
	watch(['app/assets/js/**/*.js', '!app/assets/js/main.js'], scripts);
	watch(['app/*.html']).on('change', browserSync.reload);
	watch(['app/templates/**/*.html'], includeFile);
	watch(['app/assets/img/spriteSvg/unification/*.svg'], svgSprites);
}

exports.includeFile = includeFile;
exports.styles = styles;
exports.stylesBuild = stylesBuild;
exports.scriptsBuild = scriptsBuild;
exports.svgSprite = svgSprites;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, build, stylesBuild, scriptsBuild);

exports.default = parallel(styles, scripts, svgSprites, browsersync, includeFile, watching);