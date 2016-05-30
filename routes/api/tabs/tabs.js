var express = require('express');
var router = express.Router();
var appRoot = require('app-root-path');
var _ = require('underscore');
var TabCtrl = require(appRoot + '/modules/tabs/tabs.controller.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var mongoose = require('mongoose');

/**
 * get all active apps > tabs
 */
router.get('/', function (req, res, next) {
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    var app = new TabCtrl();
    app.getTabs(
        function (err) {
            res.status(500).json({});
        },
        // get active apps only
        {isActive: true}
        ,
        function (tabs) {
            res.status(200).json({tabs: tabs});
        }
    );
});

/**
 * get all apps. both active and inactive
 */
router.get('/all', function (req, res, next) {
    // check for user rights, only admin can request all widgts
    if (req.user && req.user.role != 'admin') {
        res.status(401).send('Unauthorized');
        return;
    }

    // get the widgts
    var app = new TabCtrl();
    app.getTabs(
        function (err) {
            res.status(200).json({result: false, message: err});
        },
        {}
        ,
        function (tabs) {
            res.status(200).json({result: true, tabs: tabs});
        }
    );
});

/**
 * get apps>widgets that are active and on particular location
 */
router.get('/:location/:id', function (req, res, next) {
    var app = new TabCtrl();

    var params = {
        location: req.params.location,
        isInstalled: true
    };

    params.id = req.params.id;

    app.getInstalledWidgets(
        function (err) {
            res.status(500).json(err);
        },
        // installed widgets in a specified location
        params
        ,
        function (wgs) {
            res.status(200).json({result: true, tabs: tabs});
        }
    );
});

/**
 * get apps>widgets that are active and on current location
 */
router.get('/:location', function (req, res, next) {
    var app = new AppsGallery();
    app.getWidgets(
        function (err) {
            res.status(500).json(err);
        },
        // get active widgets and correct location
        {
            location: req.params.location,
            isActive: true
        }
        ,
        function (tabs) {
            res.status(200).json({result: true, tabs: tabs});
        }
    );
});

router.put('/install', function (req, res, next) {
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    req.body.userId = req.user._id;
    req.body.isInstalled = true;

    if (req.body.userId)
        req.body.userId = mongoose.Types.ObjectId(req.body.userId);

    if (req.body.courseId)
        req.body.courseId = mongoose.Types.ObjectId(req.body.courseId);

    if (req.body.categoryId)
        req.body.categoryId = mongoose.Types.ObjectId(req.body.categoryId);

    var app = new AppsGallery();

    app.installWidget(
        function (err) {
            helper.resReturn(err, res);
        },

        // get active widgets and correct location
        req.body
        ,

        function (wgs) {
            res.status(200).json({result: true, installed: wgs});
        });
});

router.put('/uninstall/:installId', function (req, res, next) {
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    req.body.userId = mongoose.Types.ObjectId(req.user._id);
    req.body._id = mongoose.Types.ObjectId(req.params.installId);

    var app = new AppsGallery();

    app.uninstallWidget(function (err) {
            helper.resReturn(err, res);
        },
        // get active widgets and correct location
        req.body
        ,
        function (wgs) {
            res.status(200).json({result: true, uninstalled: wgs});
        });
});

/**
 * use this to update widgets, active or deactivate
 */
router.put('/:name', function (req, res, next) {
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    var app = new TabCtrl();
    app.updateTab(
        function (err) {
            res.status(500).json({});
        },
        req.params,
        req.body,
        function (tab) {
            res.status(200).json({result: true, tab: tab});
        }
    );
});

module.exports = router;
