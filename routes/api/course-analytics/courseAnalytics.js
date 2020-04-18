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
var CourseHistory = require(appRoot + '/modules/applications/course-analytics/course-history.controller');
var TopContent = require(appRoot + '/modules/applications/top-content/top-content.controller');
var TopContributor = require(appRoot + '/modules/applications/top-contributor/top-contributor.controller');

var helper = require(appRoot + '/libs/core/generalLibs.js');

var router = express.Router();


router.get('/user-list/:courseId', function(req, res, next) {

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

router.get('/course-history/enrolled-users/:courseId', function (req, res, next){

    var ch = new CourseHistory();
    ch.getHistoryFollower(
        function error(err) {
            res.status(200).json({result:false, message: err})
        },
        {
            course: mongoose.Types.ObjectId(req.params.courseId)
        },
        function success(users) {
            res.status(200).json({result: true, users: users})
        }
    );
});

router.get('/course-history/pdf-upload/:courseId', function (req, res, next){
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }
    var ch = new CourseHistory();
    ch.getHistoryPdf(
        function error (err) {
            res.status(200).json({result:false, message: err})
        },
        {
            courseId:mongoose.Types.ObjectId(req.params.courseId)
        },
        function success (pdf) {
            res.status(200).json({result: true, pdf: pdf})
        }
    );
});

router.get('/course-history/video-upload/:courseId', function (req, res, next){
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }
    var ch = new CourseHistory();
    ch.getHistoryVideo(
        function error (err) {
            res.status(200).json({result:false, message: err})
        },
        {
            courseId:mongoose.Types.ObjectId(req.params.courseId)
        },
        function success (videos) {
            res.status(200).json({result: true, videos: videos})
        }
    );
});

router.get('/course-history/discussions/:courseId', function (req, res, next){
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }
    var ch = new CourseHistory();
    ch.getHistoryDiscussion(
        function error (err) {
            res.status(200).json({result:false, message: err})
        },
        {
            course:mongoose.Types.ObjectId(req.params.courseId)
        },
        function success (discussions) {
            res.status(200).json({result: true, discussions: discussions})
        }
    );
});

router.get('/course-history/pdf-annotations/:courseId', function (req, res, next){
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }
    var ch = new CourseHistory();
    ch.getHistoryPdfAnnotations (
        function error (err) {
           res.status(200).json({result:false, message: err})
        },
        {
            courseId:mongoose.Types.ObjectId(req.params.courseId)
        },
        function success (pdfAnnotations) {
            res.status(200).json({result:true, pdfAnnotations: pdfAnnotations})
        }
    );
});

router.get('/course-history/video-annotations/:courseId', function (req, res, next){
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }
    var ch = new CourseHistory();
    ch.getHistoryVideoAnnotations (
        function error (err) {
            res.status(200).json({result:false, message: err})
        },
        {
            courseId:mongoose.Types.ObjectId(req.params.courseId)
        },
        function success (videoAnnotations) {
            res.status(200).json({result:true, videoAnnotations: videoAnnotations})
        }
    );
});

router.get('/course-history/links/:courseId', function (req, res, next){
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }
    var ch = new CourseHistory();
    ch.getHistoryLinks (
        function error (err) {
            res.status(200).json({result:false, message: err})
        },
        {
            courseId:mongoose.Types.ObjectId(req.params.courseId)
        },
        function success (links) {
            res.status(200).json({result:true, links: links})
        }
    );
});

router.get('/course-history/external-resources/:courseId', function (req, res, next){
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }
    var ch = new CourseHistory();
    ch.getHistoryExtResources (
        function error (err) {
            res.status(200).json({result:false, message: err})
        },
        {
            courseId:mongoose.Types.ObjectId(req.params.courseId)
        },
        function success (links) {
            res.status(200).json({result:true, links: links})
        }
    );
});

router.get('/top-content/pdf-annotation/:courseId', function (req, res, next){
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }
    var tc = new TopContent();
    tc.getTopAnnotatedPdf (
        function error (err) {
          res.status(200).json({result:false, message:err})
        },
        {
            courseId:mongoose.Types.ObjectId(req.params.courseId)
        },
        function success (topAnnotatedPdf) {
            res.status(200).json({result:true, topAnnotatedPdf:topAnnotatedPdf})
        }
    );
});

router.get('/top-content/video-annotation/:courseId', function (req, res, next){
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }
    var tc = new TopContent();
    tc.getTopAnnotatedVideo (
        function error (err) {
            res.status(200).json({result:false, message:err})
        },
        {
            courseId:mongoose.Types.ObjectId(req.params.courseId)
        },
        function success (topAnnotatedVideo) {
            res.status(200).json({result:true, topAnnotatedVideo:topAnnotatedVideo})
        }
    );
});

router.get('/top-content/link-node/:courseId', function (req, res, next){
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }
    var tc = new TopContent();
    tc.getTopLinkNode (
        function error (err) {
            res.status(200).json({result:false, message:err})
        },
        {
            courseId:mongoose.Types.ObjectId(req.params.courseId)
        },
        function success (topLinkNode) {
            res.status(200).json({result:true, topLinkNode:topLinkNode})
        }
    );
});

router.get('/top-content/external-resource-node/:courseId', function (req, res, next){
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }
    var tc = new TopContent();
    tc.getTopExtResourcesNode (
        function error (err) {
            res.status(200).json({result:false, message:err})
        },
        {
            courseId:mongoose.Types.ObjectId(req.params.courseId)
        },
        function success (data) {
            res.status(200).json({result:true, topExtResourcesNode:data})
        }
    );
});

router.get('/top-contributor/user-list/:courseId', function (req, res, next){

    var tc = new TopContributor();
    tc.getTopContributorList (
        function error (err) {
            res.status(200).json({result:false, message:err})
        },
        {
            courseId:mongoose.Types.ObjectId(req.params.courseId)
        },
        function success (topContributor) {
            res.status(200).json({result:true, topContributor:topContributor})
        }
    );
});

module.exports = router;