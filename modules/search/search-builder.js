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
var Favorites = require('../../modules/favorites/favorite-courses');
var ExtResources = require('../../modules/learningHub/models/hub');

var SearchBuilder = function (term) {

    var sortByScore = {score: {$meta: "textScore"}};

    var courseArgs = {$text: {$search: term}};
    var contentNodeArgs = {$text: {$search: term}, isDeleted: false};
    var categoryArgs = {$text: {$search: term}};
    var videoAnnotationArgs = {$text: {$search: term}};
    var pdfAnnotationArgs = {$text: {$search: term}};
    var extResourcesArgs = {$text: {$search: term}};

    var searchableResources = [];
    var isNetworkEnabled = false;

    this.searchByOwnership = function (ownerId) {
        if (!ownerId) {
            return this;
        }
        videoAnnotationArgs.authorId = ownerId;
        pdfAnnotationArgs.authorID = ownerId;
        courseArgs.createdBy = ownerId;
        contentNodeArgs.createdBy = ownerId;
        extResourcesArgs.userId = ownerId;
        return this;
    };

    this.searchByResource = function (resources) {
        if (resources) {
            searchableResources = resources.split(',');
        }
        else {
            searchableResources = null;
        }
        return this;
    };

    //TODO
    this.searchInNetwork = function (enabled) {
        isNetworkEnabled = enabled;
        return this;
    };

    this.build = function () {

        var findVideoAnnotations = VideoAnnotation.find(videoAnnotationArgs, sortByScore).lean().execAsync()
            .then(function (videoAnnotations) {
                var promises = [];
                _.each(videoAnnotations, function (videoAnnotation) {
                    promises.push(Resources.findByIdAsync(videoAnnotation.video_id)
                        .then(function (content) {
                            var va = videoAnnotation;
                            va.courseId = content.courseId;
                            va.nodeId = content.treeNodeId;
                            return va;
                        }));
                });
                return Promise.all(promises);
            });

        var findPdfAnnotations = PdfAnnotation.find(pdfAnnotationArgs, sortByScore).lean().execAsync()
            .then(function (pdfAnnotations) {
                var promises = [];
                _.each(pdfAnnotations, function (pdfAnnotation) {
                    promises.push(Resources.findByIdAsync(pdfAnnotation.pdfId)
                        .then(function (content) {
                            var pa = pdfAnnotation;
                            pa.courseId = content.courseId;
                            pa.nodeId = content.treeNodeId;
                            return pa;
                        }));
                });
                return Promise.all(promises);
            });

        var findCourses = Courses.find(courseArgs, sortByScore).lean().execAsync()
            .then(function (courses) {
                var promises = [];
                _.each(courses, function (course) {
                    promises.push(Favorites.count({"course": course._id})
                        .then(function (count) {
                            var c = course;
                            c.favorited = count;
                            //console.log(count);
                            return c;
                        }));
                });
                return Promise.all(promises);
            });

        var findExtResources = ExtResources.posts.find(extResourcesArgs, sortByScore).lean().execAsync()
            .then(function (extResources) {
                var promises = [];
                _.each(extResources, function (extResource) {
                     promises.push(extResource);
                });
                return Promise.all(promises);
            });


        var engines = {
            contentNodes: TreeNodes.find(contentNodeArgs, sortByScore).populate('courseId').lean().execAsync(),
            courses: findCourses,
            videoAnnotations: findVideoAnnotations,
            pdfAnnotations: findPdfAnnotations,
            categories: Categories.find(categoryArgs, sortByScore).lean().execAsync(),
            extResources: findExtResources
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