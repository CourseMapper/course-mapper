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
router.get('/my-following-courses', function(req, res, next) {
    res.render('my-course/followingCourse');
});

/**
 * example of an entry point route
 */
router.get('/journey', function(req, res, next) {
    res.render('my-course/journey' );
});

/**
 * example of api route
 */
router.get('/api/getmycourses', function(req, res, next) {
    res.status(200).json({result:true});
});

module.exports = router;