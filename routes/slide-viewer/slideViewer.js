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

/*router.get('/slide-viewer/displayComments', function(req, res, next) {
    res.render('index', {
      title: 'Test',
      pagetitle: 'Hello',
      comments: comment

    });
});*/


module.exports = router;
