var express = require('express');
var passport = require('passport');
var config = require('config');

var appRoot = require('app-root-path');
var Account = require(appRoot + '/modules/accounts');
var router = express.Router();

router.get('/html-sidebar', function (req, res, next) {
    res.render('ui-widgets/html-sidebar/html-sidebar');
});

module.exports = router;
