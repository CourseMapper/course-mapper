'use strict';

var VideoAnnotation = require('../../modules/annotations/video-annotation');
var PdfAnnotation = require('../../modules/slide-viewer/annotation');
var Courses = require('../../modules/catalogs/courses');
var Categories = require('../../modules/catalogs/categories');
var Resources = require('../../modules/trees/resources');

var mongoose = require('mongoose');
var _ = require('lodash');
var Promise = require('bluebird');

Promise.promisifyAll(mongoose);

var SearchBuilder = function (term) {
  var courseArgs = {$text: {$search: term}};
  var categoryArgs = {$text: {$search: term}};
  var videoAnnotationArgs = {$text: {$search: term}};
  var pdfAnnotationArgs = {$text: {$search: term}};

  var searchableResources = [];

  this.searchByOwnership = function (ownerId) {
    if (!ownerId) {
      return this;
    }
    videoAnnotationArgs.authorId = ownerId;
    courseArgs.authorID = ownerId;
    courseArgs.createdBy = ownerId;
    return this;
  };

  this.searchByResource = function (resources) {
    searchableResources = resources;
    return this;
  };

  this.build = function () {

    var videoSearch = VideoAnnotation
      .findAsync(videoAnnotationArgs)
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

    var engines = {
      categories: Categories.findAsync(categoryArgs),
      courses: Courses.findAsync(courseArgs),
      videoAnnotations: videoSearch,
      pdfAnnotations: PdfAnnotation.findAsync(pdfAnnotationArgs)
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

