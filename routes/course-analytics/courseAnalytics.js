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

router.get('/top-contributors', function(req, res, next) {
    res.render('course-analytics/topContributors');
});



module.exports = router;
