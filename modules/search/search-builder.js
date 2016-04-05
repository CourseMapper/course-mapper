'use strict';

var VideoAnnotation = require('../../modules/annotations/video-annotation');
var Courses = require('../../modules/catalogs/courses');
var mongoose = require('mongoose');
var _ = require('lodash');
var Promise = require('bluebird');

Promise.promisifyAll(mongoose);

var SearchBuilder = function (term) {
  var courseSearchOptions = {$text: {$search: term}};
  var annotationSearchOptions = {$text: {$search: term}};

  var searchableResources = [];

  this.searchByOwnership = function (ownerId) {
    if (!ownerId) {
      return this;
    }
    annotationSearchOptions.authorId = ownerId;
    courseSearchOptions.createdBy = ownerId;
    return this;
  };

  this.searchByResource = function (resources) {
    if (!resources) {
      return this;
    }
    searchableResources = resources;
    return this;
  };

  this.build = function () {
    var engines = {};
    engines.courses = Courses.find(courseSearchOptions).execAsync();
    engines.annotations = VideoAnnotation.find(annotationSearchOptions).execAsync();

    // Filter the searched resources
    var searchQuery = {};
    _.each(searchableResources, function (category) {
      searchQuery[category] = engines[category];
    });
    return searchQuery;
  };
};

module.exports = SearchBuilder;

