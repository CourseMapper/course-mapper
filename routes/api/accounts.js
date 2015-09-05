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

router.post('/accounts/login',
    function(req, res, next){
        passport.authenticate('local', function(err, user, info) {
            if (err) {
                // if error happens
                return next(err);
            }

            if (!user) {

                return res.status(401).json({
                    result: false,
                    errors: ['Wrong username or password']
                });

            }

            // if everything is OK
            req.logIn(user, function(err) {
                if (err) {
                    req.session.messages = "Error";
                    return next(err);
                }

                // remember me box is checked
                if (req.body.rememberMe) {
                    req.session.cookie.maxAge = config.get('session.maxAge');
                    req.session._garbage = Date();
                    req.session.touch();
                } else {
                    // it means when the browser is closed, the cookie will expire
                    req.session.cookie.expires = false;
                }

                // set the message and redirect
                req.session.messages = "Login successfully";
                res.status(200).json({
                    result: true,
                    user: req.user
                });
            });
        })(req, res, next);
    }
);

router.get('/accounts/:username', function(req, res, next) {
    if(req.session.passport.user){
        Account.getUser(
            function(err){
                res.status(500).json({result: false, errors: [err.message]});
            },
            {username: req.session.passport.user},
            function(doc){
                if(doc) {
                    res.status(200).json({
                        result: true, user: doc
                    });
                } else {
                    res.status(404).json({
                        result: false, errors: ["User not found"]
                    });
                }
            }
        );
    }
    else
        res.status(401).json({result: false, errors: ['Not authorized']});
});

/**
 * change password only
 */
router.put('/accounts/:userId/changePassword', function(req, res, next){
    if(req.session.passport.user){
        if(req.session.passport.user._id == req.params.userId){
            req.body.userId = Mongoose.Types.ObjectId(req.params.userId);

            if(!req.body.password || !req.body.passwordConfirm) {
                res.status(400).json({result: false, errors:["parameter not complete"]});
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
