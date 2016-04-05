'use strict';

var Promise = require('bluebird');
var SearchBuilder = require('./search-builder');

var search = function (req, res, next) {
  // Require a search term
  var term = req.query.term;
  if (!term) {
    return res.status(400).json();
  }

  var searchBuilder = new SearchBuilder(term);
  searchBuilder.searchByResource(req.query.resources);
  searchBuilder.searchByOwnership(req.query.owner);

  var query = searchBuilder.build();

  Promise.props(query)
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