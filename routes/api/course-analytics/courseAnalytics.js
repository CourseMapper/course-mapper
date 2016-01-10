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

router.get('/course-stats/total-user/:courseId', function(req, res, next) {
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

router.get('/course-stats/total-video/:courseId', function(req, res, next) {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    var crs = new CoursePreviewStats();
    crs.getTotalVideo(
        function error(err){
            res.status(200).json({result:false, message:err});
        },
        {
            courseId: mongoose.Types.ObjectId(req.params.courseId)
        },
        function success(totalVideo){
            res.status(200).json({result:true, totalVideo:totalVideo});
        }
    );

});

router.get('/course-stats/total-pdf/:courseId', function(req, res, next) {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    var crs = new CoursePreviewStats();
    crs.getTotalPdf(
        function error(err){
            res.status(200).json({result:false, message:err});
        },
        {
            courseId: mongoose.Types.ObjectId(req.params.courseId)
        },
        function success(totalPdf){
            res.status(200).json({result:true, totalPdf:totalPdf});
        }
    );

});

router.get('/course-stats/total-discussion/:courseId', function(req, res, next) {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    var crs = new CoursePreviewStats();
    crs.getTotalDiscussion(
        function error(err){
            res.status(200).json({result:false, message:err});
        },
        {
            course: mongoose.Types.ObjectId(req.params.courseId)
        },
        function success(totalDiscussion){
            res.status(200).json({result:true, totalDiscussion:totalDiscussion});
        }
    );

});

router.get('/course-stats/course-creator/:courseId', function(req, res, next) {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    var crs = new CoursePreviewStats();
    crs.getCourseCreator(
        function error(err){
            res.status(200).json({result:false, message:err});
        },
        {
            _id: mongoose.Types.ObjectId(req.params.courseId)
        },
        function success(creator){
            res.status(200).json({result:true, creator:creator});
        }
    );

});


module.exports = router;
