var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var Course = require(appRoot + '/modules/catalogs/course.controller.js');
var Account = require(appRoot + '/modules/accounts');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var debug = require('debug')('cm:route');
var moment = require('moment');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();
var router = express.Router();
var mongoose = require('mongoose');

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

/**
 * POST
 * update a course,
 * can take a picture file as well
 */
router.post('/course/:courseId', multipartyMiddleware, function(req, res, next){
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    var catalog = new Course();
    req.body.userId = mongoose.Types.ObjectId(req.user._id);
    req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);

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

    catalog.editCourse(
        function (err) {
            helper.resReturn(err, res);
        },

        // parameters
        req.body,
        req.files,

        function (course) {
            res.status(200).json({result:true, course: course});
        }
    );
});

router.get('/courses', function(req, res, next) {
    var cat = new Course();
    cat.getCourses(
        function(err){
            helper.resReturn(err, res);
        },
        {
            // parameters
        },
        function(courses){
            res.status(200).json({result: true, courses: courses});
        }
    );
});

router.get('/course/:courseId', function(req, res, next) {
    if (!helper.checkRequiredParams(req.params, ['courseId'], function(err){
            helper.resReturn(err, res);
        })) return;

    var cat = new Course();
    cat.getCourse(
        function(err){
            helper.resReturn(err, res);
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
 * GET
 * check username if exist
 */
router.get('/course/:courseId/checkUsername/:username', function(req, res, next){
    if (!req.user)
        return res.status(401).send('Unauthorized');

    var catalog = new Course();

    var courseId = mongoose.Types.ObjectId(req.params.courseId);
    var userId = mongoose.Types.ObjectId(req.user._id);

    catalog.checkUsername(
        function failed(err){
            helper.resReturn(err, res);
        },

        {
            userId: userId,
            courseId: courseId,
            username: req.params.username
        },

        function (user) {
            res.status(200).json({
                result: true, user: user
            });
        });
});

/**
 * PUT
 * enrolling user into a course
 */
router.put('/course/:courseId/enroll', function(req, res, next) {
    if (!req.user)
        return res.status(401).send('Unauthorized');

    var catalog = new Course();

    var uid = mongoose.Types.ObjectId(req.user._id);
    var courseId = mongoose.Types.ObjectId(req.params.courseId);

    catalog.enroll(
        function failed(err){
            helper.resReturn(err, res);
        },

        {id: uid},
        {id: courseId},

        function (followed) {
            res.status(200).json({result:true, enrollment: followed});
        },
        // isEnrolled -> true
        true);
});

/**
 * PUT
 * leave course
 */
router.put('/course/:courseId/leave', function(req, res, next) {
    if (!req.user)
        res.status(401).send('Unauthorized');

    var uid = mongoose.Types.ObjectId(req.user._id);
    var courseId = mongoose.Types.ObjectId(req.params.courseId);

    var catalog = new Course();
    catalog.leave(
        function failed(err){
            helper.resReturn(err, res);
        },

        {id: uid},
        {id: courseId},

        function () {
            res.status(200).json({result:true});
        });
});

/**
 * PUT
 * add a username as a manager into a course
 */
router.put('/course/:courseId/addManager', function(req, res, next){
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    req.body.createdBy = mongoose.Types.ObjectId(req.user._id);
    req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);

    var catalog = new Course();

    // format the tags data structure
    if(req.body.managers) {
        // because the data is in {text:the-tag} format. let's just get the values.
        var managerSlugs = JSON.parse(req.body.managers);
        req.body.managers = managerSlugs;
    }

    catalog.addManager(
        function (err) {
            helper.resReturn(err, res);
        },

        // parameters
        req.body,

        function (course) {
            res.status(200).json({result:true, course: course});
        }
    );
});

module.exports = router;