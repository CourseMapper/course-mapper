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

    UserCourses.find(params).exec(function (err, res) {
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
    Resources.find(params).exec(function (err, res){
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
    Posts.find(params).exec(function (err, res){
        if (err) error(err);
        else {done(res)}
    });

};

module.exports = courseHistory;