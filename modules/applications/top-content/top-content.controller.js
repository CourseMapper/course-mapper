var config = require('config');
var UserCourses = require('../../catalogs/userCourses.js');
var Courses = require('../../catalogs/courses.js');
var Resources = require('../../trees/resources.js');
var Posts = require('../../discussion/models/posts.js');
var PdfAnnotation = require('../../slide-viewer/annotation.js');
var VideoAnnotation = require('../../annotations/video-annotation.js');
var SubTopics = require('../../trees/treeNodes.js');
var Links = require('../../links/models/links.js');
var TopContent = require('./models/topContent.model.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');
var appRoot = require('app-root-path');
var handleUpload = require(appRoot + '/libs/core/handleUpload.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var moment = require('moment');
var today = moment().startOf('day');
var lastYear = moment(today).subtract(12, 'months');
var _ = require('underscore');

function topContent() {

}

topContent.prototype.getTopAnnotatedPdf = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['courseId'], error)) {
        return;
    }

    params.courseId = mongoose.Types.ObjectId(params.courseId);
    params.contentType = "pdf";
    params.countType = "annotation";
    params.isDeleted = false;
    
    TopContent.findOne(params).populate('nodeId', '_id name').sort('-count').exec(function(err, docs){
        if (err){
            error(err);
        } else {
            done(docs);

        }
    });

};

topContent.prototype.getTopAnnotatedVideo = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['courseId'], error)) {
        return;
    }

    params.courseId = mongoose.Types.ObjectId(params.courseId);
    params.contentType = "video";
    params.countType = "annotation";
    params.isDeleted = false;

    TopContent.findOne(params).populate('nodeId', '_id name').sort('-count').exec(function(err, docs){
        if (err){
            error(err);
        } else {
            done(docs);

        }
    });

};

topContent.prototype.getTopLinkNode = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['courseId'], error)) {
        return;
    }

    params.courseId = mongoose.Types.ObjectId(params.courseId);
    params.contentType = "node";
    params.countType = "link";
    params.isDeleted = false;

    TopContent.findOne(params).populate('nodeId', '_id name').sort('-count').exec(function(err, docs){
        if (err){
            error(err);
        } else {
            done(docs);

        }
    });

};

topContent.prototype.getTopExtResourcesNode = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['courseId'], error)) {
        return;
    }

    params.courseId = mongoose.Types.ObjectId(params.courseId);
    params.contentType = "node";
    params.countType = "ext-resource";
    params.isDeleted = false;

    TopContent.findOne(params).populate('nodeId', '_id name').sort('-count').exec(function(err, docs){
        if (err){
            error(err);
        } else {
            done(docs);

        }
    });

};

module.exports = topContent;