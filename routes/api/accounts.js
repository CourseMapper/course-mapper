/**
 * /api/accounts/*
 */
var express = require('express');
var passport = require('passport');
var config = require('config');
var Mongoose = require('mongoose');

var appRoot = require('app-root-path');
var Account = require(appRoot + '/modules/accounts');
var Users = require(appRoot + '/modules/accounts/users.js');
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

router.get('/accounts/login/facebook',
    passport.authenticate('facebook', { scope : ['email','public_profile'] })
);

router.get('/accounts/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect : '/accounts',
        failureRedirect : '/login'
    }),

    // on succes
    function(req,res) {
        // return the token or you would wish otherwise give eg. a succes message
        res.status(200).json({result:true, tokens: JSON.stringify(req.user.access_token)});
    },

    // on error; likely to be something FacebookTokenError token invalid or already used token,
    // these errors occur when the user logs in twice with the same token
    function(err,req,res,next) {
        // You could put your own behavior in here, fx: you could force auth again...
        // res.redirect('/auth/facebook/');
        if(err) {
            res.status(400).json({result: false, errors: [err.message]});
        }
    }
);

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
    if(req.session.passport.user){
        Users.findOne({username: req.session.passport.user.username}, function(err, doc){
            if(err)
                res.status(500).json({result: false, errors: [err.message]});
            else
                res.status(200).json({
                    result:(doc)?true:false, user: {
                        username: doc.username,
                        displayName: doc.displayName,
                        email: doc.email,
                        role: doc.role,
                        _id: doc._id,
                        dateAdded: doc.dateAdded,
                        dateUpdated: doc.dateUpdated
                    }
                });
        });
    }
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

router.put('/accounts/:userId', function(req, res, next){
    if(req.session.passport.user){
        if(req.session.passport.user._id == req.params.userId){
            req.body.userId = Mongoose.Types.ObjectId(req.params.userId);

            var account = new Account();
            account.editAccount(
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
