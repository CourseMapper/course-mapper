'use strict';

var VideoAnnotation = require('../../modules/annotations/video-annotation');
var PdfAnnotation = require('../../modules/slide-viewer/annotation');
var Courses = require('../../modules/catalogs/courses');
var Categories = require('../../modules/catalogs/categories');

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
    var engines = {
      categories: Categories.find(categoryArgs).execAsync(),
      courses: Courses.find(courseArgs).execAsync(),
      videoAnnotations: VideoAnnotation.find(videoAnnotationArgs).execAsync(),
      pdfAnnotations: PdfAnnotation.find(pdfAnnotationArgs).execAsync()
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

