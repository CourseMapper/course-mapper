var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var Catalog = require(appRoot + '/modules/catalogs');
var Account = require(appRoot + '/modules/accounts');
var debug = require('debug')('cm:route');
var moment = require('moment');

var router = express.Router();

function listCategories(req, res, next){
    res.render(config.get('theme') + '/catalogs/courses', { req:req, title: 'Browse for Courses', showSidebar:true });
}

router.get('/catalogs', listCategories);
router.get('/catalogs/courses', listCategories);

router.post('/api/catalogs/courses', function(req, res, next){
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

router.get('/api/catalogs/courses', function(req, res, next) {
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

router.get('/api/catalogs/course/:courseId', function(req, res, next) {
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

router.get('/api/catalogs/course/:courseId/follow', function(req, res, next) {
    if(!req.params.courseId)
        res.status(500).send('parameter not complete');

    if (!req.user)
        res.status(401).send('Unauthorized');

    else {
        var courseId = req.params.courseId;
        var account = new Account();
        account.follow(
            function failed(err){
                res.status(500).send({errors:err});
            },
            {id: req.user._id}, {id: courseId},
            function (followed) {
                res.status(200).json({result:true, follow: followed});
            });
    }
});

router.get('/catalogs/course/create', function(req, res, next) {
    res.render(config.get('theme') + '/catalogs/newCourse');
});

router.get('/catalogs/course/:courseId', function(req, res, next) {
    var params = {
        courseId: req.params.courseId
    };

    if(req.user) params.userId = req.user._id;

    var account = new Account();
    account.getUserCourses(
        function failed(err){
            res.status(500).send({errors:err});
        },
        params,
        function (course, follow){
            res.render(config.get('theme') + '/catalogs/course', { title: course.course, course:course, user: req.user, follow: follow, moment:moment });
        }
    );
});

router.get('/catalogs/course/:courseId/tree', function(req, res, next) {
    res.render(config.get('theme') + '/catalogs/course1', { title: req.params.courseId });
});

router.get('/catalogs/web-tech', function(req, res, next) {
    res.render(config.get('theme') + '/catalogs/course', { title: req.params.courseSlug });
});

router.get('/catalogs/web-tech2', function(req, res, next) {
    res.render(config.get('theme') + '/catalogs/course2', { title: req.params.courseSlug });
});

router.get('/catalogs/:courseSlug', function(req, res, next) {
    res.render(config.get('theme') + '/catalogs/course', { title: req.params.courseSlug });
});

module.exports = router;