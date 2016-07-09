'use strict';

var mongoose = require('mongoose');
var _ = require('lodash');
var Promise = require('bluebird');
Promise.promisifyAll(mongoose); // Promisify Mongoose

var VideoAnnotation = require('../../modules/annotations/video-annotation');
var PdfAnnotation = require('../../modules/slide-viewer/annotation');
var Courses = require('../../modules/catalogs/courses');
var Categories = require('../../modules/catalogs/categories');
var Resources = require('../../modules/trees/resources');
var TreeNodes = require('../../modules/trees/treeNodes');

var SearchBuilder = function (term) {
  var courseArgs = {$text: {$search: term}};
  var contentNodeArgs = {$text: {$search: term}, isDeleted: false};
  var categoryArgs = {$text: {$search: term}};
  var videoAnnotationArgs = {$text: {$search: term}};
  var pdfAnnotationArgs = {$text: {$search: term}};

  var searchableResources = [];

  this.searchByOwnership = function (ownerId) {
    if (!ownerId) {
      return this;
    }
    videoAnnotationArgs.authorId = ownerId;
    pdfAnnotationArgs.authorID = ownerId;
    courseArgs.createdBy = ownerId;
    contentNodeArgs.createdBy = ownerId;
    return this;
  };

  this.searchByResource = function (resources) {
    searchableResources = resources;
    return this;
  };

  this.build = function () {

    var findVideoAnnotations = VideoAnnotation.findAsync(videoAnnotationArgs)
      .then(function (videoAnnotations) {
        var promises = [];
        _.each(videoAnnotations, function (videoAnnotation) {
          promises.push(Resources.findByIdAsync(videoAnnotation.video_id)
            .then(function (content) {
              var va = videoAnnotation.toJSON();
              va.courseId = content.courseId;
              va.nodeId = content.treeNodeId;
              return va;
            }));
        });
        return Promise.all(promises);
      });

    var findPdfAnnotations = PdfAnnotation.findAsync(pdfAnnotationArgs)
      .then(function (pdfAnnotations) {
        var promises = [];
        _.each(pdfAnnotations, function (pdfAnnotation) {
          promises.push(Resources.findByIdAsync(pdfAnnotation.pdfId)
            .then(function (content) {
              var pa = pdfAnnotation.toJSON();
              pa.courseId = content.courseId;
              pa.nodeId = content.treeNodeId;
              return pa;
            }));
        });
        return Promise.all(promises);
      });

    var engines = {
      contentNodes: TreeNodes.find(contentNodeArgs).populate('courseId').execAsync(),
      courses: Courses.find(courseArgs).execAsync(),
      videoAnnotations: findVideoAnnotations,
      pdfAnnotations: findPdfAnnotations,
      categories: Categories.find(categoryArgs).execAsync()
    };

    if (!searchableResources) {
      return engines;
    }

    // Filter the searched resources
    var searchQuery = {};
    _.each(searchableResources, function (category) {
      searchQuery[category] = engines[category];
    });
    return searchQuery;
  };
};

module.exports = SearchBuilder;

