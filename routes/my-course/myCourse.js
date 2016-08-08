/**
 * example of an app route called my-course
 * its file name is up to you because the system will automatically pick up any file that is exist on this folder "/routes/my-course/"
 *
 * all routes inside this file will be prefixed under its folder name, which is /my-course
 *
 * if you have api request to your app, please also write the api route here. and it will be prefixed to
 * /my-course/api/[your method]
 *
 */

var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');

var router = express.Router();

/**
 * example of an entry point route
 */
router.get('/my-following-courses', function (req, res, next) {
  res.render('my-course/following-course');
});

router.get('/my-enrolled-courses', function (req, res, next) {
  res.render('my-course/enrolled-courses');
});

router.get('/my-created-courses', function (req, res, next) {
  res.render('my-course/created-courses');
});

router.get('/my-pdf-status', function (req, res, next) {
  res.render('my-course/pdf-status');
});

router.get('/my-video-status', function (req, res, next) {
  res.render('my-course/video-status');
});

router.get('/my-course-progress', function (req, res, next) {
  res.render('my-course/course-history');
});

router.get('/my-courses-breakdown', function (req, res, next) {
  res.render('my-course/courses-breakdown');
});

router.get('/my-activity-summary', function (req, res, next) {
  res.render('my-course/activity-summary');
});

router.get('/participation-balance', function (req, res, next) {
  res.render('my-course/participation-balance');
});

module.exports = router;
