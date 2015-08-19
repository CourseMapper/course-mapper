var express = require('express');
var config = require('config');
var debug = require('debug')('cm:route');
var router = express.Router();

/**
 * return all posts
 */
router.get('/topics', function(req, res, next) {
    res.render('discussion/topics');
});

module.exports = router;