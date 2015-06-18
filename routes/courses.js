var express = require('express');
var config = require('config');
var appRoot = require('app-root-path'); 
var Account = require(appRoot + '/modules/accounts');
var debug = require('debug')('cm:route');
var moment = require('moment'); 
var router = express.Router();
 
/**
 * get courses based on category slug
 * return: html view
 */
router.get('/courses', function (req, res, next){
        res.render(config.get('theme') + '/catalogs/courses', { req:req, title: 'Browse for Courses', user: req.user, showSidebar:true });
});

router.get('/course/create', function(req, res, next) {
    res.render(config.get('theme') + '/catalogs/newCourse');
});

router.get('/course/create/:categorySlug', function(req, res, next) {
    res.render(config.get('theme') + '/catalogs/newCourseModal');
});

router.get('/course/:courseId/tree', function(req, res, next) {
    res.render(config.get('theme') + '/catalogs/course1', { title: req.params.courseId });
});

router.get('/course/:courseId', function(req, res, next) {
    var params = {
        courseId: req.params.courseId
    };

    if(req.user) params.userId = req.user._id;

    var account = new Account();
    account.getUserCourses(
        function failed(err){
            res.status(500).send({errors:err});
        },
        params,
        function (course, follow){
            res.render(config.get('theme') + '/catalogs/course', { title: course.course, course:course, user: req.user, follow: follow, moment:moment });
        }
    );
});

module.exports = router;