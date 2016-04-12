var config = require('config');
var UserCourses = require('../../catalogs/userCourses.js');
var Courses = require('../../catalogs/courses.js');
var Resources = require('../../trees/resources.js');
var Posts = require('../../discussion/models/posts.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');
var appRoot = require('app-root-path');
var handleUpload = require(appRoot + '/libs/core/handleUpload.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
//var _ = require('underscore');

function coursePreviewStats() {
}


coursePreviewStats.prototype.getTotalUser = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['course'], error)) {
        return;
    }

    //var self = this;

    params.course = mongoose.Types.ObjectId(params.course);
    params.isEnrolled = true;

    UserCourses.find(params).count().exec(function (err, res) {
        if (err) error(err);
        else {
            done(res);

        }

    });
};

coursePreviewStats.prototype.getTotalVideo = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['courseId'], error)) {
        return;
    }

    //var self = this;
    params.courseId = mongoose.Types.ObjectId(params.courseId);
    params.type = 'pdf';
    params.isDeleted = false;

    Resources.find({courseId:params.courseId, isDeleted:params.isDeleted, type:{$ne: params.type}}).count().exec(function (err, res) {
        if (err) error(err);
        else {
            done(res);
        }

    });
};

coursePreviewStats.prototype.getTotalPdf = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['courseId'], error)) {
        return;
    }

    //var self = this;
    params.courseId = mongoose.Types.ObjectId(params.courseId);
    params.type = 'pdf';
    params.isDeleted = false;

    Resources.find(params).count().exec(function (err, res) {
        if (err) error(err);
        else {
            done(res);
        }

    });
};

coursePreviewStats.prototype.getTotalDiscussion = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['course'], error)) {
        return;
    }

    //var self = this;
    params.course = mongoose.Types.ObjectId(params.course);
    params.isDeleted = false;

    Posts.find(params).count().exec(function (err, res) {
        if (err) error(err);
        else {
            done(res);
        }

    });
};

coursePreviewStats.prototype.getCourseCreator = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['_id'], error)) {
        return;
    }

    //var self = this;
    params._id = mongoose.Types.ObjectId(params._id);

    Courses.findOne(params).populate('createdBy').exec(function (err, res) {
        if (err) error(err);
        else {
            done(res);
        }

    });
};



module.exports = coursePreviewStats;