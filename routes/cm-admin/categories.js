var express = require('express');
var config  = require('config');
var appRoot = require('app-root-path');
var Catalog = require(appRoot + '/modules/catalogs');

var router = express.Router();

router.get('/categories', function(req, res, next) {
    res.render(config.get('theme') + '/cm-admin/category', {title: "Manage Categories"});
});

module.exports = router;