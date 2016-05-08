var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var CourseController = require(appRoot + '/modules/catalogs/course.controller.js');
var Courses = require(appRoot + '/modules/catalogs/courses.js');
var TabsController = require(appRoot + '/modules/tabs/tabs.controller.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var debug = require('debug')('cm:route');
var moment = require('moment');
var mongoose = require('mongoose');
var router = express.Router();
var theme = config.get('theme');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var _ = require('underscore');

// set a cookie
router.use(function (req, res, next) {
    var isInIframe = false;
    var setCookie = false;
    if (req.query.iframe === 'true') {
        isInIframe = true;
        setCookie = true;
    }
    else if (req.query.iframe === 'false') {
        isInIframe = false;
        setCookie = true;
    }

    // check if client sent cookie
    var cookie = req.cookies.isInIframe;

    // set if not set
    if (setCookie || cookie === undefined) {
        res.cookie('isInIframe', isInIframe, {maxAge: 900000, httpOnly: true});
    }

    next();
});

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

router.get('/course/courseDetail/:courseId', function (req, res, next) {
    var TC = new TabsController();
    var crs = new CourseController();
    var cid = mongoose.Types.ObjectId(req.params.courseId);

    var op = async(function () {
        var tabs = await(TC.getActiveTabs('course')());
        var cr = await(crs.getCourseAsync({_id: cid})());

        return {tabs: tabs, course: cr, tabsActive: cr.tabsActive};
    });

    var isInIframe = (req.cookies.isInIframe === 'true');
    if (!isInIframe)
        if (req.query.iframe === 'true') {
            isInIframe = true;
        } else if (req.query.iframe === 'false') {
            isInIframe = false;
        }

    op()
        .then(function (ret) {
            var activeTabs = [];

            if (!ret.tabsActive)
                ret.tabsActive = {};

            for (var i = 0; i < ret.tabs.length; i++) {
                var isActive = ret.tabs[i].isActive;
                if (!isActive) {
                    continue;
                }

                if (typeof(ret.tabsActive[ret.tabs[i].name]) != "undefined") {
                    if (!ret.tabsActive[ret.tabs[i].name]) {
                        continue;
                    }
                }

                activeTabs.push(ret.tabs[i]);
            }

            res.render(theme + '/catalogs/courseDetail', {
                tabs: ret.tabs, tabsActive: ret.tabsActive, _: _,
                course: ret.course, activeTabs: activeTabs,
                isInIframe: isInIframe
            });
        })
        .catch(function (err) {
            helper.resReturn(err, res)
        });
});

/**
 * partials related to tab and actionbars
 */
router.get('/course/tab/:tabName', function (req, res, next) {
    res.render(theme + '/course/' + req.params.tabName + '/' + req.params.tabName);
});

router.get('/course/actionBar/:tabName', function (req, res, next) {
    res.render(theme + '/course/' + req.params.tabName + '/' + req.params.tabName + 'ActionBar');
});

/**
 * partials related to tab and actionbars for peer Assesment
 */
router.get('/course/tab/:tabName/:fileName', function (req, res, next) {
    res.render(theme + '/course/' + req.params.tabName + '/' + req.params.fileName);
});

router.get('/course/actionBar/:tabName', function (req, res, next) {
    res.render(theme + '/course/' + req.params.tabName + '/' + req.params.fileName + 'ActionBar');
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
    if (!helper.checkRequiredParams(req.params, ['slug'],
            function (err) {
                helper.resReturn(err, res);
            }
        )) return;

    var params = {
        slug: req.params.slug
    };

    var isInIframe = (req.cookies.isInIframe === 'true');
    if (!isInIframe)
        if (req.query.iframe === 'true') {
            isInIframe = true;
        } else if (req.query.iframe === 'false') {
            isInIframe = false;
        }

    var c = new CourseController();
    c.getCourse(
        function (err) {
            helper.resReturn(err, res);
        },

        params,

        function (cours) {
            if (!cours)
                res.send(404);
            else if (cours.isDeleted === true)
                res.send(404);
            else {
                var TC = new TabsController();

                var op = async(function () {
                    var tabs = await(TC.getActiveTabs('course')());
                    return {tabs: tabs, tabsActive: cours.tabsActive};
                });

                op()
                    .then(function (ret) {
                        var activeTabs = [];
                        if (!ret.tabsActive)
                            ret.tabsActive = {};

                        for (var i = 0; i < ret.tabs.length; i++) {
                            var isActive = ret.tabs[i].isActive;
                            if (!isActive) {
                                continue;
                            }

                            if (typeof(ret.tabsActive[ret.tabs[i].name]) != "undefined") {
                                if (!ret.tabsActive[ret.tabs[i].name]) {
                                    continue;
                                }
                            }

                            activeTabs.push(ret.tabs[i]);
                        }

                        res.render(theme + '/catalogs/course', {
                            title: cours.name,
                            course: cours,
                            user: req.user,
                            moment: moment,
                            isInNodeDetailPage: false,
                            activeTabs: activeTabs,
                            isInIframe: isInIframe
                        });
                    })
                    .catch(function (err) {
                        helper.resReturn(err, res)
                    });
            }
        }
    );

});

module.exports = router;
