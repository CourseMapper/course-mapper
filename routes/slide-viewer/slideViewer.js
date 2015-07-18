var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var SlideViewer = require(appRoot + '/modules/slide-viewer');
var SlideAnnotationZones = require(appRoot + '/modules/annotationZones');
//var Comment = require(appRoot + '/modules/slide-viewer/index');
//var AnnZones = require(appRoot + '/modules/annotationZones/index');

var Comment = require(appRoot + '/modules/slide-viewer');


var router = express.Router();


/*router.get('/', function(req, res, next) {
  var comment = new Comment();
  comment.getAllComments(function(err, data) {

    //res.json(data);
      res.render('slide-viewer/slideViewer', {
        numComments: data.length,
        comments: data
      }

    );

  });
});*/

router.post('/', function(req, res, next){
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

//Workaround for slideViewer. To be deleted if no longer neccessary (TODO)
router.get('/', function(req, res, next) {
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




router.post('/submitComment/', function(req, res, next){
    var comment = new Comment();
    comment.handleSubmitPost(req, res, next);
});

router.get('/disComm/', function(req, res, next){
  var comment = new Comment();
  comment.getAllComments(function(err, data) {

    //res.json(data);
      res.render('slide-viewer/displayComments', {
        numComments: data.length,
        comments: data
      }

    );

  });
});

router.get('/disComm/:order/:filters/', function(req, res, next){
  var comment = new Comment();

  var order = JSON.parse(req.params.order);
  var filter = JSON.parse(req.params.filters);


  comment.getOrderedFilteredComments(order,filter,function(err, data) {

    //res.json(data);
      res.render('slide-viewer/displayComments', {
        numComments: data.length,
        comments: data
      }

    );

  });
});

router.post('/submitTag/', function(req, res, next){
    var annZone = new AnnZones();
    annZone.handleZoneSubmitPost(req, res, next);
});






module.exports = router;
