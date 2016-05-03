var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var NewsfeedController = require(appRoot + '/modules/applications/newsfeed/newsfeed.controller.js');
var userHelper = require(appRoot + '/modules/accounts/user.helper.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var debug = require('debug')('cm:route');
var router = express.Router();
var mongoose = require('mongoose');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

router.get('/newsfeed/cid/:courseId', helper.l2pAuth, helper.ensureAuthenticated,
    function (req, res, next) {
        if (!req.user)
            return res.status(401).send('Unauthorized');

        userHelper.isEnrolledAsync({
                userId: mongoose.Types.ObjectId(req.user._id),
                courseId: mongoose.Types.ObjectId(req.params.courseId)
            })
            .then(function (isEnrolled) {
                if (!isEnrolled) {
                    return helper.resReturn(helper.createError401(), res);
                }

                var nf = new NewsfeedController();
                nf.getNewsfeed(
                    function (err) {
                        res.status(500).json({
                            result: false,
                            errors: err
                        });
                    },
                    // parameters
                    mongoose.Types.ObjectId(req.params.courseId),

                    function (newsfeeds) {
                        res.status(200).json({
                            result: true, newsfeeds: newsfeeds
                        });
                    }
                );

            })
            .catch(function (err) {
                helper.resReturn(err, res);
            });
    });

router.get('/newsfeed/cid/:courseId/week', helper.l2pAuth, helper.ensureAuthenticated,
    function (req, res, next) {
        if (!req.user)
            return res.status(401).send('Unauthorized');

        userHelper.isEnrolledAsync({
                userId: mongoose.Types.ObjectId(req.user._id),
                courseId: mongoose.Types.ObjectId(req.params.courseId)
            })
            .then(function (isEnrolled) {
                if (!isEnrolled) {
                    return helper.resReturn(helper.createError401(), res);
                }

                var nf = new NewsfeedController();
                nf.getNewsfeedLastWeek(
                    function (err) {
                        res.status(500).json({
                            result: false,
                            errors: err
                        });
                    },
                    // parameters
                    mongoose.Types.ObjectId(req.params.courseId),

                    function (newsfeeds) {
                        res.status(200).json({
                            result: true, newsfeeds: newsfeeds
                        });
                    }
                );

            })
            .catch(function (err) {
                helper.resReturn(err, res);
            });
    });

router.get('/newsfeed/cid/:courseId/today', helper.l2pAuth, helper.ensureAuthenticated,
    function (req, res, next) {
        if (!req.user)
            return res.status(401).send('Unauthorized');

        userHelper.isEnrolledAsync({
                userId: mongoose.Types.ObjectId(req.user._id),
                courseId: mongoose.Types.ObjectId(req.params.courseId)
            })
            .then(function (isEnrolled) {
                if (!isEnrolled) {
                    return helper.resReturn(helper.createError401(), res);
                }

                var nf = new NewsfeedController();
                nf.getNewsfeedToday(
                    function (err) {
                        res.status(500).json({
                            result: false,
                            errors: err
                        });
                    },
                    // parameters
                    mongoose.Types.ObjectId(req.params.courseId),

                    function (newsfeeds) {
                        res.status(200).json({
                            result: true, newsfeeds: newsfeeds
                        });
                    }
                );

            })
            .catch(function (err) {
                helper.resReturn(err, res);
            });
    });

//newsfeed API for content node
router.get('/newsfeed-node/cid/:courseId/nid/:nodeId', helper.l2pAuth, helper.ensureAuthenticated,
    function (req, res, next) {
        var nodeId = mongoose.Types.ObjectId(req.params.nodeId);
        if (!req.user)
            return res.status(401).send('Unauthorized');

        userHelper.isEnrolledAsync({
            userId: mongoose.Types.ObjectId(req.user._id),
            courseId: mongoose.Types.ObjectId(req.params.courseId)
        })
            .then(function (isEnrolled) {
                if (!isEnrolled) {
                    return helper.resReturn(helper.createError401(), res);
                }

                var nf = new NewsfeedController();
                nf.getNewsfeedNode(
                    function (err) {
                        res.status(500).json({
                            result: false,
                            errors: err
                        });
                    },
                    // parameters
                    mongoose.Types.ObjectId(req.params.courseId),
                    nodeId,

                    function (newsfeeds) {
                        res.status(200).json({
                            result: true, newsfeeds: newsfeeds
                        });
                    }
                );

            })
            .catch(function (err) {
                helper.resReturn(err, res);
            });
    });

router.get('/newsfeed-node/cid/:courseId/nid/:nodeId/week', helper.l2pAuth, helper.ensureAuthenticated,
    function (req, res, next) {
        var nodeId = mongoose.Types.ObjectId(req.params.nodeId);
        if (!req.user)
            return res.status(401).send('Unauthorized');

        userHelper.isEnrolledAsync({
                userId: mongoose.Types.ObjectId(req.user._id),
                courseId: mongoose.Types.ObjectId(req.params.courseId)
            })
            .then(function (isEnrolled) {
                if (!isEnrolled) {
                    return helper.resReturn(helper.createError401(), res);
                }

                var nf = new NewsfeedController();
                nf.getNewsfeedNodeLastWeek(
                    function (err) {
                        res.status(500).json({
                            result: false,
                            errors: err
                        });
                    },
                    // parameters
                    mongoose.Types.ObjectId(req.params.courseId),
                    nodeId,

                    function (newsfeeds) {
                        res.status(200).json({
                            result: true, newsfeeds: newsfeeds
                        });
                    }
                );

            })
            .catch(function (err) {
                helper.resReturn(err, res);
            });
    });

router.get('/newsfeed-node/cid/:courseId/nid/:nodeId/today', helper.l2pAuth, helper.ensureAuthenticated,
    function (req, res, next) {
        var nodeId = mongoose.Types.ObjectId(req.params.nodeId);
        if (!req.user)
            return res.status(401).send('Unauthorized');

        userHelper.isEnrolledAsync({
                userId: mongoose.Types.ObjectId(req.user._id),
                courseId: mongoose.Types.ObjectId(req.params.courseId)
            })
            .then(function (isEnrolled) {
                if (!isEnrolled) {
                    return helper.resReturn(helper.createError401(), res);
                }

                var nf = new NewsfeedController();
                nf.getNewsfeedNodeToday(
                    function (err) {
                        res.status(500).json({
                            result: false,
                            errors: err
                        });
                    },
                    // parameters
                    mongoose.Types.ObjectId(req.params.courseId),
                    nodeId,

                    function (newsfeeds) {
                        res.status(200).json({
                            result: true, newsfeeds: newsfeeds
                        });
                    }
                );

            })
            .catch(function (err) {
                helper.resReturn(err, res);
            });
    });

module.exports = router;