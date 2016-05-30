/*jslint node: true */
'use strict';

var express = require('express');
var config = require('config');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    var user = {};
    if (req.session &&
        req.session.passport &&
        req.session.passport.user) {
        user = req.session.passport.user;
    }

    res.render(config.get('theme') + '/index', {
        user: user
    });
});

/* GET static page., there is ngview inside that 
 will be handled by static.js route file */
router.get('/static', function (req, res) {
    res.render(config.get('theme') + '/static');
});

router.get('/recommend-category', function (req, res) {
    res.render(config.get('theme') + '/recommendCategory');
});

module.exports = router;
