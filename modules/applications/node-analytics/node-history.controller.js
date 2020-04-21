var config = require('config');
var UserCourses = require('../../catalogs/userCourses.js');
var Courses = require('../../catalogs/courses.js');
var Resources = require('../../trees/resources.js');
var Posts = require('../../discussion/models/posts.js');
var PdfAnnotation = require('../../slide-viewer/annotation.js');
var VideoAnnotation = require('../../annotations/video-annotation.js');
var SubTopics = require('../../trees/treeNodes.js');
var Links = require('../../links/models/links.js');
var ExtResources = require('../../learningHub/models/hub.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');
var appRoot = require('app-root-path');
var handleUpload = require(appRoot + '/libs/core/handleUpload.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var moment = require('moment');
var today = moment().startOf('day');
var lastYear = moment(today).subtract(12, 'months');

function nodeHistory() {

}

nodeHistory.prototype.getHistoryPdfAnnotations = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['treeNodeId'], error)) {
        return;
    }

    params.treeNodeId = mongoose.Types.ObjectId(params.treeNodeId);
    params.isDeleted = false;

    Resources.find(params).exec(function (err, res){
        if (err) error(err);
        else {
            var ids = res.map(function(doc){return doc._id});
            PdfAnnotation.find({pdfId: {$in: ids},dateOfCreation: {'$gte': lastYear}, hasParent: false })
                .sort('dateOfCreation')
                .exec(function (error, docs){
                    if (error) error (error);
                    else {done(docs)}
                });

        }
    });

};

nodeHistory.prototype.getHistoryVideoAnnotations = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['treeNodeId'], error)) {
        return;
    }

    params.treeNodeId = mongoose.Types.ObjectId(params.treeNodeId);
    params.isDeleted = false;

    Resources.find(params).exec(function (err, res){
        if (err) error(err);
        else {
            var ids = res.map(function(doc){return doc._id});
            VideoAnnotation.find({video_id: {$in: ids},date_created: {'$gte': lastYear} })
                .sort('date_created')
                .exec(function (error, docs){
                    if (error) error (error);
                    else {done(docs)}
                });

        }
    });

};

nodeHistory.prototype.getHistoryLinks = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['treeNodeId'], error)) {
        return;
    }

    Links.find({contentNode: params.treeNodeId, isDeleted: false, dateAdded: {$gte: lastYear}}).sort('dateAdded').exec(function (err, res){
        if (err) error(err);
        else {done(res)}
    });

};

nodeHistory.prototype.getHistoryExtResources = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['treeNodeId'], error)) {
        return;
    }

    ExtResources.posts.find({contentId: mongoose.Types.ObjectId(params.treeNodeId), isDeleted: false, dateAdded: {$gte: lastYear}}).sort('dateAdded').exec(function (err, res){
        if (err) error(err);
        else {done(res)}
    });

};

module.exports = nodeHistory;