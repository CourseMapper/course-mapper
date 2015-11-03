/**
 * /api/myCourse/*
 */
var express = require('express');
var passport = require('passport');
var config = require('config');
var mongoose = require('mongoose');

var appRoot = require('app-root-path');
var Course = require(appRoot + '/modules/applications/my-course/myEnrolledCourses');
var PdfStatus = require(appRoot + '/modules/applications/my-course/myPDFStatus');

var helper = require(appRoot + '/libs/core/generalLibs.js');

var router = express.Router();


router.get('/', function(req, res, next) {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    var crs = new Course();
    crs.getEnrolledCourses(
        function error(err){
            res.status(200).json({result:false, message:err});
        },
        {
            user: mongoose.Types.ObjectId(req.user._id)
        },
        function success(courses){
                res.status(200).json({result:true, courses:courses});
        }
    );


});

router.get('/pdf-history', function (req, res, next){
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    var pHis = new PdfStatus();
    pHis.getPdfStatus(
        function error(err){
            res.status(500).json({result:false, message:err});
        },
        {
            userId: mongoose.Types.ObjectId(req.user._id)
        },
        function success(pdfHistory){
            res.status(200).json({result:true, pdfHistory:pdfHistory });
        }
    )




});


module.exports = router;
