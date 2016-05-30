var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var CourseController = require(appRoot + '/modules/catalogs/course.controller.js');
var NodeController = require(appRoot + '/modules/trees/index.js');
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
 * partials related to tab and actionbars
 */
router.get('/treeNode/tab/:tabName', function (req, res, next) {
    res.render(theme + '/treeNode/' + req.params.tabName + '/' + req.params.tabName);
});

router.get('/treeNode/actionBar/:tabName', function (req, res, next) {
    res.render(theme + '/treeNode/' + req.params.tabName + '/' + req.params.tabName + 'ActionBar');
});

/**
 * partial for nodeDetail, (accessed by course detail page)
 */
router.get('/treeNode/:cid/nodeDetail/:nid', function (req, res, next) {
    var TC = new TabsController();
    var nod = new NodeController();
    var nid = mongoose.Types.ObjectId(req.params.nid);

    var op = async(function () {
        var ta = await(TC.getActiveTabs('contentNode')());
        var nd = await(nod.getNodeAsync()({_id: nid}));

        // to avoid returning json 404, instead, we create a mockup object that says it s already deleted
        if (!nd) {
            nd = {
                tabsActive: null,
                isDeleted: true,
                courseId: {name: ""}
            }
        }

        return {tabs: ta, tabsActive: nd.tabsActive, course: nd.courseId, treeNode: nd};
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
                var tap = ret.tabs[i];
                var isActive = tap.isActive;
                if (!isActive) {
                    continue;
                }

                if (typeof(ret.tabsActive[tap.name]) != "undefined") {
                    if (!ret.tabsActive[tap.name]) {
                        continue;
                    }
                }

                activeTabs.push(tap);
            }

            var le = _.extend(ret, {activeTabs: activeTabs, isInIframe: isInIframe});
            res.render(theme + '/catalogs/nodeDetail', le);
        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });
});

/**
 * full page for displaying course detail page
 */
router.get('/treeNode/:nid', function (req, res, next) {

    var TC = new TabsController();
    var nod = new NodeController();
    var nid = mongoose.Types.ObjectId(req.params.nid);

    var op = async(function () {
        var ta = await(TC.getActiveTabs('contentNode')());
        var nd = await(nod.getNodeAsync()({_id: nid}));

        // to avoid returning json 404, instead, we create a mockup object that says it s already deleted
        if (!nd) {
            nd = {
                tabsActive: null,
                isDeleted: true,
                courseId: {name: ""}
            }
        }

        return {tabs: ta, tabsActive: nd.tabsActive, course: nd.courseId};
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
                var tap = ret.tabs[i];
                var isActive = tap.isActive;
                if (!isActive) {
                    continue;
                }

                if (typeof(ret.tabsActive[tap.name]) != "undefined") {
                    if (!ret.tabsActive[tap.name]) {
                        continue;
                    }
                }

                activeTabs.push(tap);
            }

            res.render(theme + '/catalogs/course', {
                title: ret.course.name,
                course: ret.course,
                user: req.user,
                moment: moment,
                isInNodeDetailPage: true,
                activeTabs: activeTabs,
                isInIframe: isInIframe
            });
        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });

});

module.exports = router;
