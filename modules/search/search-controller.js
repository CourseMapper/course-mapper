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
    this.created = '';
    this.updated = '';
}

var parseCourse = function (course) {
    var title = course.name;
    var desc = course.smallDescription;
    var type = 'course';
    var link = '/course/' + course.slug + '/#/cid/' + course._id + '?tab=preview';

    var match = new matchResult(title, desc, type, link);
    match.created = course.dateAdded;
    match.updated = course.dateUpdated;
    match.users = course.totalEnrollment;
    match.favorited = course.favorited;
    return match;
};

var parseContentNode = function (content) {
    var title = content.name;
    var desc = content.description;
    var type = 'contentNode';

    var link = '';
    if (content.type == 'contentNode') {
        link = '/treeNode/' + content._id + '/#/cid/' + content.courseId._id + '/nid/' + content._id;
    } else if (content.type == 'subTopic') {
        link = '/course/' + content.courseId.slug + '/#/cid/' + content.courseId._id + '?tab=map&markedNode=' + content._id;
    }

    var match = new matchResult(title, desc, type, link);
    match.created = content.dateAdded;
    match.updated = content.dateUpdated;
    return match;
};

var parseVideoAnnotation = function (va) {
    var title = 'Video Annotation [' + va.start / 1000 + '-' + va.end / 1000 + '] sec.';
    var desc = va.text;
    var type = 'videoAnnotation';
    var link = '/treeNode/' + va.nodeId + '/#/cid/' + va.courseId + '/nid/' + va.nodeId + '?tab=video#' + va._id;

    var match = new matchResult(title, desc, type, link);
    match.created = va.date_created;
    match.updated = va.date_modified;
    return match;
};

var parsePdfAnnotation = function (pa) {
    var title = 'PDF Annotation on page ' + pa.pdfPageNumber;
    var desc = pa.renderedText;
    var type = 'pdfAnnotation';
    var link = '/treeNode/' + pa.nodeId + '/#/cid/' + pa.courseId + '/nid/' + pa.nodeId + '?tab=pdf&slidePage=' + pa.pdfPageNumber;

    var match = new matchResult(title, desc, type, link);
    // TODO - Add dates
    return match;
};

var parseCategory = function (cat) {
    var title = cat.name;
    var desc = '';
    var type = 'category';
    var link = '/courses/#/category/' + cat.slug;

    var match = new matchResult(title, desc, type, link);
    match.created = cat.dateAdded;
    match.updated = cat.dateUpdated;
    return match;
};

var parseExtResources = function (er) {
    var title = er.title;
    var desc = er.description;
    var type = 'extResources';
    var link = '/treeNode/' + er.contentId + '/#/cid/' + er.courseId + '/nid/' + er.contentId + '?tab=learningHub&hid=' + er._id;

    var match = new matchResult(title, desc, type, link);
    return match;
};
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

        case 'extResources':
            result = parseExtResources(match);
            break;
    }

    // Set the match score
    if (result) {
        result.score = match.score;
    }

    return result;
};

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
        .searchInNetwork(req.query.network)
        .build();

    Promise.props(query)
        .then(function (data) {
            // Flatten items to a single dimensional array
            var matches = [];
            for (var collectionType in data) {
                var items = data[collectionType];
                _.each(items, function (o) {
                    matches.push(parseObject(collectionType, o));
                });
            }
            // Sort by score
            var sorted = _.sortBy(matches, 'score', 'desc');
            res.json(sorted);
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
};

var relevantSearch = function (req, res, next) {
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
            var matches = [];
            for (var collectionType in data) {
                var items = data[collectionType];
                _.each(items, function (o) {
                    matches.push(parseObject(collectionType, o));
                });
            }

            // Sort by score
            var sorted = _.sortBy(matches, 'score', 'desc');
            res.json(sorted);
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
};

module.exports = {
    search: search,
    advancedSearch: advancedSearch,
    relevantSearch: relevantSearch
};