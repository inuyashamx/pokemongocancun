module.exports = function(grunt) {
    /*
    Estructura para que sirva este grunt:
    - root del proyecto
        - assets
            - root
                -> aqui van todas los archivos y carpetas que van en el root de app, como images, partials y el index.html
            - styles
                -> todos los estilos como quieras poneros en subcarpetas (como te acomodes mejor)
            - scripts
                -> lo mismo pero con los js
        - app
            -> esta carpeta se autocompila hay que ignorarla en git
        Gruntfile.js
    */
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: { // si usas sass aqui pon tus estilos
            build: {
                options: {
                    sourceMap: true
                },
                files: {
                    //'app/css/required.css': ['assets/bower_components/bootstrap-sass-official/vendor/assets/stylesheets/bootstrap.scss'],
                    'app/css/required.css': [
                        'assets/bower_components/angular-material/angular-material.scss'
                    ],
                    'app/css/styles.css': ['assets/styles/**/*.scss']
                }
            }
        },
        concat: {
            required: {
                files: {
                    // Required Dependencies <- aqui pones las que necesites de bower
                    'app/js/required.js': [
                        'assets/bower_components/angular/angular.js',
                        'assets/bower_components/angular-animate/angular-animate.js',
                        'assets/bower_components/angular-aria/angular-aria.js',
                        'assets/bower_components/angular-google-chart/ng-google-chart.js',
                        'assets/bower_components/angular-material/angular-material.js',
                        'assets/bower_components/angular-messages/angular-messages.js',
                        'assets/bower_components/angular-route/angular-route.js',
                        'assets/bower_components/angular-sanitize/angular-sanitize.js',
                        'assets/bower_components/firebase/firebase.js',
                        'assets/bower_components/ngmap/build/scripts/ng-map.min.js',
                        'assets/bower_components/angular-ui-router/release/angular-ui-router.js',
                        'assets/bower_components/ng-file-upload/ng-file-upload-shim.min.js',
                        'assets/bower_components/ng-file-upload/ng-file-upload.min.js',
                        'assets/bower_components/html2canvas/html2canvas.js',
                        'assets/bower_components/angular-socialshare/dist/angular-socialshare.js',
                        'assets/bower_components/momentjs/min/locales.min.js',
                        'assets/bower_components/humanize-duration/humanize-duration.js',
                        'assets/bower_components/angular-timer/dist/angular-timer.js',
                        'assets/bower_components/moment/min/moment.min.js',
                        'assets/bower_components/angular-moment/angular-moment.js'
                    ]
                }
            },
            app: {
                files: {
                    // Ensamble Main App <- aqui va toda la carpeta de assets/js
                    'app/js/app.js': [
                        'assets/scripts/**/*.js'
                    ]
                }
            }
        },
        cssmin: { // este se usa para minificar lo que se concateno arriba
            build: {
                options: {
                    shorthandCompacting: false,
                    roundingPrecision: -1
                },
                files: [{
                    'app/css/styles.min.css': ['app/css/styles.css']
                }, {
                    'app/css/required.min.css': ['app/css/required.css']
                }]
            }
        },
        uglify: { // no toques esta a menos que necesites
            required: {
                options: {
                    preserveComments: false,
                    mangle: false,
                    compress: { // commonly used to remove debug code blocks for production 
                        global_defs: {
                            "DEBUG": false
                        },
                        dead_code: false
                    }
                },
                files: {
                    'app/js/required.min.js': ['app/js/required.js']
                }
            },
            app: {
                options: {
                    preserveComments: false,
                    mangle: false,
                    compress: { // commonly used to remove debug code blocks for production 
                        global_defs: {
                            "DEBUG": false
                        },
                        dead_code: false
                    }
                },
                files: {
                    'app/js/app.min.js': ['app/js/app.js']
                }
            }
        },
        copy: { // copia los archivos de assets/root al root de app, asi como las 
            build: {
                /*options: {
                    process: function (content, srcpath) {
                        return content.replace(/[sad ]/g, '_');
                    },
                },*/
                files: [{
                        expand: true,
                        cwd: 'assets/root/',
                        src: '**',
                        dest: 'app/'
                    } //isFile: true
                ]
            }
        },
        watch: {
            sass: { // solo activa sass si tienes
                files: ['assets/styles/**/*.scss'],
                tasks: ['sass', 'cssmin']
            },
            js: {
                files: ['assets/scripts/**/*.js'],
                tasks: ['concat:app', 'uglify:app']
            },
            html: {
                files: ['assets/root/**/*.html', 'assets/views/**/*.html', 'assets/img/**/*.*'],
                tasks: ['copy']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // se registra una combinación de funciones
    //grunt.registerTask('both', ['speak','yell'])
    // si la llamas default se corre al llamar grunt
    // aqui es donde se ejecutan la configuracion de arriba
    grunt.registerTask('default', ['sass', 'concat', 'cssmin', 'uglify', 'copy', 'watch']); // 'http-server',
}