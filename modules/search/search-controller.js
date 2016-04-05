'use strict';

var Promise = require('bluebird');
var mongoose = require('mongoose');
var VideoAnnotation = require('../../modules/annotations/video-annotation');
var Courses = require('../../modules/catalogs/courses');
var _ = require('lodash');

Promise.promisifyAll(mongoose);

var search = function (req, res, next) {
  // Require a search term
  var term = req.query.term;
  if (!term) {
    return res.status(400).json();
  }

  var query = {$text: {$search: term}};
  var filterCategories = req.query.categories;

  var categories = {
    courses: Courses.find(query).execAsync(),
    annotations: VideoAnnotation.find(query).execAsync()
  };

  var props = {};
  _.each(filterCategories, function (filter) {
    props[filter] = categories[filter];
  });

  Promise.props(props)
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