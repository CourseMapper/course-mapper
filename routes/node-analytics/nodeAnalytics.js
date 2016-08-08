/**
 * node-analytics app route
 *
 */

var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');

var router = express.Router();

/**
 * entry point route for node-analytics
 */

router.get('/na-node-history-analytics', function (req, res, next){
    res.render('node-analytics/node-history-analytics');
});

module.exports = router;
