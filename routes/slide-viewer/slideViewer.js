var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var SlideViewer = require(appRoot + '/modules/slide-viewer');

var router = express.Router();


router.get('/slide-viewer', function(req, res, next) {
    res.render('slide-viewer/slideViewer');
});



module.exports = router;
