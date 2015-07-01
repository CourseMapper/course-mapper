var express = require('express');
var config  = require('config');
var appRoot = require('app-root-path');

var router = express.Router();

router.get('/applications', function(req, res, next) {
    res.render(config.get('theme') + '/cm-admin/applications', {title: "Manage Applications"});
});

router.get('/application', function(req, res, next) {
    res.render(config.get('theme') + '/cm-admin/application', {title: "Manage Application"});
});

module.exports = router;