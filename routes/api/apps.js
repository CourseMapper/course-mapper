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
        true,
        {}
        ,
        function(widgets){
            res.status(200).json({widgets: widgets});
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

/**
 * get all apps. both active and inactive
 */
router.get('/apps/all', function(req, res, next){
    var app = new AppsGallery();
    app.getApps(
        function(err){
            res.status(200).json({result:false, message:err});
        },
        // get all
        {
        }
        ,
        function(wgs){
            res.status(200).json({result: (wgs.length >= 0),apps: wgs});
        }
    );
});



module.exports = router;