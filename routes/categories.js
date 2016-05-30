var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var debug = require('debug')('cm:route');
var router = express.Router();

/**
 * get courses based on category slug
 * return: html view
router.get('/category/:category/courses', function(req, res, next) {
    res.render(config.get('theme') + '/catalogs/courses', {
        req:req,
        title: 'Browse for Courses',
        user: req.user,
        showSidebar:true
    });
}); */

module.exports = router;
