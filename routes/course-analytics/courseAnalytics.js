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
router.get('/course-statistics', function(req, res, next) {
    res.render('course-analytics/courseStatistics');
});

router.get('/ca-top-contributors', function(req, res, next) {
    res.render('course-analytics/ca-top-contributors');
});



module.exports = router;
