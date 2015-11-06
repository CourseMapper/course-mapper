var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var SlideViewer = require(appRoot + '/modules/slide-viewer');
var SlideAnnotationZones = require(appRoot + '/modules/annotationZones');

var router = express.Router();

/*router.get('api/slide-viewer/disComm', function(req, res, next){
  var comment = new Comment();
  comment.getAllComments(function(err, data) {
    console.log("TESTTEST");
    var modifiedData;
    for(var i=0; i<data.length; i++){
      modifiedData[i] = {
        results: true,
        comments:{
          author: data.author,
          date: data.dateOfCreation,
          slide: data.originSlide,
          html: data.renderedText
        }
      };
    }
    res.render('slide-viewer/displayComments', {
      numComments: data.length,
      comments: modifiedData
    });
  });
});

router.get('api/slide-viewer/disComm/:order/:filters', function(req, res, next){
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
});*/

module.exports = router;
