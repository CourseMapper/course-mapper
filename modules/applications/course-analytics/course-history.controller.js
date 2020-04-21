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

function courseHistory() {

}

courseHistory.prototype.getHistoryFollower = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['course'], error)) {
        return;
    }

    params.course = mongoose.Types.ObjectId(params.course);
    params.isEnrolled = true;
    params.dateUpdated = {
        $gte: lastYear
    };

    UserCourses.find(params).sort('dateUpdated').exec(function (err, res) {
        if (err) error(err);
        else {
            done(res);

        }

    });

};

courseHistory.prototype.getHistoryPdf = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['courseId'], error)) {
        return;
    }

    params.courseId = mongoose.Types.ObjectId(params.courseId);
    params.type = "pdf";
    params.isDeleted = false;
    params.dateAdded = {
        $gte: lastYear
    };
    Resources.find(params).exec(function (err, res){
        if (err) error(err);
        else {done(res)}
    });

};

courseHistory.prototype.getHistoryVideo = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['courseId'], error)) {
        return;
    }

    params.courseId = mongoose.Types.ObjectId(params.courseId);
    params.type = {$ne: "pdf"};
    params.isDeleted = false;
    params.dateAdded = {
        $gte: lastYear
    };
    Resources.find(params).sort('dateAdded').exec(function (err, res){
        if (err) error(err);
        else {done(res)}
    });

};

courseHistory.prototype.getHistoryDiscussion = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['course'], error)) {
        return;
    }

    params.course = mongoose.Types.ObjectId(params.course);
    params.isDeleted = false;
    params.dateAdded = {
        '$gte': lastYear
    };
    Posts.find(params).sort('dateAdded').exec(function (err, res){
        if (err) error(err);
        else {done(res)}
    });

};

courseHistory.prototype.getHistoryPdfAnnotations = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['courseId'], error)) {
        return;
    }

    params.courseId = mongoose.Types.ObjectId(params.courseId);
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

courseHistory.prototype.getHistoryVideoAnnotations = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['courseId'], error)) {
        return;
    }

    params.courseId = mongoose.Types.ObjectId(params.courseId);
    params.isDeleted = false;

    Resources.find(params).exec(function (err, res){
        if (err) error(err);
        else {
            var ids = res.map(function(doc){return doc._id});
            VideoAnnotation.find({video_id: {$in: ids},date_created: {'$gte': lastYear} })
            .sort('date_modified')
            .exec(function (error, docs){
                if (error) error (error);
                else {done(docs)}
            });

        }
    });

};

courseHistory.prototype.getHistoryLinks = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['courseId'], error)) {
        return;
    }

    params.courseId = mongoose.Types.ObjectId(params.courseId);
    params.isDeleted = false;

    SubTopics.find(params).exec(function (err, res){
        if (err) error(err);
        else {
            var ids = res.map(function(doc){return doc._id});
            Links.find({contentNode: {$in: ids},dateAdded: {'$gte': lastYear} })
                .sort('dateAdded')
                .exec(function (error, docs){
                    if (error) error (error);
                    else {done(docs)}
                });

        }
    });

};

courseHistory.prototype.getHistoryExtResources = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['courseId'], error)) {
        return;
    }

    params.courseId = mongoose.Types.ObjectId(params.courseId);
    params.isDeleted = false;
    params.dateAdded = {'$gte': lastYear}

    ExtResources.posts.find(params)
        .sort('dateAdded')
        .exec(function (error, docs){
            if (error) error (error);
            else {done(docs)}
        });
};

module.exports = courseHistory;