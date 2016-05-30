var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var TabCtrl = require(appRoot + '/modules/tabs/tabs.controller.js');

var router = express.Router();

router.get('/tabs', function (req, res, next) {
    var app = new TabCtrl();
    app.populateTabs(
        function (err) {
            console.log("error populating app");
        },
        function () {
            console.log("success populating app");
        });

    res.render(config.get('theme') + '/cm-admin/tabs', {title: "Manage Tabs"});
});

module.exports = router;