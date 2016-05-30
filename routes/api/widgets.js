var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var _ = require('underscore');
var AppsGallery = require(appRoot + '/modules/apps-gallery');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var router = express.Router();
var mongoose = require('mongoose');

/**
 * get all active apps > widgets
 */
router.get('/widgets/', function (req, res, next) {
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    var app = new AppsGallery();
    app.getWidgets(
        function (err) {
            res.status(500).json({});
        },
        // get active apps only
        {isActive: true}
        ,
        function (widgets) {
            res.status(200).json({widgets: widgets});
        }
    );
});

router.put('/widgets/install', helper.ensureAuthenticated,
    function (req, res, next) {
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

        if (req.body.nodeId)
            req.body.nodeId = mongoose.Types.ObjectId(req.body.nodeId);

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

router.put('/widgets/uninstall/:installId', helper.ensureAuthenticated,
    function (req, res, next) {
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

router.put('/widget/:installId/edit', helper.ensureAuthenticated,
    function (req, res, next) {
        var app = new AppsGallery();

        app.editInstall(
            {
                _id: req.params.installId,
                userId: req.user._id,
                courseId: req.body.courseId
            },
            // get active widgets and correct location
            req.body
        ).
            then(function (wgs) {
                res.status(200).json({result: true, widget: wgs});
            })
            .catch(function (err) {
                helper.resReturn(err, res);
            });
    });

router.put('/widget/:id/setPosition', helper.ensureAuthenticated,
    function (req, res, next) {
        if (!req.user) {
            res.status(401).send('Unauthorized');
            return;
        }

        var params = {
            userId: mongoose.Types.ObjectId(req.user._id),
            widgetId: mongoose.Types.ObjectId(req.params.id)
        };

        if (req.body.courseId) {
            params.courseId = mongoose.Types.ObjectId(req.body.courseId)
        }

        var app = new AppsGallery();
        app.setPosition(
            function (err) {
                res.status(500).json(err);
            },

            // get and verify if this widget belongs to this user.
            params
            ,

            req.body.x,
            req.body.y,

            function (wgs) {
                res.status(200).json({result: true, widget: wgs});
            }
        );
    });

/**
 * use this to update widgets, active or deactivate
 */
router.put('/widgets/:application/:name', helper.ensureAuthenticated,
    function (req, res, next) {
        if (!req.user) {
            res.status(401).send('Unauthorized');
            return;
        }

        var app = new AppsGallery();
        app.updateWidget(
            function (err) {
                res.status(500).json({});
            },
            req.params,
            req.body,
            function (widget) {
                res.status(200).json({result: true, widget: widget});
            }
        );
    });

/**
 * get all apps. both active and inactive
 */
router.get('/widgets/all', function (req, res, next) {
    // check for user rights, only admin can request all widgts
    if (req.user && req.user.role != 'admin') {
        res.status(401).send('Unauthorized');
        return;
    }

    // get the widgts
    var app = new AppsGallery();
    app.getWidgets(
        function (err) {
            res.status(200).json({result: false, message: err});
        },
        {}
        ,
        function (wgs) {
            res.status(200).json({result: true, widgets: wgs});
        }
    );
});

/**
 * get apps>widgets that are active and on particular location
 */
router.get('/widgets/:location/:id', function (req, res, next) {
    var app = new AppsGallery();

    var params = {
        location: req.params.location,
        isInstalled: true
    };

    if (params.location == 'user-profile') {
        params.userId = req.params.id;
    } else if (params.location == 'course-preview' || params.location == 'course-analytics') {
        params.courseId = req.params.id;
    } else if (params.location == 'node-analytics') {
        params.nodeId = req.params.id;
    } else {
        params.id = req.params.id;
    }

    app.getInstalledWidgets(
        function (err) {
            res.status(500).json(err);
        },
        // installed widgets in a specified location
        params
        ,
        function (wgs) {
            res.status(200).json({result: true, widgets: wgs});
        }
    );
});

/**
 * get apps>widgets that are active and on particular location
 */
router.get('/server-widgets/:location', function (req, res, next) {
    var app = new AppsGallery();

    var params = {
        location: req.params.location,
        isActive: true
    };

    app.getServerWidgets(
        function (err) {
            res.status(500).json(err);
        },
        // installed widgets in a specified location
        params
        ,
        req.query
        ,
        function (wgs) {
            res.status(200).json({result: true, widgets: wgs});
        }
    );
});

/**
 * for store display
 * get apps>widgets that are active and on current location
 */
router.get('/widgets/:location', function (req, res, next) {
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
        function (wgs) {
            res.status(200).json({result: true, widgets: wgs});
        }
    );
});

module.exports = router;
