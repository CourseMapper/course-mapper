var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var AppsGallery = require(appRoot + '/modules/apps-gallery');
var router = express.Router();

/**
 * get all active apps > widgets
 */
router.get('/apps/', function(req, res, next) {
    var app = new AppsGallery();
    app.getWidgets(
        function(err){
            res.status(500).json({});
        },
        // get active apps only
        true,
        {}
        ,
        function(widgets){
            res.status(200).json({widgets: widgets});
        }
    );
});

/**
 * get all apps. both active and inactive
 */
router.get('/apps/all', function(req, res, next){
    var app = new AppsGallery();
    app.getAppsAll(
        function(err){
            res.status(500).json({result:false, message:err});
        }
        ,
        function(wgs){
            res.status(200).json({result: true, apps: wgs});
        }
    );
});

/**
 * get apps>widgets that are active and on current location
 */
router.get('/apps/:location', function(req, res, next){
    var app = new AppsGallery();
    app.getWidgets(
        function(err){
            res.status(500).json({});
        },
        // get active apps only
        true,
        // get active widgets and correct location
        {
            location: req.params.location,
            isActive: true
        }
        ,
        function(wgs){
            res.status(200).json({widgets: wgs});
        }
    );
});




module.exports = router;