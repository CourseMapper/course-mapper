/**
 * /api/accounts/*
 */
var express = require('express');
var passport = require('passport');
var config = require('config');
var mongoose = require('mongoose');

var appRoot = require('app-root-path');
var Account = require(appRoot + '/modules/accounts');
var Course = require(appRoot + '/modules/catalogs/course.controller.js');

var helper = require(appRoot + '/libs/core/generalLibs.js');

var router = express.Router();

router.post('/accounts/signUp', function(req, res, next){

    if(!helper.checkRequiredParams(req.body, ['username', 'email', 'password'], function (err) {
            helper.resReturn(err, res);
        }))return;

    var account = new Account();
    account.signUp(
        function failedSignUp(err){
            helper.resReturn(err, res);
        },
        req.body,
        function successSignUp(user){
            res.status(201).json({
                result: (user),

                user: {
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
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
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    // todo: if admin, can get val from url param

    var account = new Account();
    account.getUser(
        function(err){
            helper.resReturn(err, res);
        },

        {username: req.session.passport.user.username},

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
});

/**
 * change password only
 */
router.put('/accounts/:userId/changePassword', function(req, res, next){
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    req.body.userId = mongoose.Types.ObjectId(req.user._id);

    // todo: if admin, can put val from url param

    if(!req.body.password || !req.body.passwordConfirm) {
        res.status(400).json({result: false, errors:["parameter not complete"]});
        next();
    }
    else {
        var account = new Account();
        account.changePassword(
            function error(err) {
                helper.resReturn(err, res);
            },
            req.body,
            function success(r) {
                res.status(200).json({result: true});
            }
        );
    }
});

router.put('/accounts/:userId', function(req, res, next){
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    req.body.userId = mongoose.Types.ObjectId(req.user._id);

    // todo: if admin, can put val from url param

    var account = new Account();
    account.editAccount(
        function error(err) {
            helper.resReturn(err, res);
        },

        req.body,

        function success(r) {
            res.status(200).json({result: true});
        }
    );
});

router.get('/accounts/:userId/courses', function(req, res, next) {
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    var crs = new Course();

    var userId = mongoose.Types.ObjectId(req.params.userId);

    // todo: if admin, can put val from url param

    crs.getUserCourses(
        function error(err){
            helper.resReturn(err, res);
        },
        { user: userId },
        function success(courses){
            res.status(200).json({result:true, courses:courses});
        }
    );
});

router.get('/accounts/:userId/course/:courseId', function(req, res, next) {
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    var crs = new Course();

    var userId = mongoose.Types.ObjectId(req.params.userId);
    var courseId = mongoose.Types.ObjectId(req.params.courseId);

    // todo: if admin, can put val from url param

    crs.getUserCourses(
        function error(err){
            helper.resReturn(err, res);
        },
        {
            user: userId,
            course: courseId
        },
        function success(courses){
            if(courses.length > 0)
                res.status(200).json({result:true, courses:courses[0]});
            else
                res.status(200).json({result:true, courses:null});
        }
    );
});

module.exports = router;
