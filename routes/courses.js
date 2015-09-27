var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var Course = require(appRoot + '/modules/catalogs/course.controller.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var debug = require('debug')('cm:route');
var moment = require('moment');
var router = express.Router();

/**
 * get courses based on category slug
 * return: html view
 */
router.get('/courses', function (req, res, next) {
    res.render(config.get('theme') + '/catalogs/courses', {
        req: req,
        title: 'Browse for Courses',
        user: req.user,
        showSidebar: true
    });
});

/**
 * partial for nodeDetail, (accessed by course detail page)
 */
router.get('/course/nodeDetail', function (req, res, next) {
    res.render(config.get('theme') + '/catalogs/nodeDetail');
});

router.get('/course/courseDetail', function (req, res, next) {
    res.render(config.get('theme') + '/catalogs/courseDetail');
});

/**
 * partial for add new course modal form accessed from top menu in course list page
 */
router.get('/course/create', function (req, res, next) {
    res.render(config.get('theme') + '/catalogs/newCourseModal');
});

/**
 * partial for editCourseModal in course detail page
 */
router.get('/course/edit', function (req, res, next) {
    res.render(config.get('theme') + '/catalogs/editCourseModal');
});

/**
 * partial for add sub topic modal
 */
router.get('/course/addSubTopic', function (req, res, next) {
    res.render(config.get('theme') + '/catalogs/addSubTopicModal');
});

router.get('/course/editSubTopic', function (req, res, next) {
    res.render(config.get('theme') + '/catalogs/editSubTopicModal');
});

/**
 * partial for add content node modal
 */
router.get('/course/addContentNode', function (req, res, next) {
    res.render(config.get('theme') + '/catalogs/addContentNodeModal');
});

/**
 * partial for edit content node modal
 */
router.get('/course/editContentNode', function (req, res, next) {
    res.render(config.get('theme') + '/catalogs/editSubTopicModal');
});

router.get('/course/:courseId/tree', function (req, res, next) {
    res.render(config.get('theme') + '/catalogs/course1', {title: req.params.courseId});
});

/**
 * full page for displaying course detail page
 */
router.get('/course/:slug', function (req, res, next) {
    if (!helper.checkRequiredParams(req.params, ['slug'], function (err) {
                helper.resReturn(err, res);
            }
        )) return;

    var params = {
        slug: req.params.slug
    };

    var c = new Course();
    c.getCourse(
        function (err) {
            helper.resReturn(err, res);
        },

        params,

        function (crs) {
            if (!crs)
                res.send(404);
            else
                res.render(config.get('theme') + '/catalogs/course', {
                    title: crs.name,
                    course: crs,
                    user: req.user,
                    moment: moment,
                    isInNodeDetailPage: true
                });
        }
    );

});

module.exports = router;
