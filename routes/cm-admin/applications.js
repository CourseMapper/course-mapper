var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var AppsGallery = require(appRoot + '/modules/apps-gallery');

var router = express.Router();

router.get('/applications', function (req, res, next) {
    var app = new AppsGallery();
    app.populateApplications(
        function (err) {
            console.log("error populating app");
        },
        function () {
            console.log("success populating app");
        });

    res.render(config.get('theme') + '/cm-admin/applications', {title: "Manage Applications"});
});

router.get('/background-plugins', function (req, res, next) {
    var app = new AppsGallery();
    app.populateBackgroundPlugins(
        function (err) {
            console.log("error populating background-plugins");
        },
        function () {
            console.log("success populating background-plugins");
        });

    res.render(config.get('theme') + '/cm-admin/background-plugins', {title: "Manage Background Plugins"});
});

module.exports = router;