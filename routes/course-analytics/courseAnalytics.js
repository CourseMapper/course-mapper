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
router.get('/ca-preview-statistics', function(req, res, next) {
    res.render('course-analytics/ca-preview-statistics');
});

router.get('/ca-preview-top-contributors', function(req, res, next) {
    res.render('course-analytics/ca-preview-top-contributors');
});



module.exports = router;
