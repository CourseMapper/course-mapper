var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var AppsGallery = require(appRoot + '/modules/apps-gallery');
var router = express.Router();

//Workaround: TODO delete
var AnnZones = require(appRoot + '/modules/annotationZones/');


router.get('/apps/gallery/:location', function(req, res, next) {
    res.render(config.get('theme') + '/apps/gallery', {location: req.params.location});
});


//Workaround for slideViewer. To be deleted if no longer neccessary (TODO)
router.get('/slide-viewer', function(req, res, next) {
  var comment = new Comment();
  comment.getAllComments(function(err, data) {

    //res.json(data);
      res.render('slide-viewer/slideViewer', {
        numComments: data.length,
        comments: data,
        currentUser: req.user
      }

    );

  });


});

var Comment = require(appRoot + '/modules/slide-viewer');



router.post('/slide-viewer/submitComment', function(req, res, next){
    var comment = new Comment();
    comment.handleSubmitPost(req, res, next);
});

router.get('/slide-viewer/disComm', function(req, res, next){
  var comment = new Comment();
  comment.getAllComments(function(err, data) {
    var modifiedData = new Array(data.length);
    for(var i=0; i<data.length; i++){
      modifiedData[i] = {
        author: data[i].author,
        date: data[i].dateOfCreation.toTimeString(),
        slide: data[i].originSlide,
        html: data[i].renderedText
      };
    }
    res.status(200).json({result:true, comments: modifiedData});
    /*res.render('slide-viewer/displayComments', {
      numComments: data.length,
      comments: modifiedData
    });*/
  });
});

router.get('/slide-viewer/disComm/:order/:filters', function(req, res, next){
  var comment = new Comment();

  var order = JSON.parse(req.params.order);
  var filter = JSON.parse(req.params.filter);


  comment.getAllComments(function(err, data) {

    //res.json(data);
      res.render('slide-viewer/displayComments', {
        numComments: data.length,
        comments: data
      }

    );

  });
});

router.post('/slide-viewer/submitTag', function(req, res, next){
    var annZone = new AnnZones();
    annZone.handleZoneSubmitPost(req, res, next);
});






module.exports = router;
