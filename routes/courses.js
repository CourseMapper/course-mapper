var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var Course = require(appRoot + '/modules/catalogs/course.controller.js');
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

router.get('/course/nodeDetail', function (req, res, next){
    res.render(config.get('theme') + '/catalogs/nodeDetail');
});

/**
 * partial for add new course modal form accessed from top menu in course list page
 */
router.get('/course/create', function(req, res, next) {
    res.render(config.get('theme') + '/catalogs/newCourseModal');
});

/**
 * partial for editCourseModal in course detail page
 */
router.get('/course/edit', function(req, res, next) {
    res.render(config.get('theme') + '/catalogs/editCourseModal');
});

/**
 * partial for map tab in course detail page
 */
router.get('/course/map', function(req, res, next) {
    res.render(config.get('theme') + '/catalogs/course.map.ejs');
});

/**
 * partial for add sub topic modal
 */
router.get('/course/addSubTopic', function(req, res, next) {
    res.render(config.get('theme') + '/catalogs/addSubTopicModal');
});

/**
 * partial for add sub topic modal
 */
router.get('/course/addContentNode', function(req, res, next) {
    res.render(config.get('theme') + '/catalogs/addContentNodeModal');
});

router.get('/course/:courseId/tree', function(req, res, next) {
    res.render(config.get('theme') + '/catalogs/course1', { title: req.params.courseId });
});

/**
 * full page for displaying course detail page
 */
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
