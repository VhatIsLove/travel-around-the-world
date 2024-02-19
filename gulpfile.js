const {src, dest, watch, parallel, series} = require('gulp');

const scss = require('gulp-sass')(require('sass')); //подключение плагинов
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer'); 
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const spriteSvg = require('gulp-svg-sprite'); 
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const include = require('gulp-include');


function pages(){ // работаем с html файлами
    return src('app/pages/*.html')
    .pipe(include({
        includePaths: 'app/components'
    }))
    .pipe(dest('app'))
    .pipe(browserSync.stream())
}

function fonts(){ //работаем со шрифтами
    return src('app/fonts/src/*.*')
    .pipe(fonter({
        formats: ['woff', 'ttf'] //берет шрифты из папки fonts/src и конвертирует любые форматы в woff и ttf
    }))
    .pipe(src('app/fonts/*.ttf'))
    .pipe(ttf2woff2())
    .pipe(dest('app/fonts')) // отвечает за то куда мы все это выгружаем
}

function images(){ // уменьшаем вес картинок, меняем формат на avif и webp
    return src(['app/images/src/*.*', '!app/images/src/*.svg'])
    .pipe(newer('app/images'))
    .pipe(avif({quality : 50}))

    .pipe(src('app/images/src/*.*'))
    .pipe(newer('app/images'))
    .pipe(webp())

    .pipe(src('app/images/src/*.*'))
    .pipe(newer('app/images'))
    .pipe(imagemin())

    .pipe(dest('app/images'))
}

function sprite(){ // делаем svg спрайты
    return src('app/images/*.svg')
    .pipe(spriteSvg({
        mode: {
            stack: {
                sprite: '../sprite.svg', 
                example: true
            }
        }
    }))
    .pipe(dest('app/images'))
}

function scripts(){ // минифицирует и создает новую папку для js
    return src('app/js/main.js')
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function styles(){ // обрабатывает scss в css и минифицирует
    return src('app/scss/style.scss')
    .pipe(autoprefixer({overrideBrowserslist: ['last 10 version']}))
    .pipe(concat('style.min.css'))
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}

function watching(){ // отслеживает изменения в указаных файлах
    browserSync.init({ // автоматически обнавляет страницу браузера
        server: {
            baseDir: "app/"
        }
    });
    watch(['app/scss/style.scss'], styles)  // при изменении файла вызывается функция styles 
    watch(['app/images/src'], images)
    watch(['app/js/main.js'], scripts)
    watch(['app/components/*', 'app/pages/*'], pages)
    watch(['app/*.html']).on('change', browserSync.reload);
}

function cleanDist(){
    return src('dist')
    .pipe(clean())
}

function building(){ // берет все необходимое и делает чистый dist для загрузки на хостинг
    return src([ //ищем и возврацаем необходимые файлы
        'app/css/style.min.css',
        '!app/images/**/*.html',
        'app/images/*.*',
        '!app/images/*.svg',
        'app/images/sprite.svg',
        'app/fonts/*.*',
        'app/js/main.min.js',
        'app/**/*.html' //забирает весь html и его подпапки
    ], {base : 'app'}) // говорит о том что бы сохранилась вся базовая структура корневой папки app
    .pipe(dest('dist'))
}

exports.styles = styles;
exports.images = images;
exports.fonts = fonts;
exports.pages = pages;
exports.building = building;
exports.sprite = sprite;
exports.scripts = scripts;
exports.watching = watching;

exports.build = series(cleanDist, building);
exports.default = parallel(styles, images, scripts, pages, watching); //позволяет одновременно запустить перечисленные функции 
