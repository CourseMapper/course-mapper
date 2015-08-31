'use strict';
module.exports = function (grunt) {
    // load all grunt tasks
    grunt.loadNpmTasks('grunt-bowercopy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');


    grunt.initConfig({
        bowercopy: {
            options: {
                srcPrefix: 'bower_components'
            },
            scripts: {
                options: {
                    destPrefix: 'public'
                },
                files: {
                    'angular/angular.min.js': 'angular/angular.min.js',
                    'angular/angular.min.js.map': 'angular/angular.min.js.map',

                    'angular/angular-resource.min.js': 'angular-resource/angular-resource.min.js',
                    'angular/angular-resource.min.js.map': 'angular-resource/angular-resource.min.js.map',

                    'angular/angular-route.min.js': 'angular-route/angular-route.min.js',
                    'angular/angular-route.min.js.map': 'angular-route/angular-route.min.js.map',

                    'angular/angular-cookies.min.js': 'angular-cookies/angular-cookies.min.js',
                    'angular/angular-cookies.min.js.map': 'angular-cookies/angular-cookies.min.js.map'
                }
            }
        },

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    'frontend-modules/angular/*.js',
                    'frontend-modules/angular/**/*.js'
                ],
                dest: 'public/angular/courseMapper.js'
            },
            js: {
                src: 'frontend-modules/angular-admin/*.js',
                dest: 'public/angular/courseMapperAdmin.js'
            },
            libsJS: {
                src: 'frontend-modules/libs/*.js',
                dest: 'public/admin-lte/js/libs.js'
            }
        },

        watch: {
            scripts: {
                files: [
                    'frontend-modules/angular/*.js',
                    'frontend-modules/angular/**/*.js',
                    'frontend-modules/angular-admin/*.js',
                    'frontend-modules/libs/*.js'
                ],
                tasks: ['concat:dist', 'concat:js', 'concat:libsJS'],
                options: {
                    spawn: false
                }
            }
        },

        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            cmscripts: {
                files:{
                    'public/angular/courseMapper.js': ['public/angular/courseMapper.js'],
                    'public/angular/courseMapperAdmin.js': ['public/angular/courseMapperAdmin.js']
                }
            }
        },

        uglify: {
            courseMapper: {
                files: {
                    'public/angular/courseMapper.js': ['public/angular/courseMapper.js']
                }
            },
            courseMapperAdmin: {
                files: {
                    'public/angular/courseMapperAdmin.js': ['public/angular/courseMapperAdmin.js']
                }
            }
        }

    });

    // the default task (running "grunt" in console)
    grunt.registerTask('default', ['bowercopy', 'concat:dist', 'concat:js', 'concat:libsJS']);
    grunt.registerTask('production', [
        'bowercopy', 'concat:dist',
        'concat:js', 'concat:libsJS',
        'ngAnnotate:cmscripts',
        'uglify:courseMapper', 'uglify:courseMapperAdmin'
    ]);
};
