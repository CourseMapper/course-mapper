var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var Course = require(appRoot + '/modules/catalogs/course.controller.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var Tabs = require(appRoot + '/modules/tabs/models/tabs.schema.js');
var TabsActive = require(appRoot + '/modules/tabs/models/tabsActive.schema.js');
var debug = require('debug')('cm:route');
var moment = require('moment');
var router = express.Router();
var theme = config.get('theme');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var _ = require('underscore');

/**
 * get courses based on category slug
 * return: html view
 */
router.get('/courses', function (req, res, next) {
    res.render(theme + '/catalogs/courses', {
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
    res.render(theme + '/catalogs/nodeDetail');
});

router.get('/course/courseDetail', function (req, res, next) {
    res.render(theme + '/catalogs/courseDetail');
});

/**
 * partials related to tab and actionbars
 */
router.get('/course/tab/:tabName', function (req, res, next) {
    res.render(theme + '/course/' + req.params.tabName + '/' + req.params.tabName);
});

router.get('/course/actionBar/:tabName', function (req, res, next) {
    res.render(theme + '/course/' + req.params.tabName + '/' + req.params.tabName + 'actionBar');
});

/**
 * partial for add new course modal form accessed from top menu in course list page
 */
router.get('/course/create', function (req, res, next) {
    res.render(theme + '/catalogs/newCourseModal');
});

/**
 * partial for editCourseModal in course detail page
 */
router.get('/course/edit', function (req, res, next) {
    res.render(theme + '/catalogs/editCourseModal');
});

router.get('/course/config/:courseId', function (req, res, next) {
    var k = async(function () {
        var tabs = await(Tabs.find({})
            .sort({orderNo: 1})
            .exec());

        var tabsActive = await(TabsActive
            .find({
                courseId: req.params.courseId,
                location: 'course'
            })
            .sort({orderNo: 1})
            .exec());

        return {
            tabs: tabs, tabsActive: tabsActive
        };
    });

    k()
        .then(function (ret) {
            res.render(theme + '/catalogs/courseConfigModal', {
                tabs: ret.tabs, tabsActive: ret.tabsActive, _: _
            });
        })
        .catch(function (err) {
            console.log(err);
            res.render(theme + '/catalogs/courseConfigModal', {
                tabs: [], tabsActive: [], errors: err, _: _
            });
        });
});

/**
 * partial for modals in course related to map actions
 */
router.get('/course/addSubTopic', function (req, res, next) {
    res.render(theme + '/course/map/addSubTopicModal');
});
router.get('/course/editSubTopic', function (req, res, next) {
    res.render(theme + '/course/map/editSubTopicModal');
});
router.get('/course/addContentNode', function (req, res, next) {
    res.render(theme + '/course/map/addContentNodeModal');
});
router.get('/course/editContentNode', function (req, res, next) {
    res.render(theme + '/course/map/editContentNodeModal');
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
                res.render(theme + '/catalogs/course', {
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
