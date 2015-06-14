var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var Catalog = require(appRoot + '/modules/catalogs');
var Account = require(appRoot + '/modules/accounts');
var debug = require('debug')('cm:route');
var moment = require('moment'); 
var router = express.Router();
  

router.post('/courses', function(req, res, next){
    if (!req.user) {
        res.status(401).send('Unauthorized');
    }
    else {
        var catalog = new Catalog();
        req.body.userId = req.user._id;

        catalog.addCourse(
            function (err) {
                res.status(500).json({result:false, errors: [err.message]});
            },

            // parameters
            req.body,

            function (course) {
                res.status(200).json({result:true, course: course});
            }
        );
    }
});

router.get('/courses', function(req, res, next) {
    var cat = new Catalog();
    cat.getCourses(
        function(err){
            res.status(500);
        },
        {
            // parameters
        },
        function(courses){
            res.status(200).json({courses: courses});
        }
    );
});

router.get('/course/:courseId', function(req, res, next) {
    var cat = new Catalog();
    cat.getCourse(
        function(err){
            res.status(500);
        },
        {
            _id: req.params.courseId
        },
        function(course){
            res.status(200).json({course: course});
        }
    );
});

router.get('/course/:courseId/enroll', function(req, res, next) {
    if(!req.params.courseId)
        res.status(500).send('parameter not complete');

    if (!req.user)
        res.status(401).send('Unauthorized');

    else {
        var courseId = req.params.courseId;
        var catalog = new Catalog();
        catalog.enroll(
            function failed(err){
                res.status(500).send({errors:err});
            },
            {id: req.user._id},
            {id: courseId},
            function (followed) {
                res.status(200).json({result:true, follow: followed});
            });
    }
});
 
module.exports = router;