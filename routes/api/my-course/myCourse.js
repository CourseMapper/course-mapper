/**
 * /api/my-course/*
 */
var express = require('express');
var passport = require('passport');
var config = require('config');
var mongoose = require('mongoose');
var Promise = require('bluebird');

var appRoot = require('app-root-path');
var Course = require(appRoot + '/modules/applications/my-course/myCoursesList');
var PdfStatus = require(appRoot + '/modules/applications/my-course/myPDFStatus');
var VideoStatus = require(appRoot + '/modules/applications/my-course/myVideoStatus.controller.js');
var TraceFinder = require(appRoot + '/modules/applications/my-course/trace-finder.js');
var router = express.Router();

router.get('/', function (req, res, next) {
  if (!req.user) {
    return res.status(401).send('Unauthorized');
  }
  var myCrs = new Course();
  myCrs.getEnrolledCourses(
    function error(err) {
      res.status(200).json({result: false, message: err});
    },
    {
      user: mongoose.Types.ObjectId(req.user._id)
    },
    function success(courses) {
      res.status(200).json({result: true, courses: courses});
    }
  );
});

router.get('/pdf-history', function (req, res, next) {
  if (!req.user) {
    return res.status(401).send('Unauthorized');
  }

  var pHis = new PdfStatus();
  pHis.getPdfStatus(
    function error(err) {
      res.status(500).json({result: false, message: err});
    },
    {
      userId: mongoose.Types.ObjectId(req.user._id)
    },
    function success(pdfHistory) {
      res.status(200).json({result: true, pdfHistory: pdfHistory});
    }
  )

});

router.get('/video-history', function (req, res, next) {
  if (!req.user) {
    return res.status(401).send('Unauthorized');
  }

  var vHis = new VideoStatus();
  vHis.getVideoStatus(
    function error(err) {
      res.status(500).json({result: false, message: err});
    },
    {
      userId: mongoose.Types.ObjectId(req.user._id)
    },
    function success(videoHistory) {
      res.status(200).json({result: true, videoHistory: videoHistory});
    }
  )

});

router.get('/enrolled-resources', function (req, res, next) {
  if (!req.user) {
    return res.status(401).send('Unauthorized');
  }
  var myCrs = new Course();
  myCrs.getEnrolledResources(
    function error(err) {
      res.status(200).json({result: false, message: err});
    },
    {
      user: mongoose.Types.ObjectId(req.user._id)
    },
    function success(resources) {
      res.status(200).json({result: true, resources: resources});
    }
  );
});

router.get('/created-resources', function (req, res, next) {
  if (!req.user) {
    return res.status(401).send('Unauthorized');
  }
  var myCrs = new Course();
  myCrs.getCreatedResources(
    function error(err) {
      res.status(200).json({result: false, message: err});
    },
    {
      user: mongoose.Types.ObjectId(req.user._id)
    },
    function success(resources) {
      res.status(200).json({result: true, resources: resources});
    }
  );
});

router.get('/resources', function (req, res, next) {
  if (!req.user) {
    return res.status(401).send('Unauthorized');
  }
  var myCrs = new Course();
  myCrs.getAllResources(
    function error(err) {
      res.status(200).json({result: false, message: err});
    },
    {
      user: mongoose.Types.ObjectId(req.user._id)
    },
    function success(resources) {
      res.status(200).json({result: true, resources: resources});
    }
  );
});

router.get('/newsfeed', function (req, res, next) {
  if (!req.user) {
    return res.status(401).send('Unauthorized');
  }
  var myCrs = new Course();
  myCrs.getUserNewsfeed(
    function error(err) {
      res.status(200).json({result: false, message: err});
    },
    {
      user: mongoose.Types.ObjectId(req.user._id)
    },
    function success(newsfeed) {
      res.status(200).json({result: true, newsfeed: newsfeed});
    }
  );
});

router.get('/my-node-activity-status', function (req, res, next) {
  if (!req.user) {
    return res.status(401).send('Unauthorized');
  }
  var myCrs = new Course();
  myCrs.getUserMyNodeActivityStatus(
    function error(err) {
      res.status(200).json({result: false, message: err});
    },
    {
      user: mongoose.Types.ObjectId(req.user._id)
    },
    function success(myNodeActivityStatus) {
      res.status(200).json({result: true, myNodeActivityStatus: myNodeActivityStatus});
    }
  );
})

router.get('/my-discussion-status', function (req, res, next) {
  if (!req.user) {
    return res.status(401).send('Unauthorized');
  }
  var myCrs = new Course();
  myCrs.getUserMyDiscussionStatus(
    function error(err) {
      res.status(200).json({result: false, message: err});
    },
    {
      user: mongoose.Types.ObjectId(req.user._id)
    },
    function success(myDiscussionStatus) {
      res.status(200).json({result: true, myDiscussionStatus: myDiscussionStatus});
    }
  );
});

router.get('/participation-balance', function (req, res, next) {
  if (!req.user) {
    return res.status(401).send('Unauthorized');
  }
  var task = new TraceFinder().findAsync(req.user);
  Promise.props(task)
    .then(function (results) {
      res.json(results);
    })
    .catch(function (err) {
      res.status(500).send(err);
    });
});

module.exports = router;
