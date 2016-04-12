/**
 * /api/accounts/*
 */
var express = require('express');
var passport = require('passport');
var config = require('config');
var mongoose = require('mongoose');

var appRoot = require('app-root-path');
var Account = require(appRoot + '/modules/accounts');
var AccountModel = require(appRoot + '/modules/accounts/users.js');
var Users = require(appRoot + '/modules/accounts/users.js');
var Course = require(appRoot + '/modules/catalogs/course.controller.js');

var helper = require(appRoot + '/libs/core/generalLibs.js');

var async = require('asyncawait/async');
var await = require('asyncawait/await');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

var router = express.Router();

router.get('/accounts/logout', function (req, res, next) {
    req.logout();
    res.status(200).json({result: true, message: 'Logged out'});
});

router.get('/accounts/all', function (req, res, next) {
    if (req.user && req.user.role != 'admin') {
        res.status(401).send('Unauthorized');
        return;
    }

    AccountModel.find({role: 'admin'}).exec(function (err, docs) {
        if (err) {
            helper.resReturn(err, res);
            return;
        }

        res.status(200).json({result: true, users: docs});
    });
});

router.delete('/account/:userId', function (req, res, next) {
    if (req.user && req.user.role != 'admin') {
        res.status(401).send('Unauthorized');
        return;
    }

    var uid = mongoose.Types.ObjectId(req.params.userId);
    AccountModel.remove({_id: uid}).exec(function (err, docs) {
        if (err) {
            helper.resReturn(err, res);
            return;
        }

        res.status(200).json({result: true, users: docs});
    });
});

router.get('/account', function (req, res, next) {
    if (req.user)
        res.redirect('/api/account/' + encodeURIComponent(req.user.username));
    else
        res.status(401).json({message: 'Not authorized'});
});

router.get('/accounts/facebook/callback',
    function (req, res, next) {
        var cbNextUrl = '/accounts';
        if (req.session.callbackNextUrl) {
            cbNextUrl = req.session.callbackNextUrl;
        }

        passport.authenticate('facebook', {
            successRedirect: cbNextUrl,
            failureRedirect: '/login'
        })(req, res, next)
    },

    // on succes
    function (req, res) {
        // return the token or you would wish otherwise give eg. a succes message
        res.status(200).json({result: true, tokens: JSON.stringify(req.user.access_token)});
    },

    // on error; likely to be something FacebookTokenError token invalid or already used token,
    // these errors occur when the user logs in twice with the same token
    function (err, req, res, next) {
        // You could put your own behavior in here, fx: you could force auth again...
        // res.redirect('/auth/facebook/');
        if (err) {
            res.status(400).json({result: false, errors: [err.message]});
        }
    }
);

router.get('/accounts/login/facebook',
    function (req, res, next) {
        req.session.callbackNextUrl = '/accounts';

        passport.authenticate('facebook', {
            scope: ['email', 'public_profile'],
            callbackURL: "/api/accounts/facebook/callback"
        })(req, res, next)
    }
);

router.get('/accounts/login/facebook/course/:slug/:cid/:tab',
    function (req, res, next) {
        //course/new/#/cid/5623e9d1e933cd8f8def7529
        req.session.callbackNextUrl = '/course/' + req.params.slug + '/#/cid/' + req.params.cid + '?tab=' + req.params.tab;

        passport.authenticate('facebook', {
            scope: ['email', 'public_profile'],
            callbackURL: "/api/accounts/facebook/callback"
        })(req, res, next)
    }
);

router.get('/accounts/login/facebook/treeNode/:cid/:nid/:tab',
    function (req, res, next) {
        //treeNode/568531cadaa2ec230da4f51c/#/cid/562b7a4cac20d18a063e69f7/nid/568531cadaa2ec230da4f51c?tab=pdf
        req.session.callbackNextUrl = '/treeNode/' + req.params.nid + '/#/cid/' + req.params.cid + '/nid/' + req.params.nid + '?tab=' + req.params.tab;

        passport.authenticate('facebook', {
            scope: ['email', 'public_profile'],
            callbackURL: "/api/accounts/facebook/callback"
        })(req, res, next)
    }
);

/**
 * get user profile detail
 */
router.get('/account/:username', helper.l2pAuth, helper.ensureAuthenticated, function (req, res, next) {
    var account = new Account();
    account.getUser(
        function (err) {
            helper.resReturn(err, res);
        },

        {username: req.user.username},

        function (doc) {
            if (doc) {
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
 * get courses that this user is enrolled to
 */
router.get('/account/:userId/courses', helper.l2pAuth, helper.ensureAuthenticated, function (req, res, next) {
    if (!req.user)
        return res.status(401).send('Unauthorized');

    var crs = new Course();

    var userId = mongoose.Types.ObjectId(req.user._id);

    crs.getUserCourses(
        function error(err) {
            helper.resReturn(err, res);
        },
        {user: userId},
        function success(courses) {
            res.status(200).json({result: true, courses: courses});
        }
    );
});

router.get('/account/:userId/createdCourses', helper.l2pAuth, helper.ensureAuthenticated, function (req, res, next) {
    if (!req.user)
        return res.status(401).send('Unauthorized');

    var crs = new Course();

    var userId = mongoose.Types.ObjectId(req.user._id);

    crs.getCreatedCourses(
        function error(err) {
            helper.resReturn(err, res);
        },
        {userId: userId},
        function success(courses) {
            res.status(200).json({result: true, courses: courses});
        }
    );
});

/**
 * to check is this user is enrolled in this course
 */
router.get('/account/:userId/course/:courseId', helper.l2pAuth, helper.ensureAuthenticated, function (req, res, next) {
    var crs = new Course();

    var userId = mongoose.Types.ObjectId(req.params.userId);
    var courseId = mongoose.Types.ObjectId(req.params.courseId);

    crs.getUserCourses(
        function error(err) {
            helper.resReturn(err, res);
        },
        {
            user: userId,
            course: courseId
        },
        function success(courses) {
            if (courses.length > 0)
                res.status(200).json({result: true, courses: courses[0]});
            else
                res.status(200).json({result: true, courses: null});
        }
    );
});

/**
 * POST
 */

/**
 * sign up
 */
router.post('/accounts/signUp', function (req, res, next) {
    if (!helper.checkRequiredParams(req.body, ['username', 'email', 'password'], function (err) {
            helper.resReturn(err, res);
        }))return;

    var account = new Account();
    account.signUp(
        function failedSignUp(err) {
            helper.resReturn(err, res);
        },
        req.body,
        function successSignUp(user) {
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

router.get('/accounts/reset/:token', function (req, res) {
    Users.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {$gt: Date.now()}
    }, function (err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/accounts/forgot-password?tokenInvalid=1');
        }
        res.render(config.get('theme') + '/resetPassword', {
            user: req.user
        });
    });
});

router.post('/accounts/reset/:token', function (req, res) {
    var op = async(function () {
        var user = await(Users.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {$gt: Date.now()}
        }).exec());

        if (user) {
            var ha = helper.hash(req.body.password, user.salt);
            user.password = ha;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            await(user.save());

            var mailuser = 'postmaster%40sandboxb2cbe702674341fba426875d18e4a8d8.mailgun.org';
            var passw = '354cf7d9174fdc8d277ce93073e6315c';
            var smtpurl = "smtps://" + mailuser + ":" + passw + "@smtp.mailgun.org";
            var smtpTransport = nodemailer.createTransport(smtpurl);

            var mailOptions = {
                to: user.email,
                from: 'sandboxb2cbe702674341fba426875d18e4a8d8.mailgun.org',
                subject: 'Your CourseMapper password has been changed',
                text: 'Hello,\n\n' + 'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };

            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('success', 'Success! Your password has been changed.');
            });
        } else {
            throw helper.createError("User not found");
        }
    });

    op().
        then(function () {
            return res.status(200).json({result: true});
        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });
});

router.post('/accounts/resetPassword', function (req, res, next) {
    var op = async(function () {
        var buf = await(crypto.randomBytes(20));
        var token = buf.toString('hex');

        var user = await(Users.findOne({username: req.body.username}).exec());
        if (user) {
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            await(user.save());

            var mailuser = 'postmaster%40sandboxb2cbe702674341fba426875d18e4a8d8.mailgun.org';
            var passw = '354cf7d9174fdc8d277ce93073e6315c';
            var smtpurl = "smtps://" + mailuser + ":" + passw + "@smtp.mailgun.org";
            var smtpTransport = nodemailer.createTransport(smtpurl);

            var mailOptions = {
                to: user.email,
                from: 'CourseMapper',
                subject: 'CourseMapper Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/api/accounts/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };

            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
            });
        }
    });

    op().
        then(function () {
            return res.status(200).json({result: true});
        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });
});


/**
 * login
 */
router.post('/accounts/login',
    function (req, res, next) {
        passport.authenticate('local', function (err, user, info) {
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
            req.logIn(user, function (err) {
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

/**
 * PUT
 */

/**
 * edit user
 */
router.put('/account/:userId', helper.l2pAuth, helper.ensureAuthenticated, function (req, res, next) {

    req.body.userId = mongoose.Types.ObjectId(req.user._id);

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

module.exports = router;
