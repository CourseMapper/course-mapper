'use strict';

var mongoose = require('mongoose');
var _ = require('lodash');
var Promise = require('bluebird');
Promise.promisifyAll(mongoose); // Promisify Mongoose

var UserCourses = require('../../catalogs/userCourses.js');
var Courses = require('../../catalogs/courses');
var Tree = require('../../trees/index.js');

// var VideoAnnotation = require('../../modules/annotations/video-annotation');
// var PdfAnnotation = require('../../modules/slide-viewer/annotation');
// var Categories = require('../../modules/catalogs/categories');
// var Resources = require('../../modules/trees/resources');
// var ContentNodes = require('../../modules/trees/treeNodes');

var TraceFinder = function () {
  this.findAsync = function (userId) {

    var loadTreeData = function (courses) {
      var tr = new Tree();
      var p = [];

      courses.forEach(function (c) {
        p.push(new Promise(function (resolve, reject) {
          tr.getTreeNodes(reject, {courseId: c._id},
            function (tree) {
              var co = c.toObject();
              co.childrens = tree;
              resolve(co)
            });
        }));
      });
      return Promise.all(p);
    };

    var loadCreatedCourses = Courses
      .find({createdBy: userId})
      .then(loadTreeData);

    var loadEnrolledCourses = UserCourses
      .find({user: userId, isEnrolled: true})
      .populate('course').execAsync()
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
};

module.exports = TraceFinder;