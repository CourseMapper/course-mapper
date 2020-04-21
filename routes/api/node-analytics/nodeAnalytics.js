/**
 * /api/nodeAnalytics/*
 */
var express = require('express');
var passport = require('passport');
var config = require('config');
var mongoose = require('mongoose');

var appRoot = require('app-root-path');
//var EnrolledUser = require(appRoot + '/modules/applications/course-analytics/enrolledUserList');
//var CoursePreviewStats = require(appRoot + '/modules/applications/course-analytics/coursePreviewStats.controller');
//var CourseHistory = require(appRoot + '/modules/applications/course-analytics/course-history.controller');
var NodeHistory = require(appRoot + '/modules/applications/node-analytics/node-history.controller');
var helper = require(appRoot + '/libs/core/generalLibs.js');

var router = express.Router();

router.get('/node-history/pdf-annotations/:nodeId', function (req, res, next){
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }
    var ch = new NodeHistory();
    ch.getHistoryPdfAnnotations (
        function error (err) {
            res.status(200).json({result:false, message: err})
        },
        {
            treeNodeId:mongoose.Types.ObjectId(req.params.nodeId)
        },
        function success (pdfAnnotations) {
            res.status(200).json({result:true, pdfAnnotations: pdfAnnotations})
        }
    );
});

router.get('/node-history/video-annotations/:nodeId', function (req, res, next){
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }
    var ch = new NodeHistory();
    ch.getHistoryVideoAnnotations (
        function error (err) {
            res.status(200).json({result:false, message: err})
        },
        {
            treeNodeId:mongoose.Types.ObjectId(req.params.nodeId)
        },
        function success (videoAnnotations) {
            res.status(200).json({result:true, videoAnnotations: videoAnnotations})
        }
    );
});

router.get('/node-history/links/:nodeId', function (req, res, next){
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }
    var ch = new NodeHistory();
    ch.getHistoryLinks (
        function error (err) {
            res.status(200).json({result:false, message: err})
        },
        {
            treeNodeId:mongoose.Types.ObjectId(req.params.nodeId)
        },
        function success (links) {
            res.status(200).json({result:true, links: links})
        }
    );
});

router.get('/node-history/external-resources/:nodeId', function (req, res, next){
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }
    var ch = new NodeHistory();
    ch.getHistoryExtResources (
        function error (err) {
            res.status(200).json({result:false, message: err})
        },
        {
            treeNodeId:mongoose.Types.ObjectId(req.params.nodeId)
        },
        function success (data) {
            res.status(200).json({result:true, extResources: data})
        }
    );
});

module.exports = router;