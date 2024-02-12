const {src, dest, watch, parallel, series} = require('gulp');

const scss = require('gulp-sass')(require('sass')); //подключение плагинов
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer'); //закоментил так как с ним не работает build
const clean = require('gulp-clean');


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
    watch(['app/scss/style.scss'], styles) // при изменении файла вызывается функция styles 
    watch(['app/js/main.js'], scripts)
    watch(['app/*.html']).on('change', browserSync.reload);
}

function browsersync(){ // автоматически обнавляет страницу браузера
    browserSync.init({
        server: {
            baseDir: "app/"
        }
    });
}

function cleanDist(){
    return src('dist')
    .pipe(clean())
}

function building(){ // берет все необходимое и делает чистый dist для загрузки на хостинг
    return src([ //ищем и возврацаем необходимые файлы
        'app/css/style.min.css',
        'app/js/main.min.js',
        'app/**/*.html' //забирает весь html и его подпапки
    ], {base : 'app'}) // говорит о том что бы сохранилась вся базовая структура корневой папки app
    .pipe(dest('dist'))
}

exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.browsersync = browsersync;

exports.build = series(cleanDist, building);
exports.default = parallel(styles, scripts, browsersync, watching); //позволяет одновременно запустить перечисленные функции 
