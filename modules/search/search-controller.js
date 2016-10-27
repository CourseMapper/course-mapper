'use strict';

var Promise = require('bluebird');
var SearchBuilder = require('./search-builder');
var _ = require('lodash');

var matchResult = function (title, description, type, link) {
  this.title = title;
  this.link = link;
  this.type = type;
  this.description = description;
  this.score = 0.0;
}

// parse the object to a search result
var parseObject = function (collection, match) {

  var result = null;
  switch (collection) {
    case 'contentNodes':
      result = parseContentNode(match);
      break;

    case 'courses':
      result = parseCourse(match);
      break;

    case 'videoAnnotations':
      result = parseVideoAnnotation(match);
      break;

    case 'pdfAnnotations':
      result = parsePdfAnnotation(match);
      break;

    case 'categories':
      result = parseCategory(match);
      break;
  }

  // Set the match score
  if (result) {
    result.score = match.score;
  }

  return result;
}


var parseCourse = function (course) {
  var title = course.name;
  var desc = course.description;
  var type = 'course';
  var link = '';

  return new matchResult(title, desc, type, link);
}

var parseContentNode = function (content) {
  var title = content.name;
  var desc = content.description;
  var type = 'contentNode';
  var link = '';

  return new matchResult(title, desc, type, link);
}

var parseVideoAnnotation = function (va) {
  var title = va.text;
  var desc = '[' + va.start + '] - [' + va.end + ']';
  var type = 'videoAnnotation';
  var link = '';

  return new matchResult(title, desc, type, link);
}

var parsePdfAnnotation = function (pdf) {
  var title = pdf.renderedText;
  var desc = '[' + pdf.pdfPageNumber + ']';
  var type = 'pdfAnnotation';
  var link = '';

  return new matchResult(title, desc, type, link);
}

var parseCategory = function (cat) {
  var title = cat.name;
  var desc = '';
  var type = 'category';
  var link = '';

  return new matchResult(title, desc, type, link);
}

var search = function (req, res, next) {
  // Require a search term
  var term = req.query.term;
  if (!term) {
    return res.status(400).json();
  }

  var query = new SearchBuilder(term)
    .searchByResource(req.query.resources)
    .searchByOwnership(req.query.owner)
    .build();

  Promise.props(query)
    .then(function (results) {
      res.json(results);
    })
    .catch(function (err) {
      res.status(500).send(err);
    });
};

var advancedSearch = function (req, res, next) {
  // Require a search term
  var term = req.query.term;
  if (!term) {
    return res.status(400).json();
  }

  var query = new SearchBuilder(term)
    .searchByResource(req.query.resources)
    .searchByOwnership(req.query.owner)
    .build();

  Promise.props(query)
    .then(function (data) {

      // Flatten items to a single dimensional array
      var matches = []
      for (var collectionType in data) {
        var items = data[collectionType];
        _.each(items, function (o) {
          matches.push(parseObject(collectionType, o));
        })
      }
      // Sort by score
      var sorted = _.sortByOrder(matches, 'score', 'desc');
      res.json(sorted);
    })
    .catch(function (err) {
      console.log(err)
      res.status(500).send(err);
    });
};

module.exports = {
  search: search,
  advancedSearch: advancedSearch
};