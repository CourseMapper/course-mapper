var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var SlideViewer = require(appRoot + '/modules/slide-viewer');


var router = express.Router();


router.get('/', function(req, res, next) {
    res.render('slide-viewer/slideViewer');
});

router.post('/slide-viewer', function(req, res, next){
    var comment = new Comment();
    comment.handleSubmitPost(req, res, next);
});

module.exports = router;
