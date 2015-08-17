/**
 * /api/accounts/*
 */
var express = require('express');
var passport = require('passport');
var config = require('config');
var Mongoose = require('mongoose');

var appRoot = require('app-root-path');
var Account = require(appRoot + '/modules/accounts');
var Course = require(appRoot + '/modules/catalogs/course.controller.js');
var router = express.Router();

router.post('/accounts/signUp', function(req, res, next){
    var account = new Account();
    account.signUp(
        function failedSignUp(err){
            res.status(500).json(err);
        },
        req.body,
        function successSignUp(user){
            res.status(201).json({user: user.username});
        }
    );
});

router.get('/accounts/logout', function(req, res, next) {
    req.logout();
    res.status(200).json({result:true, message: 'Logged out'});
});


router.get('/accounts', function(req, res, next) {
    if(req.user)
        res.redirect('/api/accounts/' + req.user.username);
    else
        res.status(401).json({message: 'Not authorized'});
});

router.post('/accounts/login', passport.authenticate('local'),
    function(req, res) {
        // If this function gets called, authentication was successful.
        // 'req.user' contains the authenticated user.
        res.status(200).json({
            result: true,
            username: req.user.username
        });
    }
);

router.get('/accounts/:username', function(req, res, next) {
    if(req.session.passport.user)
        res.status(200).json(req.session.passport.user);
    else
        res.status(401).json({message: 'Not authorized'});
});

/**
 * change password only
 */
router.put('/accounts/:userId/changePassword', function(req, res, next){
    if(req.session.passport.user){
        if(req.session.passport.user._id == req.params.userId){
            req.body.userId = Mongoose.Types.ObjectId(req.params.userId);

            if(!req.body.password || !req.body.passwordConfirm) {
                res.status(500).json({result: false, errors:["parameter not complete"]});
                next();
            }
            else {
                var account = new Account();
                account.changePassword(
                    function error(err) {
                        res.status(500).json({result: false, errors: [err]});
                    },
                    req.body,
                    function success(r) {
                        res.status(200).json({result: true});
                    }
                );
            }
        }
    }
});

router.get('/accounts/:userId/courses', function(req, res, next) {
    if(req.session.passport.user) {
        var crs = new Course();
        crs.getUserCourses(
            function error(err){
                res.status(200).json({result:false, message:err});
            },
            { user: req.params.userId },
            function success(courses){
                res.status(200).json({result:true, courses:courses});
            }
        );
    }
    else
        res.status(401).json({message: 'Not authorized'});
});

router.get('/accounts/:userId/course/:courseId', function(req, res, next) {
    if(req.session.passport.user){
        var crs = new Course();
        crs.getUserCourses(
            function error(err){
                res.status(200).json({result:false, message:err});
            },
            {
                user: req.params.userId,
                course: req.params.courseId
            },
            function success(courses){
                if(courses.length > 0)
                    res.status(200).json({result:true, courses:courses[0]});
                else
                    res.status(200).json({result:true, courses:null});
            }
        );
    }
    else
        res.status(401).json({message: 'Not authorized'});
});

module.exports = router;
