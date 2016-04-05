'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');
var SearchQueryBuilder = require('./search-query-builder');
// Load modules
var VideoAnnotation = require('../../modules/annotations/video-annotation');
var Courses = require('../../modules/catalogs/courses');

Promise.promisifyAll(mongoose);

var search = function (req, res, next) {
  // Require a search term
  var term = req.query.term;
  if (!term) {
    return res.status(400).json();
  }
  // Build query
  var queryBuilder = new SearchQueryBuilder(term);
  queryBuilder.filterByUserId(req.query.uid);

  var query = queryBuilder.build();

  Promise.props({
      courses: Courses.find(query).execAsync(),
      annotations: VideoAnnotation.find(query).execAsync()
    })
    .then(function (results) {
      res.json(results);
    })
    .catch(function (err) {
      res.status(500).send(err);
    });

};

module.exports = {
  search: search
};