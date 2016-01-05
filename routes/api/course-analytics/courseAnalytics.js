/**
 * /api/courseAnalytics/*
 */
var express = require('express');
var passport = require('passport');
var config = require('config');
var mongoose = require('mongoose');

var appRoot = require('app-root-path');
var EnrolledUser = require(appRoot + '/modules/applications/course-analytics/enrolledUserList');
var CoursePreviewStats = require(appRoot + '/modules/applications/course-analytics/coursePreviewStats.controller');

var helper = require(appRoot + '/libs/core/generalLibs.js');

var router = express.Router();


router.get('/:courseId', function(req, res, next) {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    var crs = new EnrolledUser();
    crs.getUserList(
        function error(err){
            res.status(200).json({result:false, message:err});
        },
        {
            course: mongoose.Types.ObjectId(req.params.courseId)
        },
        function success(courses){
            res.status(200).json({result:true, courses:courses});
        }
    );

});

//TODO: Change /total-user to /courseStats and provide API stats that not only respond with total user but also with  summary of total pdf/video, etc... or use available API?
router.get('/total-user/:courseId', function(req, res, next) {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    var crs = new CoursePreviewStats();
    crs.getTotalUser(
        function error(err){
            res.status(200).json({result:false, message:err});
        },
        {
            course: mongoose.Types.ObjectId(req.params.courseId)
        },
        function success(isEnrolled){
            res.status(200).json({result:true, userEnrolled:isEnrolled});
        }
    );

});

module.exports = router;
