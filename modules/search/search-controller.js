'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');
var SearchQueryBuilder = require('./search-query-builder');
// Load modules
var VideoAnnotation = require('../../modules/annotations/video-annotation');

Promise.promisifyAll(mongoose);

var getResults = function (query, callback) {
  var q = {$text: {$search: query.term}};

  Promise.props({
      annotations: VideoAnnotation.find(q).execAsync()
    })
    .then(function (results) {
      callback(null, results);
    })
    .catch(function (err) {
      callback(err)
    });
};

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
  getResults(query, function (err, results) {
    return res.json(results);
  })
};

module.exports = {
  search: search
};