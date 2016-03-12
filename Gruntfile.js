/*jslint node: true */
'use strict';

module.exports = function (grunt) {
  // load all grunt tasks
  grunt.loadNpmTasks('grunt-bowercopy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.initConfig({
    bowercopy: {
      scripts: {
        options: {
          srcPrefix: 'bower_components',
          destPrefix: 'public'
        },
        files: {
          'angular/angular.min.js': 'angular/angular.min.js',
          'angular/angular.min.js.map': 'angular/angular.min.js.map',

          'angular/angular-resource.min.js': 'angular-resource/angular-resource.min.js',
          'angular/angular-resource.min.js.map': 'angular-resource/angular-resource.min.js.map',

          'angular/angular-animate.min.js': 'angular-animate/angular-animate.min.js',
          'angular/angular-animate.min.js.map': 'angular-animate/angular-animate.min.js.map',

          'angular/angular-route.min.js': 'angular-route/angular-route.min.js',
          'angular/angular-route.min.js.map': 'angular-route/angular-route.min.js.map',

          'angular/angular-cookies.min.js': 'angular-cookies/angular-cookies.min.js',
          'angular/angular-cookies.min.js.map': 'angular-cookies/angular-cookies.min.js.map',

          'angular-toastr': 'angular-toastr/dist/*'

        }
      },
      views: {
        options: {
          srcPrefix: 'frontend-modules/angular'
        },
        files: {
          'public/angular/views': 'views/**/*.html'
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
        dest: 'public/build/courseMapper.js'
      },
      js: {
        src: 'frontend-modules/angular-admin/*.js',
        dest: 'public/build/courseMapperAdmin.js'
      },
      libsJS: {
        src: 'frontend-modules/libs/*.js',
        dest: 'public/admin-lte/js/libs.js'
      },
      va: {
        src: [
          'public/src/video-annotations/*.js',
          'public/src/video-annotations/**/*.js'
        ],
        dest: 'public/build/video-annotations.js'
      }
    },

    watch: {
      scripts: {
        files: [
          'frontend-modules/angular/*.js',
          'frontend-modules/angular/**/*.js',
          'frontend-modules/angular/views/*.html',
          'frontend-modules/angular/views/**/*.html',
          'frontend-modules/angular-admin/*.js',
          'frontend-modules/libs/*.js',
          'public/src/video-annotations/scripts/*.js',
          'public/src/video-annotations/scripts/**/*.js',
          'public/src/video-annotations/scripts/**/**/*.js'
        ],
        tasks: ['bowercopy:views', 'concat:dist', 'concat:js', 'concat:libsJS', 'concat:va'],
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
        files: {
          'public/build/courseMapper.js': ['public/build/courseMapper.js'],
          'public/build/courseMapperAdmin.js': ['public/build/courseMapperAdmin.js']
        }
      }
    },

    uglify: {
      courseMapper: {
        files: {
          'public/build/courseMapper.js': ['public/build/courseMapper.js']
        }
      },
      courseMapperAdmin: {
        files: {
          'public/build/courseMapperAdmin.js': ['public/build/courseMapperAdmin.js']
        }
      }
    },

    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'public/admin-lte/css',
          src: ['*.css', '!*.min.css'],
          dest: 'public/admin-lte/css',
          ext: '.css'
        }]
      }
    }
  });

  // the default task (running "grunt" in console)
  grunt.registerTask('default', [
    'bowercopy:scripts',
    'bowercopy:views',
    'concat:dist', 'concat:js', 'concat:libsJS', 'concat:va']
  );

  grunt.registerTask('production', [
    'bowercopy',
    'concat:dist', 'concat:js', 'concat:libsJS', 'concat:va',
    'ngAnnotate:cmscripts',
    'uglify:courseMapper', 'uglify:courseMapperAdmin', 'cssmin'
  ]);
};
