/**
 * /api/courseAnalytics/*
 */
var express = require('express');
var passport = require('passport');
var config = require('config');
var mongoose = require('mongoose');

var appRoot = require('app-root-path');
var Course = require(appRoot + '/modules/applications/course-analytics/enrolledUserList');

var helper = require(appRoot + '/libs/core/generalLibs.js');

var router = express.Router();


router.get('/:courseId', function(req, res, next) {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    var crs = new Course();
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

module.exports = router;
