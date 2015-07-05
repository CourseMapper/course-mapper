var express = require('express');
var config = require('config');
<<<<<<< HEAD
var appRoot = require('app-root-path');
var Account = require(appRoot + '/modules/accounts');
=======
var appRoot = require('app-root-path'); 
var Course = require(appRoot + '/modules/catalogs/course.controller.js');
>>>>>>> 2eb329e44827e6ef0d379b2b3a8b53ac564d0bee
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
    res.render(config.get('theme') + '/catalogs/newCourseModal');
});

router.get('/course/edit', function(req, res, next) {
    res.render(config.get('theme') + '/catalogs/editCourseModal');
});

router.get('/course/:courseId/tree', function(req, res, next) {
    res.render(config.get('theme') + '/catalogs/course1', { title: req.params.courseId });
});

router.get('/course/:slug', function(req, res, next) {
    var params = {
        slug: req.params.slug
    };

    var c = new Course();
    c.getCourse(
        function(err){
            res.send(500);
        },

        params,

        function(crs){
            if(!crs)
                res.send(404);
            else
                res.render(config.get('theme') + '/catalogs/course', { title: crs.name, course:crs, user: req.user, moment:moment });
        }
    );

});

module.exports = router;
