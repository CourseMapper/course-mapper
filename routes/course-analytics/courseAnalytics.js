/**
 * course-analytics app route
 *
 */

var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');

var router = express.Router();

/**
 * entry point route for course-analytics
 */
router.get('/ca-top-contributors', function(req, res, next) {
    res.render('course-analytics/top-contributors');
});

router.get('/ca-statistics', function(req, res, next) {
    res.render('course-analytics/statistics');
});

router.get('/ca-preview-top-contributors', function(req, res, next) {
    res.render('course-analytics/preview-top-contributors');
});

router.get('/ca-preview-statistics', function(req, res, next) {
    res.render('course-analytics/preview-statistics');
});

router.get('/ca-history-analytics', function(req, res, next) {
    res.render('course-analytics/history-analytics');
});

router.get('/ca-node-history-analytics', function (req, res, next){
   res.render('course-analytics/node-history-analytics');
});

router.get('/ca-enrolled-users', function(req, res, next) {
    res.render('course-analytics/enrolled-users');
});

router.get('/ca-top-content',function (req, res, next){
   res.render('course-analytics/top-content');
});

router.get('/ca-top-contributor', function(req, res, next){
    res.render('course-analytics/top-contributor');
});


module.exports = router;
