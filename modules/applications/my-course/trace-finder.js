'use strict';

var mongoose = require('mongoose');
var _ = require('lodash');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

var Promise = require('bluebird');
Promise.promisifyAll(mongoose); // Promisify Mongoose

var UserCourses = require('../../catalogs/userCourses.js');
var Courses = require('../../catalogs/courses');
var Tree = require('../../trees/index.js');
var VideoAnnotation = require('../../../modules/annotations/video-annotation');
var PdfAnnotation = require('../../../modules/slide-viewer/annotation');

// var Categories = require('../../modules/catalogs/categories');
// var Resources = require('../../modules/trees/resources');
// var ContentNodes = require('../../modules/trees/treeNodes');

var TraceFinder = function () {
    this.findAsync = function (user) {

      var countAnnotationsAsync = function (resource, user) {
        if (resource.type == 'video') {
          var videoQuery = {video_id: resource._id};
          if (user) {
            videoQuery.authorId = user._id;
          }
          return VideoAnnotation.find(videoQuery).count().exec();
        }
        if (resource.type == 'pdf') {
          var pdfQuery = {pdfId: resource._id};
          if (user) {
            pdfQuery.authorID = user._id;
          }
          return PdfAnnotation.find(pdfQuery).count().exec();
        }
        return 0;
      };

      var loadMetadataAsync = async(function (node) {
          if (node.type == 'contentNode') {
            var totalAnnotations = 0;
            var userAnnotations = 0;
            var resources = node.resources;
            if (resources && resources.length > 0) {
              for (var i = 0; i < resources.length; i++) {
                totalAnnotations += await(countAnnotationsAsync(resources[i]));
                userAnnotations += await(countAnnotationsAsync(resources[i], user));
              }
              node.totalAnnotations = totalAnnotations;
              node.userAnnotations = userAnnotations;
            }
          }
          var children = node.childrens;
          return children.forEach(function (child) {
            await(loadMetadataAsync(child));
          });
        }
      );

      var loadTreeData = function (courses) {
        var tr = new Tree();
        return Promise.map(courses, function (course) {
          return new Promise(function (resolve, reject) {
            tr.getTreeNodes(reject, {query: {courseId: course._id}, user: user},
              async(function (tree) {
                var root = course.toObject();
                root.childrens = tree;
                await(loadMetadataAsync(root));
                resolve(root);
              }));
          })
        });
      };

      var loadCreatedCourses = Courses
        .find({createdBy: user._id})
        .execAsync()
        .then(loadTreeData);

      var loadEnrolledCourses = UserCourses
        .find({user: user._id, isEnrolled: true})
        .populate('course')
        .execAsync()
        .then(function (enrolledCourses) {
          return _.map(enrolledCourses, function (c) {
            return c.course;
          })
        })
        .then(loadTreeData);

      return Promise.props({
        created: loadCreatedCourses,
        enrolled: loadEnrolledCourses
      });
    }
  }
  ;

module.exports = TraceFinder;