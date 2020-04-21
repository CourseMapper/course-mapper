var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var SlideViewer = require(appRoot + '/modules/slide-viewer');
var SlideAnnotationZones = require(appRoot + '/modules/annotationZones');
var Comment = require(appRoot + '/modules/slide-viewer/index');
var AnnZones = require(appRoot + '/modules/annotationZones/index');
var mongoose = require('mongoose');

var Comment = require(appRoot + '/modules/slide-viewer');

var Plugin = require(appRoot + '/modules/apps-gallery/backgroundPlugins.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');

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

router.post('/', function (req, res, next) {
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
router.get('/', function (req, res, next) {
  var comment = new Comment();
  comment.getAllComments(function (err, data) {

    //res.json(data);
    res.render('slide-viewer/slideViewer', {
        numComments: data.length,
        comments: data,
        currentUser: req.user
      }
    );

  });


});

/**
 * Retrieve count-map data
 **/
router.get('/countmap/:pdfId', function (req, res, next) {
  var pdfId = req.params.pdfId;
  var comment = new Comment();
  comment.getPdfAnnotations(pdfId, function (err, annotations) {
    if (err) {
      return res.send(500);
    }
    var countMap = [];
    for (var i = 0; i < annotations.length; i++) {
      countMap.push({
        page: annotations[i].pdfPageNumber,
        authorId: annotations[i].authorID
      });
    }
    return res.json(countMap);
  });
});

router.post('/submitComment/', function (req, res, next) {
  var comment = new Comment();
  comment.handleSubmitPost(req, res, next);
});

router.post('/deleteComment/', function (req, res, next) {
  var comment = new Comment();
  comment.handleDeletePost(req, res, next);
});

router.post('/updateComment/', function (req, res, next) {
  var comment = new Comment();
  comment.handleUpdatePost(req, res, next);
});

router.post('/updateAnnZone/', function (req, res, next) {
  var annZone = new AnnZones();
  annZone.handleUpdatePost(req, res, next);
});

/*router.post('/submitTag/', function(req, res, next){
 var annZone = new AnnZones();
 annZone.handleZoneSubmitPost(req, res, next);
 });*/

router.get('/slide-viewer', function (req, res, next) {
  var comment = new Comment();
  comment.getAllComments(function (err, data) {
    //res.json(data);
    res.render('slide-viewer/slideViewer', {
        numComments: data.length,
        comments: data,
        currentUser: req.user
      }
    );
  });
});

/**
 * GET to let the server know that the user is opening which pdf and page
 */
router.get('/read/:courseId/:nodeId/:resourceId/:pageNumber/:totalPage', function (req, res, next) {
  if (!req.user)
    return res.status(401).send('Unauthorized');

  var cid, nid, rid, uid;
  try {
    cid = mongoose.Types.ObjectId(req.params.courseId);
    nid = mongoose.Types.ObjectId(req.params.nodeId);
    rid = mongoose.Types.ObjectId(req.params.resourceId);
    uid = mongoose.Types.ObjectId(req.user._id);
  } catch (err) {
    helper.resReturn("Ids needs to be an object id", res);
    return;
  }

  var params = {
    courseId: cid,
    nodeId: nid,
    resourceId: rid,
    pageNumber: req.params.pageNumber,
    totalPage: req.params.totalPage,
    userId: uid
  };

  Plugin.doAction('onPdfRead', params);

  res.status(200).json({
    result: true
  });
});

router.get('/disComm', function (req, res, next) {
  var comment = new Comment();
  comment.getAllComments(function (err, data) {
    var modifiedData = new Array(data.length);
    for (var i = 0; i < data.length; i++) {
      modifiedData[i] = {
        _id: data[i]._id,
        author: data[i].author,
        date: data[i].dateOfCreation,
        slide: data[i].originSlide,
        html: data[i].renderedText,
        isPrivate: data[i].isPrivate,
        authorId:data[i].authorID,
        authorDisplayName: data[i].authorDisplayName
      };
    }
    res.status(200).json({result: true, comments: modifiedData});
    /*res.render('slide-viewer/displayComments', {
     numComments: data.length,
     comments: modifiedData
     });*/
  });
});

/*router.get('/disComm/:order/:filters', function(req, res, next){
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

router.get('/disComm/:order/:filters/', function (req, res, next) {
  var comment = new Comment();
  comment.getOrderedFilteredComments(req, function (err, data) {
    var modifiedData = new Array(data.length);
    for (var i = 0; i < data.length; i++) {
      modifiedData[i] = {
        _id: data[i]._id,
        id: data[i].id,
        author: data[i].author,
        date: data[i].dateOfCreation,
        slide: data[i].originSlide,
        html: data[i].renderedText,
        hasParent: data[i].hasParent,
        parentId: data[i].parentId,
        isPrivate: data[i].isPrivate,
        authorId:data[i].authorID,
        authorDisplayName: data[i].authorDisplayName
      };
    }
    res.status(200).json({result: true, comments: modifiedData});
  });
});

router.get('/disAnnZones/', function (req, res, next) {
  var annZone = new AnnZones();


  annZone.getAllAnnotationZones(function (err, data) {
    var modifiedData = new Array(data.length);
    for (var i = 0; i < data.length; i++) {
      modifiedData[i] = {
        _id: data[i]._id,
        id: data[i].id,
        name: data[i].annotationZoneName,
        relPosX: data[i].relativeCoordinates.X,
        relPosY: data[i].relativeCoordinates.Y,
        relWidth: data[i].relativeDimensions.X,
        relHeight: data[i].relativeDimensions.Y,
        color: data[i].color
      };
    }
    //console.log(modifiedData);
    res.status(200).json({result: true, annZones: modifiedData});

  });
});

router.get('/disAnnZones/:pdfId/:pdfPageNumber', function (req, res, next) {
  var annZone = new AnnZones();

  var pdfId = mongoose.Types.ObjectId(req.params.pdfId);
  annZone.getSpecificAnnotationZones(pdfId, req.params.pdfPageNumber, function (err, data) {
    var modifiedData = new Array(data.length);
    for (var i = 0; i < data.length; i++) {
      modifiedData[i] = {
        _id: data[i]._id,
        id: data[i].id,
        name: data[i].annotationZoneName,
        author: data[i].author,
        relPosX: data[i].relativeCoordinates.X,
        relPosY: data[i].relativeCoordinates.Y,
        relWidth: data[i].relativeDimensions.X,
        relHeight: data[i].relativeDimensions.Y,
        color: data[i].color
      };
    }
    //console.log(modifiedData);
    res.status(200).json({result: true, annZones: modifiedData});

  });
});


module.exports = router;
