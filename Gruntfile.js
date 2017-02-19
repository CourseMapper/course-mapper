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
      views: {
        options: { srcPrefix: 'frontend-modules/angular' },
        files: { 'public/partials': 'views/**/*.html' }
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [
          'frontend-modules/angular/*.js',
          'frontend-modules/angular/**/*.js',
          'frontend-modules/angular/**/**/**/*.js',
          'frontend-modules/angular/**/**/**/**/*.js'
        ],
        dest: 'public/build/courseMapper.js'
      },
      js: {
        src: 'frontend-modules/angular-admin/*.js',
        dest: 'public/build/courseMapperAdmin.js'
      },
      libsJS: {
        src: 'frontend-modules/libs/*.js',
        dest: 'public/build/cm-utils.js'
      },
      va: {
        src: [
          'public/js/video-annotations/*.js',
          'public/js/video-annotations/**/*.js'
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
          'public/js/video-annotations/*.js',
          'public/js/video-annotations/**/*.js'
        ],
        tasks: [
          'concat:dist',
          'concat:js',
          'concat:libsJS',
          'concat:va',
          'concat:vhub'],
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
    'bowercopy:views', 'concat:dist', 'concat:js', 'concat:libsJS', 'concat:va']
  );

  grunt.registerTask('production', [
    'bowercopy:views', 'concat:dist', 'concat:js', 'concat:libsJS', 'concat:va',
    'ngAnnotate:cmscripts',
    'uglify:courseMapper', 'uglify:courseMapperAdmin', 'cssmin'
  ]);
};
