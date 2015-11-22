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
    var crs = new CourseController();
    var nod = new NodeController();
    var cid = mongoose.Types.ObjectId(req.params.cid);
    var nid = mongoose.Types.ObjectId(req.params.nid);

    var op = async(function () {
        var ta = await(TC.getActiveTabs(cid, 'contentNode')());
        var cr = await(crs.getCourseAsync({_id: cid})());
        var nd = await(nod.getNodeAsync({_id: nid})());

        return {tabs: ta, tabsActive: nd.tabsActive, course: cr, treeNode: nd};
    });

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

            var le = _.extend(ret, {activeTabs: activeTabs});
            res.render(theme + '/catalogs/nodeDetail', le);
        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });
});

module.exports = router;
