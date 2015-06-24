var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var Course = require(appRoot + '/modules/catalogs/course.controller.js');
var Account = require(appRoot + '/modules/accounts');
var debug = require('debug')('cm:route');
var moment = require('moment'); 
var router = express.Router();

/**
 * POST
 * create course
 */
router.post('/courses', function(req, res, next){
    if (!req.user) {
        res.status(401).send('Unauthorized');
    }
    else {
        var catalog = new Course();
        req.body.userId = req.user._id;

        // format the tags data structure
        if(req.body.tags) {
            // because the data is in {text:the-tag} format. let's just get the values.
            var tagSlugs = [];
            var tTags = JSON.parse(req.body.tags);
            for (var i in tTags) {
                tagSlugs.push(tTags[i]['text']);
            }
            req.body.tagSlugs = tagSlugs;
        }

        catalog.addCourse(
            function (err) {
                res.status(200).json({result:false, errors: [err.message]});
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
    var cat = new Course();
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
    var cat = new Course();
    cat.getCourse(
        function(err){
            res.status(500);
        },
        {
            _id: req.params.courseId
        },
        function(course){
            res.status(200).json({result:true, course: course});
        }
    );
});

/**
 * PUT
 * enrolling user into a course
 */
router.put('/course/:courseId/enroll', function(req, res, next) {
    if(!req.params.courseId)
        res.status(500).send('parameter not complete');

    if (!req.user)
        res.status(401).send('Unauthorized');

    var catalog = new Course();
    catalog.enroll(
        function failed(err){
            res.status(200).send({result:false, errors:err});
        },
        {id: req.user._id},
        {id: req.params.courseId},
        function (followed) {
            res.status(200).json({result:true, enrollment: followed});
        },
        // isEnrolled -> true
        true);
});

/**
 * PUT
 *
 */
router.put('/course/:courseId/leave', function(req, res, next) {
    if(!req.params.courseId)
        res.status(500).send('parameter not complete');

    if (!req.user)
        res.status(401).send('Unauthorized');

    var catalog = new Course();
    catalog.leave(
        function failed(err){
            res.status(200).send({result:false, errors:err});
        },
        {id: req.user._id},
        {id: req.params.courseId},
        function () {
            res.status(200).json({result:true});
        });
});
module.exports = router;