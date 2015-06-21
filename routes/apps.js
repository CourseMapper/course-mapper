var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var AppsGallery = require(appRoot + '/modules/apps-gallery');
var router = express.Router();

router.get('/apps/gallery/:location', function(req, res, next) {
    res.render(config.get('theme') + '/apps/gallery', {location: req.params.location});
});


//Workaround for slideViewer. To be deleted if no longer neccessary (TODO)
router.get('/slide-viewer', function(req, res, next) {
    res.render('slide-viewer/slideViewer');
});

var Comment = require(appRoot + '/modules/slide-viewer');

router.get('/slide-viewer/displayComments', function(req, res, next) {
    var comment = new Comment();
    comment.numberOfComments(function(err, data) {

      //res.json(data);
      res.render('slide-viewer/slideViewer', {
          numComments: data
        }

      );

    });
});

router.post('/slide-viewer', function(req, res, next){
    var comment = new Comment();
    comment.handleSubmitPost(req, res, next);
});




module.exports = router;
