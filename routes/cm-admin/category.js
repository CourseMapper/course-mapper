var express = require('express');
var config  = require('config');
var appRoot = require('app-root-path');

var router = express.Router();

router.get('/categories', function(req, res, next) {
    res.render(config.get('theme') + '/cm-admin/categories', {title: "Manage Categories"});
});

router.get('/category', function(req, res, next) {
    res.render(config.get('theme') + '/cm-admin/category', {title: "Manage Categories"});
});

router.get('/category-recommendations', function(req, res, next) {
    res.render(config.get('theme') + '/cm-admin/categoryRecommendations', {title: "Manage Categories"});
});

module.exports = router;
