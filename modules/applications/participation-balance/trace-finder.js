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

    function getTreeData(courses) {
      return new Promise(function (resolve, reject) {
        var tr = new Tree();
        _.map(courses, function (course) {
          tr.getTreeNodes(reject, {courseId: course._id}, resolve);
        });
      });
    }

    var findCreatedCourses = Courses
      .findAsync({createdBy: userId})
      .then(getTreeData);

    var findEnrolledCourses = UserCourses
      .find({user: userId, isEnrolled: true})
      .populate('course').execAsync()
      .then(function (enrolledCourses) {
        return _.map(enrolledCourses, function (c) {
          return c.course;
        })
      })
      .then(getTreeData);

    return Promise.props({
      created: findCreatedCourses,
      enrolled: findEnrolledCourses
    });
  }
};

module.exports = TraceFinder;